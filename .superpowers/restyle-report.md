# Restyle report — Fenriz-inspired editorial pass

Date: 2026-08-22 · Branch `master` · `index.html` only · committed, not pushed.

Three briefed changes, nothing else. Every existing section, all 9 `【CONFIRM】`
markers, all 7 WhatsApp CTAs and the WORK THE ROUND hero copy/CTAs are byte-identical
to the baseline (verified by grep count against `git show HEAD:index.html`).

---

## 1 · Training section → stencil photo tiles

`.cards` / `.card` (icon + heading + paragraph boxes) deleted entirely and replaced with
`.tt-grid` / `.tt-item` / `.tt`.

- **Layout:** 2×2 at ≥701px, **1 column below 700px**. Judged 1-col over 2-col on mobile
  because the Anton label is the point of the tile and needs the full content width to
  read at display size — at 390px a 2-col tile would be ~170px wide and the label would
  drop to ~14px, which is smaller than the body copy it replaced.
- **Aspect:** `4/3` desktop, `16/10` mobile.
- **Label sizing** uses container query units (`container-type: inline-size` on `.tt`,
  `font-size: clamp(1.5rem, 8.4cqi, 3.1rem)`) so the label scales to the *tile*, not the
  viewport. A plain `font-size: 2rem` precedes the clamp as a fallback. This was necessary
  because the same breakpoint serves a 634px tile (desktop) and a 350px tile (mobile) —
  a `vw`-based clamp gets one of them wrong.
- **States:** label `--paper` → `--blood`, image `scale(1.055)` (transform only), scrim
  opacity → .9, border → `--hairline-strong`. Bound to `.tt-item:hover` and
  `.tt-item:focus-within`.
- **Body copy:** each 2–3 sentence paragraph cut to one line and moved *below* the tile as
  plain muted text (no box, no border). The reassurance that actually converts a beginner
  ("partners at your level, supervised the whole way", "push at your own pace") is real
  substance, not decoration, so it earned its place — but at one line, not a card.
- Icons dropped: the photograph does the job the line icon was doing.

### Image choice per tile

| Tile | Image | Why |
|---|---|---|
| Pad work | `training-dynamic-kick-02-sm` | Full-extension roundhouse onto Thai pads, side-lit, from the professional shoot. The clearest "coach holds, you throw" frame in the library that isn't already the hero. |
| Clinch & sparring | `fight-clinch-stadium-01-sm` | Literally a clinch, referee stepping in. 3:2 source crops to 4:3 losing only 11% of height, so nothing important is cut. |
| Bags & conditioning | `gym-mural-heavybag-04-sm` | The only image in the 30-image library where heavy bags are the subject; the wall behind is the gym's own training schedule (jump rope / shadow / punch the bag / kick bag), which is exactly this tile's content. **Reuses the About figure's file — see judgment calls.** |
| Beach & rooftop | `training-beach-padwork-05-sm` | High kick on pads with the karst cliff behind — beach *and* action in one frame, and unused elsewhere on the page. |

## 2 · Monochrome photo discipline

New token `--bw: grayscale(1) contrast(1.07) brightness(.93)` applied to all six photo
surfaces: hero media, `.frame img` (About + Stay figures), training tiles, bands, gallery
thumbnails, map card (which keeps an extra `brightness(.74)` because text sits on it).
Existing dark gradient overlays all kept.

Exceptions, as briefed:
- `assets/logo-lockup.svg` / `logo-mark.svg` / `favicon.svg` — never selected, untouched.
- `.lb-inner img` — explicit `filter: none`. Thumbnails are B&W, the lightbox opens in
  full colour.
- `og-cover.jpg` — not touched.

**Colour-on-hover for gallery thumbs was deliberately skipped.** The brief allowed it only
if smooth; a `filter` transition is non-composited and this grid has 14 tiles, so easing
colour back in on hover risks jank on a mid-range phone. Skipping it also makes the
lightbox the *single* place colour returns, which is a stronger version of the same idea.
The gallery hover still has three distinct signals: `scale(1.06)`, scrim opacity, and the
caption sliding up.

## 3 · Full-bleed photo bands

Two bands (the brief allowed two or three), at the page's two structural hinges:

| # | Position | Image | Pull-quote |
|---|---|---|---|
| 1 | after `#gym`, before the student quote | `fight-punch-exchange-03.webp`, `object-position: 50% 8%` | **First day or tenth fight, same coaches.** |
| 2 | after `#train`, before `#stay` | `training-beach-silhouette-04.webp`, `object-position: 50% 70%` | **The sand counts as conditioning.** |

- `min-height: clamp(19rem, 54vh, 34rem)` — 54vh at both test widths, inside the briefed
  45–60vh range. No JS, no parallax, no scroll effects.
- Both lines are Anton caps in `--paper`, prefixed by the same 3px `--blood` rule the hero
  `poster-rule` and every `.eyebrow` already use — the bands join the existing structural
  system rather than introducing a new device.
- Copy is brand-voice: concrete, trainer's register, no combat-sports cliché. "Same
  coaches" restates the About section's actual claim ("the same coaches hold pads for a
  first-timer"); "the sand counts as conditioning" makes Krabi part of the work rather
  than a postcard, and avoids the EAT/TRAIN/SEA construction.

