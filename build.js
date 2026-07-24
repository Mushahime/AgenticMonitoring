// Build script: reassembles src/ into the full site (for GitHub Pages) and
// a stripped variant (for publishing to the Claude Artifact, which requires
// a single self-contained fragment: no <!doctype>/<html>/<head>/<body> tags,
// and no PWA-only meta/link tags since those are GitHub-Pages-only concerns).
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const pageOrder = JSON.parse(fs.readFileSync(path.join(SRC, 'page-order.json'), 'utf8'));

const read = (name) => fs.readFileSync(path.join(SRC, name), 'utf8');

const head = read('head.html');
const shellTop = read('shell-top.html');
const footer = read('footer.html');
const style = read('style.css');
const script = read('script.js');
const pages = pageOrder.map(id => read(path.join('pages', id + '.html'))).join('\n\n');

// ---------- full site (GitHub Pages) ----------
const full = [
  head,
  '<style>\n' + style + '\n</style>\n</head>\n<body>\n',
  shellTopBodyOnly(shellTop),
  pages,
  footer,
  '\n<script>\n' + script + '\n</script>\n</body>\n</html>\n',
].join('\n');

function shellTopBodyOnly(s) {
  // shell-top.html already includes "</head>\n<body>\n\n<div class=topbar>...";
  // for the full build we've already emitted </head><body> above, so strip the
  // leading "</head>\n<body>\n" from shell-top.html to avoid duplicating it.
  return s.replace(/^\s*<\/head>\s*<body>\s*/, '');
}

fs.writeFileSync(path.join(__dirname, 'index.html'), full);

// ---------- copy assets/ next to index.html so relative src="assets/..." refs resolve ----------
const rootAssetsDir = path.join(__dirname, 'assets');
fs.mkdirSync(rootAssetsDir, { recursive: true });
for (const file of fs.readdirSync(path.join(SRC, 'assets'))) {
  fs.copyFileSync(path.join(SRC, 'assets', file), path.join(rootAssetsDir, file));
}

// ---------- Artifact-ready fragment (no doctype/html/head/body) ----------
const titleMatch = head.match(/<title>[\s\S]*?<\/title>/);
const title = titleMatch ? titleMatch[0] : '<title>Watch - Agentic Commerce &amp; Payments</title>';

let artifact = [
  title,
  '<style>\n' + style + '\n</style>',
  shellTopBodyOnly(shellTop),
  pages,
  footer,
  '\n<script>\n' + script + '\n</script>',
].join('\n');

// The Artifact publish target can't load external files (CSP blocks it),
// so re-inline every assets/*.png|jpg reference as a base64 data: URI just
// for this build output. GitHub Pages' index.html above keeps real file refs.
const assetsDir = path.join(SRC, 'assets');
artifact = artifact.replace(/src="assets\/([^"]+)"/g, (full, filename) => {
  const filePath = path.join(assetsDir, filename);
  const ext = path.extname(filename).slice(1);
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const b64 = fs.readFileSync(filePath).toString('base64');
  return `src="data:image/${mime};base64,${b64}"`;
});

fs.writeFileSync(path.join(__dirname, 'dist-artifact.html'), artifact);

console.log('Wrote index.html (' + full.length + ' bytes) for GitHub Pages');
console.log('Wrote dist-artifact.html (' + artifact.length + ' bytes) for the Claude Artifact publish step');
