# Fight Night — the motion pass

**Date:** 2026-09-27 · **Status:** approved by Leo, in build on branch `motion`

## Goal

Make the five pages move like a produced fight broadcast — a showreel-grade
motion layer — and fix what the audit turned up along the way. Content,
copy and brand rules stay as they are unless listed under Fixes.

The one idea every effect serves: **photographs rest in black and white,
and colour comes back only when you touch them.** That rule already exists
(tile and gallery hover, lightbox); this pass makes it the signature.

## Constraints

- Build-free stays. No npm, no bundler. Libraries are vendored as plain
  files in `assets/vendor/` and loaded with `defer`. No runtime CDN request.
- Progressive enhancement: `site.js` keeps every function working if the
  motion layer never loads. Content is visible with JS off.
- Motion animates `transform` and `opacity` only (WEB-BUILDS). The existing
  hover `filter` blooms are the documented exception, and remain one.
- `prefers-reduced-motion: reduce` gets a complete static site: no intro,
  no smooth scroll, no marquee drift, no scrub, no cursor effects, and
  everything visible immediately.
- Phones (`hover: none` or `pointer: coarse`) get the lighter set: no
  smooth scroll, no cursor labels, no magnetic pull, no torch.
- Brand: `--blood` stays an accent — never large fills, never body text.
  Rooms on `/stay/` keep their colour exemption. Hero desktop crop and
  "photo as shot, no overlay at rest" are untouched.
- Nothing pushes to `master` (Vercel deploys production on push).

## Stack

- GSAP 3.15 core + ScrollTrigger + SplitText + Flip + CustomEase — free for
  commercial use since 3.13.
- Lenis 1.3 — smooth scroll, desktop pointer only.
- `assets/motion.js` — all choreography, one module per component, each
  guarded by an element check (same pattern as `site.js`).
- `assets/motion.css` — motion-only styles and the hidden start states,
  all scoped under `html.motion` so nothing hides without the motion layer.
- Cross-document View Transitions (CSS only) for page-to-page changes;
  browsers without support navigate normally.

Anti-flash: an inline `<head>` snippet adds `motion` to `<html>` when motion
is allowed. A CSS fail-safe reveals hidden start states after 4s if
`motion.js` never runs.

## Restraint (frontend-design review, 2026-09-27)

One loud moment — the home intro. Everything else answers a person's action
or carries information (progress, live status, what changed). Body copy does
not dance: paragraphs arrive with their heading, quickly, never one by one.
Revised from the approved list: no hero mouse depth; no giant footer
wordmark (the ropes replace it); no route numbering; quote as a combination
rather than a word-by-word scrub.

## Motion language

| Token | Use |
|---|---|
| `punch` — fast in, small overshoot, hard settle | headlines, stamps, buttons |
| `rope` — expo in-out | wipes, curtains, rules drawing |
| `settle` — power3 out | camera push-ins, parallax, fades |

Durations: micro .2–.35s · UI .45–.6s · section reveals .9–1.2s · home
intro ≈ 2.2s total.

## Global

- **Page transitions** — outgoing page drops back and dims, incoming page
  rises over it with a red rope edge. Nav holds still across the change.
- **Nav** — red scroll-progress rope along its bottom edge; a sliding
  underline follows the hovered link and returns to the current page;
  magnetic Book button.
- **Mobile menu** — panel wipes down, links rise from masks in sequence,
  burger lines morph to X. Adds a focus trap.
- **Buttons** — fill sweeps in from the left on hover, label rolls up,
  magnetic pull on desktop.
- **Reveals** — headings rise line by line from masks; eyebrow rules draw
  before their label; paragraphs rise in sequence; framed photos wipe open
  with counter-parallax; ropes dividers draw their red section.
- **Footer curtain** — the page lifts away to uncover the footer.
- **Ring ropes** — every `.ropes` divider is a set of real ropes: they twang
  once as they enter the viewport and wobble when the pointer (or a finger)
  crosses them.
- **Cursor labels** (desktop) — VIEW / DRAG / OPEN disc over the gallery,
  room strips and route rows only. The system cursor stays.