Only two bands because the page already carries the hero, four tiles, two framed figures,
a 14-photo gallery and the map card. A third would have pushed past editorial restraint
into a slideshow — and every remaining wide candidate duplicated an image already on the
page.

---

## Verification

Screenshot rounds (all read, not just taken):

1. **r1** — `screenshot-30-r1-desktop.png` / `screenshot-31-r1-mobile.png`.
   Found: `<figure>`'s UA `margin: 0 40px` was insetting every tile 40px from the grid
   track, so tiles were misaligned with their own captions and with the section heading;
   badly visible at 390px where tiles sat at ~270px inside a 350px column. Also band 1
   (`gym-training-floor-03`) put the **retired** "KRABI LION" wall banner across the top
   third of a full-bleed band at hero scale.
2. **r2** — `screenshot-32` / `screenshot-33`. `margin: 0` on `.tt` fixed the inset; band 1
   re-cropped to `50% 66%` to drop the banner. Found tile top-scrim too weak — bright
   in-scene signage still shouted over the photographs.
3. **r3** — `screenshot-34` / `screenshot-35`. Tile scrim top stop `.2` → `.38`. Found
   band 2's `46%` crop left a large empty grey sky and cut the fighters' legs.
4. **r4** — `screenshot-36` / `screenshot-37`. Band 2 → `50% 70%` (knee-raises now read).
   Found the real band-1 problem: at 390px the band is *portrait* (390×456), so a 1:1
   source shows its **full height** and `object-position: Y` does nothing — the retired
   banner was back and dominant on mobile. No crop value can fix this for a square source.
   Swapped band 1 to `fight-punch-exchange-03` (landscape, stadium, no gym signage).
5. **r5 / final** — `screenshot-38` / `screenshot-39`, then band 1 refined `18%` → `8%` to
   bring both fighters' heads and the referee into frame.

**Final pair:**
- `temporary screenshots/screenshot-40-restyle-desktop.png` (1440)
- `temporary screenshots/screenshot-41-restyle-mobile.png` (390)

Checks:
- **No horizontal overflow** at 1440 or 390 (script reports `scrollWidth == clientWidth`
  at both).
- **Contrast** (computed, sRGB relative luminance):
  - Resting tile label / band line, `--paper` on the foot gradient: **14.8–17.0 : 1** —
    passes AA at any size.
  - Hover tile label, `--blood` on the same darkened foot: **3.2–3.7 : 1**. The labels are
    24–50px Anton, i.e. WCAG "large text", threshold 3:1 — **passes AA**. (Worth recording
    because `--blood` cannot reach 4.5:1 on any dark ground; it only clears the bar here
    because the label is display-size and the hover state darkens the scrim to .9.)
- **Reduced motion:** the new tile zoom and the existing gallery zoom are explicitly
  reset to `transform: none` inside the existing `prefers-reduced-motion: reduce` block,
  on top of the global transition-duration kill. Nothing else new animates.
- **Zero external requests** added; plain CSS/JS in `index.html`; palette tokens and the
  two self-hosted fonts only.

---

## Judgment calls worth Leo's eye

1. **`gym-mural-heavybag-04` appears twice** — as the "Bags & conditioning" tile (4:3) and
   as the About section's framed figure (4:5, captioned "The lion mural on the training
   floor"). They are ~2,800px apart and cropped differently, but it is the same corner of
   the gym. This is a library limitation, not a layout choice: it is the only frame in all
   30 images where heavy bags are the subject. Both other candidates were worse —
   `training-heavybag-dynamic-10` is actually pad/kick-shield work under a large retired-name
   banner, and `gym-training-floor-03` cannot be cropped in a 4:3 tile without that banner.
   Cleanest fix is a new photo: one bag-round or skipping frame would free this tile.
2. **Retired "KRABI LION" signage.** `BRAND.md` blesses incidental in-scene gym signage, and
   it is unavoidable in a library shot at the old gym. I drew the line at scale: removed it
   where it was hero-sized (band 1, both breakpoints) and knocked it back with a stronger
   top scrim on the tiles, where it now reads as a photographed wall rather than a title.
   The "Pad work" tile still shows the banner mid-grey in its top third — acceptable to me,
   but flagging it since the rename is recent. The pre-existing map card in `#find` also
   shows it; that was out of scope.
3. **Tiles are not interactive.** They have no link target, so they are `<article>` /
   `<figure>`, not buttons. Hover styling is pointer affordance only — a keyboard user never
   sees the red label, but no information is lost (the label is a heading in the DOM and the
   caption sits below it in the flow). I did not add `tabindex` to fake focusability.
4. **`.section--deep` on the Stay section reads noticeably indigo** now that every photo
   around it is grey. It is pre-existing, uses the `--midnight` brand token, and is a surface
   not an accent — so I left it. If "red is the only colour" should be absolute, that
   gradient is the one remaining place to look.
5. **Source resolution.** Every library image is a 1080px Instagram scrape, so the bands
   upscale ~1.33× at 1440 and more on wide monitors. Grayscale plus the existing film-grain
   overlay hides it well at the tested widths, but higher-resolution originals would be worth
   having if these bands stay.
