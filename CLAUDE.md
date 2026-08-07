# Working rules for this repo

These are repo-level conventions, loaded automatically in any session working
in this checkout. They do not replace the daily routine's own prompt, which
remains the authority on editorial policy (recency windows, what to add, badge
hygiene). What follows is the mechanical stuff that belongs with the code.

## Dating a LinkedIn post: use the decoder, never guess

**Always run `node linkedin-date.js <post-url>` before putting a LinkedIn card
on the site.** It prints the exact calendar date.

A LinkedIn activity id (the digits in `...-activity-<id>-xxxx`) is a 64-bit
value whose first 41 bits are the post's creation time in Unix milliseconds,
so the date is recoverable offline: no network call, no bot-blocking, no
ambiguity. Validated 2026-08-07 against three cards whose dates were already
known and correct (Aug 4, Jul 30, Jul 28 - all exact to the day).

```bash
node linkedin-date.js "https://www.linkedin.com/posts/someone_slug-activity-7483505953628147713-0zuF"
# 2026-07-16  Jul 16, 2026    https://www.linkedin.com/posts/...
```

Rules that follow from this:

- **A card's date field always holds an absolute date.** Never write an
  author's name there as a stand-in for a date you did not resolve.
- WebFetch on a `linkedin.com/posts/...` URL does work for public posts and is
  a fine way to read the post's text and author, but it only yields a
  *relative* marker ("3w"). A relative marker is not a date: convert it
  against today's date, or better, use the decoder.
- An undated card is not a cosmetic problem. Undated items sort to the bottom
  of the LinkedIn page, where the two-month freshness rule cannot see them, so
  stale posts survive indefinitely. Two were found on 2026-08-07 dating from
  May 18 and Apr 23.
- Every run, re-check any card still showing an author instead of a date and
  resolve it with the decoder.
- The decoder also catches wrong dates on cards that cite a LinkedIn post from
  another page. It caught one on 2026-08-07: the Network page's Swiss Visa
  card said Jul 20 for a post actually published Jul 15.

## Build

`node build.js` regenerates `index.html` (GitHub Pages) and
`dist-artifact.html` (the Claude Artifact). It calls `sort-pages.js` first,
which re-sorts every page's cards by date in place, so **it rewrites files
under `src/pages/`** - expect them in your diff even if you only edited one.

These files are checked out with CRLF endings. Any block regex added to
`sort-pages.js` must therefore end with `\s*\n?`, never a bare `\n?`: a bare
`\n?` never matches after the `\r`, the line breaks fall outside every matched
block and get dropped at reassembly, and the whole section collapses onto one
enormous line. No content is lost and the rendered site is unaffected, but the
source and every future diff become unreadable. Fixed for the fortnight job on
2026-08-07; the other jobs were already correct.

## Landing work on main

The daily cloud routine cannot push to `main` directly: a cloud session works
on its own output branch and the credential proxy scopes its push to that
branch. `.github/workflows/land-on-main.yml` fast-forwards `main` onto any
`claude/**` branch as soon as it is pushed, then deletes the branch and asks
GitHub Pages to rebuild. Do not remove the explicit Pages build request in
that workflow: a push authenticated with `GITHUB_TOKEN` does not trigger the
Pages build on its own, so without it `main` moves while the live site stays
on the previous edition.
