# Fight Night Motion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Short-form by Leo's instruction (2026-09-27: "short spec + plan, then go straight
> into building"). Tasks pin files, interfaces and checks; the code lives in the commits.

**Goal:** A showreel-grade motion layer across the five pages, plus the audit fixes.

**Architecture:** `site.js` stays the functional baseline and works alone. A new deferred
`motion.js` (GSAP + Lenis, vendored) layers choreography on top and talks to `site.js`
only through `window.TKMMotion` hooks. Hidden start states exist only under `html.motion`.

**Tech Stack:** GSAP 3.15 (ScrollTrigger, SplitText, Flip, CustomEase), Lenis 1.3, CSS
cross-document View Transitions, Node 26 `node:test`, Chrome DevTools Protocol checks.

**Spec:** `docs/superpowers/specs/2026-09-27-fight-night-motion-design.md`

## Global Constraints

- Build-free: no npm install, no bundler; vendored files in `assets/vendor/`, loaded `defer`.
- Animate `transform` / `opacity` only. Exceptions, each commented at the call site:
  existing hover `filter` blooms; SVG icon stroke draw on /find-us/.
- `prefers-reduced-motion: reduce` → no `html.motion` → static, fully visible site.
- `?motion=off` query param also disables the layer (debugging, static screenshots).
- Touch / coarse pointer: no Lenis, cursor labels, magnetic pull, torch, float images.
- `--blood` accent only; rooms keep colour; desktop hero crop untouched.
- No push to `master`. Commit on branch `motion`.

## File map

| File | Responsibility |
|---|---|
| `assets/vendor/*.min.js`, `assets/vendor/LICENSES.md` | GSAP core + 4 plugins, Lenis, licence notes |
| `assets/hours.js` | Pure opening-hours logic in Asia/Bangkok (browser global `TKMHours`, CommonJS for tests) |
| `tests/hours.test.mjs` | `node:test` unit tests for `hours.js` |
| `check.mjs` | CDP checks per page: console errors, overflow, broken images, visibility in motion / reduced / no-JS modes |
| `assets/site.js` | Baseline behaviour: nav, menu (+ focus trap via `inert`), live status render, shared lightbox, gallery build + filters, room strips, matrix crosshair, motion fallback |
| `assets/motion.js` | All choreography, one function per component, each guarded by an element check |
| `assets/motion.css` | `html.motion` start states + fail-safe, Lenis rules, marquee/cursor/float/curtain/VT styles |
| `assets/site.css` | Structural additions (marquee base, index list, status chip, filters, strip controls, reticle) + dead-code removal |
| 5 × `index.html` | Head gate snippet, script tags, markup changes listed per task |
| `assets/hero-split.js` | Deleted (replaced by SplitText in `motion.js`) |

## Interfaces

- **Head gate** (inline, every page, before CSS):
  adds `motion` to `<html>` unless reduced motion or `?motion=off`; adds `intro` when
  `sessionStorage['tkm-seen']` is unset and the page is Home; sets the flag on every page.
- **Boot contract:** `motion.js` sets start states, then adds `motion-ready` to `<html>`.
  `site.js` on `DOMContentLoaded`: if `motion` but no `window.TKMMotion`, removes `motion`
  and `intro` (vendor or motion.js failed). CSS fail-safe reveals everything after 4s.
  A boot later than 3.5s bails to the static site.
- **`window.TKMMotion`** (defined by `motion.js`, all optional, each returns truthy if handled):
  - `menu(open: boolean, panel: HTMLElement, done: () => void)`
  - `flip(container: HTMLElement, mutate: () => void)`
  - `lightboxOpen(ctx: {lb, img, from: HTMLImageElement|null})`
  - `lightboxClose(ctx: {lb, img, to: HTMLImageElement|null}, done: () => void)`
  - `lightboxStep(ctx: {lb, img}, dir: 1|-1, swap: () => void)`
  - `lenis` — the Lenis instance or `null`; `site.js` calls `stop()`/`start()` around menu and lightbox.
- **Events** (`document`): `tkm:gallery-layout` with `detail.tiles`, once — the tiles are
  persistent and only ever re-dealt, so there is nothing new to announce after that.
- **`TKMHours.status(date: Date)`** → `{ open, dayIndex, gym: string, classes: string, classNow: boolean }`.
- **Live targets:** `[data-live="gym"]`, `[data-live="classes"]`; today cell gets `.is-today`.
- **Cursor labels:** any element with `data-cursor="View|Drag|Open"`.

---

### Task 1: Groundwork — vendor, gate, fail-safes, checks

**Files:** create `assets/vendor/*`, `assets/motion.js` (boot only), `assets/motion.css`,
`check.mjs`; modify 5 × `index.html` (head gate, scripts), `assets/site.css` (`.reveal`
hidden state removed), `assets/site.js` (fallback + old reveal observer removed),
`.vercelignore`; move `assets/fonts/lemon_milk*` → `../asset/fonts-unused-lemon-milk/`.

