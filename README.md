# Agentic Monitoring

A daily watch on agentic commerce and payments: protocols, payment networks, market data, research (arXiv/SSRN/institutional), public LinkedIn signals, a historical timeline, and trust layers (FACT, ATLAS) shaping how AI agents discover, negotiate, and pay.

## Live site

```
https://mushahime.github.io/AgenticMonitoring/
```

## Sections

Home · This Fortnight · Timeline · Network & Payments · Emerging Rails & Stablecoins · Commerce · Market · Research · LinkedIn · Protocols · More (Perplexity · FACT · ATLAS · Archive)

## Tech stack

Plain HTML/CSS/JS — no framework, no backend, no database, no REST API. The only tooling is a small Node.js script (`build.js`, built-in `fs`/`path` modules only, zero npm dependencies) that concatenates the split source files into the two files that actually get deployed. Node is used purely as a local build tool here, not as a server.

## Structure

```
src/
  pages/*.html      one file per site section (edit these)
  style.css         all CSS
  script.js         all JS (hash routing, "More" dropdown, Timeline expand/filter)
  head.html, shell-top.html, footer.html, tail.html, page-order.json
                     shell/scaffolding around the pages, rarely touched
assets/*.png, *.jpg  real image files (logos, hero banner, PWA icons), semantically named
build.js             reassembles src/ into the two files below — run `node build.js` after any edit
index.html           GENERATED — full document with real asset references, served by GitHub Pages
dist-artifact.html   GENERATED — single self-contained fragment (images inlined as base64),
                     published to the Claude Artifact, which can't load external files
manifest.json, robots etc.
```

`index.html` and `dist-artifact.html` are build output — never edit them directly, edit the `src/` files and re-run `node build.js`.

## Maintenance

The canonical, auto-refreshed copy lives on Claude as a published Artifact, updated daily at 08:00 Paris time by an automated routine: it edits the relevant `src/pages/*.html` file(s), runs the build, publishes `dist-artifact.html` to the Artifact, and commits the change locally. It does **not** push to GitHub — pushing (and therefore updating this live GitHub Pages copy) is a manual step the repo owner does himself.

---

Made by Noam C. &middot; agentic payment & commerce strategic consultant
