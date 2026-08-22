# Thewaritnoi Muay Thai — Brand Guidelines + Website (Phase A)

**Date:** 2026-08-22
**Status:** Approved by Leo (chat, 2026-08-22)
**Scope:** One-page website with brand guidelines. A multi-page site (Phase B) comes later, built on this foundation.

## Background

Thewaritnoi Muay Thai is a boxing gym in Krabi, Thailand. Dual identity:
**Krabi Lion Muay Thai** is the gym; **Thewaritnoi** is the fighter/trainer
name behind it ("Krabi Lion Muay Thai by Thaewaritnnay S.K.V Gym").
Existing logo (IG profile, 320px): black background, white collegiate
wordmark "THEWARITNOI", red kicking-fighter silhouette, "KRABI | MUAYTHAI".

Source media: ~1,200 photos scraped from the public Instagram
(`thewaritnoi_krabimuaythai`), 2023–present, sitting in the session
scratchpad (`scratchpad/thewaritnoi_krabimuaythai/`). Facebook is
login-walled; Instagram alone is sufficient. Raw-material inbox:
`Thewaritnoi MuayThai/asset/`.

## Goals

- Professional online presence: gym credibility + tourist information.
- Visitors book via WhatsApp CTA (no booking engine in this phase).
- English only.
- Deployed live at the end of this phase (Vercel).

## Repo & structure

`Thewaritnoi MuayThai/Website/` — self-contained git repo (same pattern as
Cocco House Website):

```
Website/
├── index.html          # the site (single page)
├── assets/             # web-optimized images (WebP), fonts, favicon
├── brand/
│   ├── BRAND.md        # brand guidelines
│   ├── logo.svg        # recreated vector logo
│   └── library/        # ~30 curated originals, descriptive names
├── docs/superpowers/specs/   # this spec + future plans
└── CLAUDE.md           # repo identity for future sessions
```

## Phase 1 — Brand guidelines

0. **Preserve the scrape**: the scratchpad is session-temporary. Move the
   full IG scrape to `Thewaritnoi MuayThai/asset/ig-scrape-2026-08/`
   (outside the git repo — ~240 MB stays out of version control; only the
   ~30 curated images enter the repo).
1. **Curate**: triage ~1,200 scraped photos to ~30 usable images across
   categories — fights, training, gym/facility, portraits. Rename
   descriptively (e.g. `fight-clinch-stadium-01.jpg`) into `brand/library/`.
2. **Palette**: black/white/red from the logo; supporting neutrals/accents
   sampled from the curated photos. Hex values documented.
3. **Logo**: recreate as clean SVG (wordmark + fighter silhouette) — the
   320px IG original is too small for web use. Original kept for reference.
4. **Typography**: condensed athletic display face for headings + clean
   body face; both self-hosted (no external font CDN dependency).
5. **BRAND.md** covers: palette, typography, logo usage, photo style notes,
   tone of voice, and the naming rule (gym = Krabi Lion Muay Thai,
   fighter = Thewaritnoi, how they pair in copy).

## Phase 2 — Website

Single page, hand-coded HTML/CSS, minimal vanilla JS (gallery lightbox,
smooth scroll). No framework, no build step.

Sections, in order:
1. **Hero** — full-bleed photo, logo, tagline, primary WhatsApp CTA.
2. **About** — the gym + Thewaritnoi's fighter story.
3. **Training & Prices** — class types, schedule, pricing.
4. **Gallery** — curated grid with lightbox.
5. **Location** — map + address + how to find it.
6. **Footer** — contact, socials, names/credits.

Cross-cutting:
- Sticky WhatsApp "Book a session" button, prefilled message.
- Mobile-first responsive; WebP images with sensible sizes.
- SEO meta + Open Graph tags (og:image from a curated photo).
- Real info pulled from the socials where available. **Placeholders,
  clearly marked in the page and in a PLACEHOLDERS list, for: WhatsApp
  number, exact address/map pin, class schedule, prices.** Leo confirms;
  we swap them in. Placeholders must be visually obvious (not fake data
  that could ship unnoticed).

## Deploy

- Push repo to GitHub (`mrgreenll/<repo>`).
- Deploy via Vercel CLI → `*.vercel.app` URL. One browser-login step from
  Leo on first run. Custom domain attaches later when the gym buys one.

## Verification

- Local serve + desktop and mobile screenshots reviewed before deploy
  (same screenshot-script approach as Cocco House).
- Post-deploy: fetch the live URL, confirm page + assets load.

## Out of scope (Phase B and later)

- Multi-page structure (Home / Training / Fighters / Gallery / Contact).
- Booking engine, payments, class calendar.
- Thai language version.
- Facebook media (login-walled; revisit only if needed).

## Risks / notes

- Scraped media is unevenly shot — curation quality gates the whole look.
- The SVG logo is a faithful recreation, not a redesign; if it drifts from
  the original, Leo reviews before it ships.
- Instagram scrape was anonymous and one-off; no ongoing scraping pipeline
  is part of this design.
