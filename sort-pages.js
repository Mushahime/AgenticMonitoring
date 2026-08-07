// Deterministic date-sort for the page fragments in src/pages/, run automatically
// by build.js before every assembly. This exists so ordering is guaranteed by code,
// not by an AI-driven routine remembering to re-sort every time it adds/removes/
// clears a badge on an item (that reliance on prompt-following is what caused a
// real incident: lists silently drifted out of date order over several runs because
// new items were inserted at the top instead of into their correct position).
const fs = require('fs');
const path = require('path');

const MONTHS = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };

// Returns [sortKey, isVague]. isVague=true for month-only/bare-year dates or any
// non-date text (e.g. a LinkedIn author name with no confirmed date) - vague always
// sorts after precise dates, regardless of its literal value.
function parseDateKey(str) {
  if (!str) return [-Infinity, true];
  str = str.trim();
  let m = str.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s*(\d{4})?$/); // "Jul 28, 2026" / "Jul 28"
  if (m && MONTHS[m[1]]) {
    const year = m[3] ? parseInt(m[3]) : 2026;
    return [year * 10000 + MONTHS[m[1]] * 100 + parseInt(m[2]), false];
  }
  m = str.match(/^([A-Za-z]{3})\s+(\d{4})$/); // "Jun 2026"
  if (m && MONTHS[m[1]]) return [parseInt(m[2]) * 10000 + MONTHS[m[1]] * 100, true];
  m = str.match(/^(\d{4})$/); // bare "2026"
  if (m) return [parseInt(m[1]) * 10000, true];
  // date ranges, e.g. "Aug 1-2, 2026", "Oct 18-21, 2026", "Sep 28 - Oct 1, 2026" -
  // sort by the range's start date; still precise (not vague), just not a single day
  m = str.match(/^([A-Za-z]{3})\s+(\d{1,2})\s*-\s*(?:[A-Za-z]{3}\s+)?\d{1,2},?\s*(\d{4})?$/);
  if (m && MONTHS[m[1]]) {
    const year = m[3] ? parseInt(m[3]) : 2026;
    return [year * 10000 + MONTHS[m[1]] * 100 + parseInt(m[2]), false];
  }
  return [-Infinity, true];
}

function sortBlocks(content, blockRegexSrc, dateRegexSrc, { ascending = false, vagueToBottom = true } = {}) {
  const blockRe = new RegExp(blockRegexSrc, 'g');
  const dateRe = new RegExp(dateRegexSrc);
  const blocks = [];
  let m, lastIndex = 0, headerEnd = null;
  while ((m = blockRe.exec(content))) {
    if (headerEnd === null) headerEnd = m.index;
    blocks.push(m[0]);
    lastIndex = blockRe.lastIndex;
  }
  if (blocks.length === 0) return content; // nothing matched, leave untouched

  const header = content.slice(0, headerEnd);
  const footer = content.slice(lastIndex);
  const withKeys = blocks.map(b => {
    const dm = b.match(dateRe);
    const [key, vague] = parseDateKey(dm ? dm[1] : null);
    return { b, key, vague };
  });
  withKeys.sort((a, c) => {
    if (vagueToBottom && a.vague !== c.vague) return a.vague ? 1 : -1;
    return ascending ? a.key - c.key : c.key - a.key;
  });
  return header + withKeys.map(x => x.b).join('') + footer;
}

// Protocols needs special handling: only the "New on Protocols" block is date-sorted;
// "Major protocols" below it is a stable curated list left untouched. Date must be read
// ONLY from each row's <span class="org"> field, never from its free-text description
// (a past incident: "WAIC 2026" inside a pdesc got misread as that row's date).
function sortProtocols(content) {
  const newIdx = content.indexOf('<h2>New on Protocols</h2>');
  const majorIdx = content.indexOf('<h2>Major protocols</h2>');
  if (newIdx === -1 || majorIdx === -1 || majorIdx < newIdx) return content;

  const before = content.slice(0, newIdx);
  const section = content.slice(newIdx, majorIdx);
  const after = content.slice(majorIdx);

  const blockRe = /<div class="proto-row">[\s\S]*?<\/div>\s*\n?/g;
  const blocks = [];
  let m, lastIndex = 0, headerEnd = null;
  while ((m = blockRe.exec(section))) {
    if (headerEnd === null) headerEnd = m.index;
    blocks.push(m[0]);
    lastIndex = blockRe.lastIndex;
  }
  if (blocks.length === 0) return content;

  const sectionHeader = section.slice(0, headerEnd);
  const sectionFooter = section.slice(lastIndex);
  const withKeys = blocks.map(b => {
    const orgMatch = b.match(/class="org">([\s\S]*?)<\/span>/);
    const orgText = orgMatch ? orgMatch[1] : '';
    const all = [...orgText.matchAll(/([A-Za-z]{3}\s+\d{1,2},?\s*\d{4}|[A-Za-z]{3}\s+\d{4})/g)];
    const dateStr = all.length ? all[all.length - 1][1] : null;
    const [key, vague] = parseDateKey(dateStr);
    return { b, key, vague };
  });
  withKeys.sort((a, c) => {
    if (a.vague !== c.vague) return a.vague ? 1 : -1;
    return c.key - a.key;
  });
  return before + sectionHeader + withKeys.map(x => x.b).join('') + sectionFooter + after;
}