- [x] Write `check.mjs`; run it on the current site → expect FAIL in no-JS mode (reveals invisible).
- [x] Download GSAP 3.15.0 + Lenis 1.3.26 dist files from the npm registry into `assets/vendor/`.
- [x] Head gate, boot contract, fail-safe, `?motion=off`.
- [x] Move Lemon Milk out, `git rm --cached`.
- [x] `node check.mjs` → PASS in all three modes. Commit.

### Task 2: Opening hours logic + live status

**Files:** create `assets/hours.js`, `tests/hours.test.mjs`; modify `site.js`, `site.css`,
home/training/find-us `index.html`.

- [x] Tests first for: Thu 07:59 closed/opens 08:00 · Thu 08:00 class on · Thu 10:30 next
  class 16:00 · Thu 19:59 open, next class Sat 08:00 · Thu 20:00 opens Sat · Fri 12:00
  closed Fridays · Sat 16:15 class on until 18:00 · Sun 23:30 opens tomorrow · Wed 20:30.
- [x] `node --test tests/` → FAIL, implement, → PASS.
- [x] Render `[data-live]` + `.is-today`, refresh every 60s. Commit.

### Task 3: Global motion

**Files:** `motion.js`, `motion.css`, `site.js`, `site.css`, 5 × `index.html`.

- [x] Lenis (fine pointer only) wired to ScrollTrigger; anchors offset for the fixed nav.
- [x] Reveal system: eyebrow rule draw, h2 line masks, `.reveal` fade-up (d1–d3), frames wipe + parallax, ropes draw.
- [x] Buttons: sweep fill, label roll, magnetic. Nav: progress rope, sliding underline, logo kick.
- [x] Menu: panel wipe, masked link rise, burger→X, `inert` focus trap.
- [x] View Transitions, grain jitter, cursor labels, footer curtain + pluckable ring ropes
  (the wordmark was dropped in the frontend-design review).
- [x] `node check.mjs` PASS; screenshots 390/1440. Commit.

### Task 4: Home

**Files:** `index.html`, `motion.js`, `site.css`, `motion.css`.

- [x] Curtain intro + hero timeline (first visit) / short entrance (repeat); retire `hero-split.js` on all pages (page heads move to `motion.js`).
- [x] Hero scroll peel (mouse depth dropped in review). Marquee with velocity.
- [x] Gym section, fight band letterbox + torch, quote as a pad combination.
- [x] Routes → index list with cursor float (desktop) / inline thumbs (touch); drop 100svh.
- [x] Check + screenshots + frame captures of the intro. Commit.

### Task 5: Training

- [x] h1→h2 semantics, CTA "Reserve your place" + reservation prefill.
- [x] Odometer prices, week board flip + strike + today, live classes line, matrix crosshair.
- [x] Tiles wipe + parallax, beach band letterbox. Check + screenshots. Commit.

### Task 6: Stay

- [x] 1600px room photo webps from `../asset/stay-house-2026-08/`.
- [x] Room strips: drag + momentum + snap, prev/next buttons, progress line; lightbox for room photos.
- [x] Check + screenshots. Commit.

### Task 7: Gallery

- [x] Persistent tiles + filters (All 26 · Training 14 · Fight nights 6 · Team 6) with Flip.
- [x] Tile reveal batch; lightbox shared-element open/close, directional step, swipe, preload.
- [x] Check + screenshots + keyboard pass. Commit.

### Task 8: Find us

- [x] Valid `<dl>`, single `</main>`, icon stroke draw, live status, reticle + coordinates.
- [x] Check + screenshots. Commit.

### Task 9: Cleanup, docs, full verification

- [x] Dead CSS + orphaned comments, `color-scheme` meta, `PLACEHOLDERS.md` canonical note,
  `Website/CLAUDE.md` motion notes, `MEMORY.md` decision entry.
- [x] All pages × 390/768/1024/1440 screenshots; check.mjs all modes; recorded scroll-through
  video of Home. Final commit.

### Task 10: Code review fixes (2026-09-27)

- [x] Start states opacity-only (were `autoAlpha`: content left the tab order and the
  accessibility tree until revealed); focus finishes a pending entrance.
- [x] Footer curtain only while the footer fits (`html.lift`), and steps aside for focus.
- [x] Gallery: filtered-out tiles stay in the DOM through a column change.
- [x] Viewer: one handle on the step timeline; steps finish in-flight tweens; close cancels a
  pending swap; the fly-back target must really be visible.
- [x] Intro curtain removed when the opening fails, plus a watchdog.
- [x] Sideways scrollers keep horizontal trackpad swipes; matrix compact at 881–1180px.
- [x] Minor: hover zoom after filtering, footer-rope visibility, matrix odometer offset,
  system cursor kept, no permanent will-change, no eager image downloads, filter names,
  reduced-motion smooth scrolling, aria-disabled strip buttons, focused room photos
  brought fully into their strip.
- [x] check.mjs: keyboard walk (every stop visible and on top, every tabbable reached),
  nothing visibility-hidden at load, sticky footer reachable, 360×740 by default.