- **Grain** — the existing film grain jitters (desktop only).
- **Live status** — "Open now · closes 20:00" / "Closed · opens Sat 08:00",
  computed in Asia/Bangkok time from the published hours (Sat–Thu
  08:00–20:00, classes 08:00–10:00 and 16:00–18:00, closed Friday).

## Home

- **Intro (first visit per session)** — black; a red rope draws across and
  splits open onto the hero. Headline lines punch up from masks, the red
  line lands with a micro camera shake; rule draws, lead and CTAs follow.
  Later visits skip the curtain and run a shorter headline entrance. This
  replaces the per-letter wipe from `hero-split.js`, which is retired.
- **Hero scroll** — photo pushes in and drifts; headline lines peel away at
  different speeds; the bottom group fades.
- **Marquee** — new kinetic band under the hero strip: outlined Anton
  phrases already on the site (Muay Thai · Ao Nang, Krabi · First-timer to
  pro · Sat–Thu 08:00–20:00) with the fighter mark between them. Direction
  and speed follow scroll velocity.
- **The gym** — line-masked headline, framed photo wipe + parallax, stats
  rise in sequence, live status in the Open stat.
- **Fight band** — opens like a letterbox as it enters; the line rises word
  by word; desktop cursor torch shows the photo in colour under the pointer.
- **Quote** — lands like a pad combination: phrases snap in one strike at a
  time as it scrolls through, each strike jolting the block; the red rule
  draws down.
- **Where to next** — becomes a typographic index of the four pages (no
  numbering: they are not a sequence). Desktop: the row's photo follows the
  cursor, in colour. Touch: thumbnails inline. The section drops its forced
  full-screen height.

## Training

- Page head: headline rises from masks, photo pushes in on scroll.
- Price rows slide in along their hairlines; prices roll into place like an
  odometer.
- Week strip flips in like a departure board; today is marked, with a live
  "class on now" / "next class" line; Friday's strike draws across.
- Package matrix: row + column crosshair on hover and focus.
- Round tiles wipe open, photo parallax inside; existing colour bloom kept.
- Beach band opens like a letterbox.

## Stay

- Room strips: drag to scroll with momentum (desktop), prev/next buttons,
  progress line; photos open in the lightbox (shared with the gallery).
- Framed photo wipe + parallax.

## Gallery

- Filter chips — All 26 · Training 14 · Fight nights 6 · Team 6 — re-sort
  with Flip.
- Tiles wipe open column by column; existing tilt and colour bloom kept.
- Lightbox: the photo flies from its tile to full view and blooms to colour
  on the way; prev/next slide with direction; swipe on touch; neighbours
  preloaded.

## Find us

- Icons draw themselves in; live open/closed status in the hours row.
- Map card gains a pin reticle with the coordinates (8.0311° N,
  98.8555° E) that tightens on hover.

## Fixes

1. Lemon Milk font files (personal-use licence) are publicly served from
   production. Move them out of `Website/` into `asset/` and untrack.
2. `.reveal` blocks are invisible without JS. Hidden states move under
   `html.motion`.
3. `/find-us/`: duplicate `</main>`; `<dl>` rows hold non-dt/dd children.
4. `/training/`: headings jump h1 → h3; "Ask for prices" CTA sits under the
   published prices — becomes "Reserve your place" with a reservation
   prefill.
5. Home "Where to next" forced to 100svh → dead gap.
6. `/stay/` room photos cannot be opened; mobile menu has no focus trap;
   lightbox has no swipe.
7. Dead CSS and orphaned section comments from the one-pager split.
8. `<meta name="color-scheme" content="dark">` missing.

Flagged, not changed: the 【CONFIRM: fight record】 marker is visible on
production — the fact has to come from Thewaritnoi.

## Verification

- Every page at 390 / 768 / 1024 / 1440: end-state screenshots, no
  horizontal overflow, no broken images, no console errors.
- Motion checked frame by frame (GSAP timeline seeking under CDP) and
  recorded as a scroll-through video per page.
- `prefers-reduced-motion: reduce` and JS-off runs: all content visible.
- Keyboard pass: menu trap, lightbox, filters, matrix focus.
