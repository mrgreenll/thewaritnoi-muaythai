# Thewaritnoi Muay Thai — Website

One-page static site for Thewaritnoi Krabi Muaythai (formerly Krabi Lion
Muay Thai), Krabi, Thailand. No framework, no build step:
`index.html` + `assets/`. Brand rules live in `brand/BRAND.md` — read it
before touching design or copy. Raw scraped media (not in git):
`../asset/ig-scrape-2026-08/`.

- Deploy: Vercel CLI (`npx vercel --prod`), GitHub `mrgreenll` remote. Vercel
  auto-deploys production on every `git push` to `phase-a` (GitHub-connected);
  manual deploy is `npx vercel --prod --yes --name thewaritnoi-muaythai`. At
  merge time, re-check which branch Vercel treats as production (currently
  `phase-a`).
- Placeholder convention: `【CONFIRM: …】` markers must never ship silently —
  list them in PLACEHOLDERS.md and clear that file as facts arrive.
- Spec + plans: `docs/superpowers/specs/`, `docs/superpowers/plans/`.

- Shared frontend build rules (screenshot loop, design guardrails): `WEB-BUILDS.md` at
  the workspace root. This file wins where they differ.

Live: https://thewaritnoi-muaythai.vercel.app (Vercel, deployed 2026-08-22).
