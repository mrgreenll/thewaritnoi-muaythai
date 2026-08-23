# Split the one-pager into five pages

**Date:** 2026-08-23 · **Status:** approved, in build

## Problem

Prices sit at 59% of the page and the schedule at 53% — roughly eight
screens of scrolling on mobile. Visitors deciding whether to train leave
before reaching the two facts they came for.

Page count is not the cure on its own. The fix is that **prices are one
click from the hero**; splitting is the means.

## Pages

| Page | URL | Content |
|---|---|---|
| Home | `/` | Hero · the gym story + stat strip · photo band · student quote · four route cards · footer |
| Training | `/training/` | **Prices first** · schedule · what a round looks like (4 cards) · photo band |
| Stay | `/stay/` | Both room types · rates · WhatsApp CTA |
| Gallery | `/gallery/` | Full grid + lightbox |
| Find us | `/find-us/` | Address · hours · phone · map |

Deliberate re-order: prices and schedule move above the round breakdown
on Training. Hero CTA changes "See training" → "See prices" → `/training/`.

All content is relocated, not rewritten. New copy is limited to the four
route cards on Home and five short page-intro headers.

## Architecture

Build-free, per Leo (2026-08-23). No npm, no build step; Vercel deploys
the folder as-is.

- `assets/site.css` — all CSS extracted once, cached across pages
- `assets/site.js` — nav state, reveal observer, FAB, year stamp;
  gallery/lightbox guarded behind an `#grid` existence check
- Header/footer markup duplicated in each of the five files. This is the
  accepted cost of staying build-free. `aria-current="page"` marks the
  active nav item.
- Asset paths root-relative (`/assets/…`) so subfolder depth is not a
  factor. Consequence: pages must be served, not opened via `file://`.
  `serve.mjs` already covers local work.

## Also required

- Per-page `<title>`, description and OG tags. Inheriting one set across
  five pages would make findability worse than the one-pager.
- `sitemap.xml`.
- `PLACEHOLDERS.md` currently indexes the nine `【CONFIRM】` markers by
  line number (`index.html:1008`). Every one breaks on split. Rewrite to
  page + section references.

## Verification

Every page screenshotted at 320 / 390 / 1440, checked for horizontal
overflow. All internal links resolved. No `【CONFIRM】` marker lost.
