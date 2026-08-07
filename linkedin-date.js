#!/usr/bin/env node
/**
 * Resolve the exact publication date of a LinkedIn post from its URL.
 *
 * Why this exists: search snippets never show a real date for LinkedIn
 * results, and WebFetch only gives a relative marker ("3w"), which is both
 * imprecise and easy to leave unconverted. The daily routine kept falling
 * back to printing the author's name instead of a date, which pushed those
 * cards into the undated bucket at the bottom of the page - where the
 * two-month freshness rule could no longer see them, so genuinely stale
 * posts survived for months (found two on 2026-08-07: May 18 and Apr 23).
 *
 * A LinkedIn activity id is a 64-bit value whose first 41 bits are the
 * post's creation time in Unix milliseconds. Shifting right by 22 recovers
 * it exactly, with no network call and nothing to bot-block.
 *
 * Validated 2026-08-07 against three cards whose dates were already known
 * and correct on the site: Aug 4, Jul 30 and Jul 28, 2026 - all three
 * matched to the day.
 *
 * Usage:
 *   node linkedin-date.js <url-or-id> [<url-or-id> ...]
 *
 * Prints one "YYYY-MM-DD  Mon D, YYYY  <input>" line per argument, which is
 * the exact string to put in the card's date field.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function activityIdFrom(arg) {
  // Accept a bare id, or any LinkedIn URL containing activity-<id> / :activity:<id>
  const m = String(arg).match(/(?:activity[-:])(\d{15,25})/) || String(arg).match(/^(\d{15,25})$/);
  return m ? m[1] : null;
}

function dateFromActivityId(id) {
  const ms = BigInt(id) >> 22n;
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: node linkedin-date.js <linkedin-post-url-or-activity-id> ...');
  process.exit(1);
}

let failed = 0;
for (const arg of args) {
  const id = activityIdFrom(arg);
  if (!id) {
    console.log(`??          could not find an activity id in: ${arg}`);
    failed = 1;
    continue;
  }
  const d = dateFromActivityId(id);
  if (!d) {
    console.log(`??          activity id did not decode to a valid date: ${arg}`);
    failed = 1;
    continue;
  }
  const iso = d.toISOString().slice(0, 10);
  const pretty = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  console.log(`${iso}  ${pretty.padEnd(14)}  ${arg}`);
}
process.exit(failed);
