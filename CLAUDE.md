# Thewaritnoi Muay Thai — Website

Five-page static site for Thewaritnoi Krabi Muaythai (formerly Krabi Lion
Muay Thai), Krabi, Thailand: `/`, `/training/`, `/stay/`, `/gallery/`,
`/find-us/`. No framework, no build step: one `index.html` per page +
`assets/`. Brand rules live in `brand/BRAND.md` — read it
before touching design or copy. Raw scraped media (not in git):
`../asset/ig-scrape-2026-08/`.

- Deploy: Vercel CLI (`npx vercel --prod`), GitHub `mrgreenll` remote. Vercel
  auto-deploys production on every `git push` to `master` (GitHub-connected);
  manual deploy is `npx vercel --prod --yes --name thewaritnoi-muaythai`. At
  merge time, re-check which branch Vercel treats as production (currently
  `master`).
- Placeholder convention: `【CONFIRM: …】` markers must never ship silently —
  list them in PLACEHOLDERS.md and clear that file as facts arrive.
- Spec + plans: `docs/superpowers/specs/`, `docs/superpowers/plans/`.

- Shared frontend build rules (screenshot loop, design guardrails): `WEB-BUILDS.md` at
  the workspace root. This file wins where they differ.

## Motion layer ("Fight Night", 2026-09-27)

Spec: `docs/superpowers/specs/2026-09-27-fight-night-motion-design.md`.

- `assets/site.js` is the functional baseline and must keep working alone.
  `assets/motion.js` + `motion.css` layer the motion on top; they talk to
  site.js only through `window.TKMMotion` hooks. GSAP 3.15 + Lenis are
  vendored in `assets/vendor/` (licences there) — no CDN.
- An inline head gate (duplicated per page, like the header) adds
  `html.motion` unless reduced motion is on or the URL has `?motion=off`.
  Hidden start states live only under `html.motion` — never hide content
  in site.css.
- Transform/opacity only. Documented exceptions: photo colour blooms
  (`filter`), Find us icon draw (`stroke-dashoffset`), rope paths (`d`).
- Opening hours live in `assets/hours.js` (live "Open now" status) as well
  as in the page copy — change both together.
- Checks: `node check.mjs http://localhost:3000` (every page × full /
  reduced-motion / no-JS × 1440 / 390; exits 1 on failure) and
  `node --test tests/hours.test.mjs`. For static layout screenshots use
  `node screenshot.mjs "http://localhost:3000/?motion=off"` — with motion
  on, the band capture catches scroll reveals mid-flight.
- `PORT=3100 node serve.mjs` when 3000 is taken by another project.

Live: https://thewaritnoi-muaythai.vercel.app (Vercel, deployed 2026-08-22).