// Sorts blocks independently within each occurrence of a container marker (e.g. each
// "<div class="grid">"), never merging items across separate containers. Doesn't try
// to locate the container's closing tag (fragile with nested divs like .card-head) -
// instead treats "up to the next marker, or end of file" as that container's span,
// which is safe because sortBlocks only touches the specific blocks it matches inside
// that span and leaves everything else (including the real closing tags) untouched.
// Needed for Events, which has two distinct grids ("Coming up" / "Major events") that
// must stay separate even though both sort the same way (soonest-first).
function sortWithinContainers(content, marker, blockRegexSrc, dateRegexSrc, opts = {}) {
  const idxs = [];
  let idx = content.indexOf(marker);
  while (idx !== -1) { idxs.push(idx); idx = content.indexOf(marker, idx + marker.length); }
  if (idxs.length === 0) return content;
  let result = content.slice(0, idxs[0]);
  for (let i = 0; i < idxs.length; i++) {
    const start = idxs[i];
    const end = i + 1 < idxs.length ? idxs[i + 1] : content.length;
    result += sortBlocks(content.slice(start, end), blockRegexSrc, dateRegexSrc, opts);
  }
  return result;
}

function sortAllPages(pagesDir) {
  const jobs = [
    ['network.html', '<div class="grid">', '<article class="card">[\\s\\S]*?<\\/article>\\s*\\n?', 'card-date">([^<]*)<', {}],
    ['crypto.html', '<div class="grid">', '<article class="card">[\\s\\S]*?<\\/article>\\s*\\n?', 'card-date">([^<]*)<', {}],
    ['commerce.html', '<div class="grid">', '<article class="card">[\\s\\S]*?<\\/article>\\s*\\n?', 'card-date">([^<]*)<', {}],
    ['market.html', '<div class="grid">', '<article class="card">[\\s\\S]*?<\\/article>\\s*\\n?', 'card-date">([^<]*)<', {}],
    ['linkedin.html', '<div class="grid">', '<article class="card li-card">[\\s\\S]*?<\\/article>\\s*\\n?', 'class="author">([^<]*)<', {}],
    // \s*\n? not \n?: these files are checked out with CRLF, so a bare \n? never
    // matches after the \r and the line breaks between rows fall outside every
    // block, getting dropped at reassembly. No content is lost (all rows survive)
    // but the whole digest collapses onto one 12k-character line, which makes the
    // source and every future diff unreadable. The other jobs below already end
    // with \s*\n? and were never affected.
    ['fortnight.html', '<div class="digest">', '<div class="digest-row">.*?<\\/div>\\s*\\n?', 'digest-date">([^<]*)<', {}],
    ['events.html', '<div class="grid">', '<article class="card">[\\s\\S]*?<\\/article>\\s*\\n?', 'card-date">([^<]*)<', { ascending: true }],
  ];
  for (const [file, marker, blockRe, dateRe, opts] of jobs) {
    const p = path.join(pagesDir, file);
    if (!fs.existsSync(p)) continue;
    const before = fs.readFileSync(p, 'utf8');
    const after = sortWithinContainers(before, marker, blockRe, dateRe, opts);
    if (after !== before) fs.writeFileSync(p, after);
  }
  const protoPath = path.join(pagesDir, 'protocols.html');
  if (fs.existsSync(protoPath)) {
    const before = fs.readFileSync(protoPath, 'utf8');
    const after = sortProtocols(before);
    if (after !== before) fs.writeFileSync(protoPath, after);
  }
}

module.exports = { sortAllPages, parseDateKey };
