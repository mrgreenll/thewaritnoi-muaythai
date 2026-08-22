# Thewaritnoi Muay Thai Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brand guidelines distilled from ~1,200 scraped Instagram photos, then a one-page website for the gym, live on Vercel.

**Architecture:** Self-contained static-site git repo (`Thewaritnoi MuayThai/Website/`), no framework and no build step — hand-coded `index.html` + assets, mirroring the Cocco House Website pattern. Brand work (curated library, palette, logo SVG, BRAND.md) lands first and feeds the page design.

**Tech Stack:** HTML/CSS + minimal vanilla JS, Python 3 + Pillow (image triage/optimization, in a scratchpad venv), potrace (logo tracing), `gh` CLI (repo), Vercel CLI (deploy).

**Spec:** `docs/superpowers/specs/2026-08-22-thewaritnoi-website-design.md` (read it first — this plan argues from it)

## Global Constraints

- English only; no Thai version in this phase.
- No frameworks, no build step: one `index.html`, plain CSS/JS.
- Fonts self-hosted as WOFF2 in `assets/fonts/` — no font/CDN requests.
- Naming rule in all copy: gym = **Krabi Lion Muay Thai**, fighter/trainer name = **Thewaritnoi**; pairing line: "Krabi Lion Muay Thai — by Thewaritnoi".
- Placeholders (WhatsApp number, address/map pin, schedule, prices) must be visually obvious on the page — bright marker style, text like `【CONFIRM: WhatsApp number】` — never plausible fake data.
- The full IG scrape (~240 MB) lives at `Thewaritnoi MuayThai/asset/ig-scrape-2026-08/`, OUTSIDE this repo. Only curated/optimized images enter git.
- Working dir for all tasks: `/Users/leo/Workspace/Thewaritnoi MuayThai/Website` unless a step says otherwise.
- `SCRATCH=/private/tmp/claude-501/-Users-leo-Workspace/ac900f99-997c-4297-9254-31224668ed71/scratchpad` — every task sets this var first. A venv with Pillow + instaloader already exists at `$SCRATCH/venv/`. The scraped photos are at `/private/tmp/claude-501/-Users-leo-Workspace/ac900f99-997c-4297-9254-31224668ed71/scratchpad/thewaritnoi_krabimuaythai/` until Task 1 moves them.

---

### Task 1: Preserve the scrape, pull captions, scaffold the repo

**Files:**
- Create: `Thewaritnoi MuayThai/asset/ig-scrape-2026-08/` (moved media, outside repo)
- Create: `.gitignore`, `CLAUDE.md`, `assets/`, `assets/fonts/`, `assets/img/`, `brand/library/`
- Modify: nothing existing

**Interfaces:**
- Produces: scrape at `../asset/ig-scrape-2026-08/media/` and captions at `../asset/ig-scrape-2026-08/captions/`; repo skeleton later tasks write into.

- [ ] **Step 1: Move the media out of the scratchpad**

```bash
SCRATCH="/private/tmp/claude-501/-Users-leo-Workspace/ac900f99-997c-4297-9254-31224668ed71/scratchpad"
DEST="/Users/leo/Workspace/Thewaritnoi MuayThai/asset/ig-scrape-2026-08"
mkdir -p "$DEST"
mv "$SCRATCH/thewaritnoi_krabimuaythai" "$DEST/media"
ls "$DEST/media" | wc -l   # expect ~1240
```

- [ ] **Step 2: Pull captions + bio (text only, light request)**

The original scrape used `--no-captions`; captions may hold schedule/price/contact facts for Task 5's copy.

```bash
cd "$DEST" && mkdir -p captions && cd captions
"$SCRATCH/venv/bin/instaloader" --no-pictures --no-videos --no-profile-pic \
  --no-compress-json thewaritnoi_krabimuaythai
ls thewaritnoi_krabimuaythai | head   # expect *_UTC.txt and *_UTC.json files
```

If Instagram rate-limits (401/429 after retries), record that in the task report and continue — captions are a nice-to-have, not a gate.

- [ ] **Step 3: Scaffold the repo**

Working dir: `/Users/leo/Workspace/Thewaritnoi MuayThai/Website` (repo already exists with the spec committed).

```bash
mkdir -p assets/fonts assets/img brand/library
```

`.gitignore`:

```gitignore
.DS_Store
node_modules/
.vercel/
```

`CLAUDE.md`:

```markdown
# Thewaritnoi Muay Thai — Website

One-page static site for Krabi Lion Muay Thai (gym) by Thewaritnoi
(fighter/trainer), Krabi, Thailand. No framework, no build step:
`index.html` + `assets/`. Brand rules live in `brand/BRAND.md` — read it
before touching design or copy. Raw scraped media (not in git):
`../asset/ig-scrape-2026-08/`.

- Deploy: Vercel CLI (`npx vercel --prod`), GitHub `mrgreenll` remote.
- Placeholder convention: `【CONFIRM: …】` markers must never ship silently —
  list them in PLACEHOLDERS.md and clear that file as facts arrive.
- Spec + plans: `docs/superpowers/specs/`, `docs/superpowers/plans/`.
```

- [ ] **Step 4: Verify and commit**

```bash
ls ../asset/ig-scrape-2026-08/media | wc -l          # ~1240
git add -A && git commit -m "chore: scaffold repo (gitignore, CLAUDE.md, asset dirs)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Curate ~30 photos into brand/library

**Files:**
- Create: `brand/library/*.jpg` (~30 curated originals), `brand/library/INDEX.md`
- Read: `../asset/ig-scrape-2026-08/media/*.jpg`

**Interfaces:**
- Consumes: Task 1's media folder.
- Produces: `brand/library/<category>-<desc>-NN.jpg` originals; categories exactly: `fight`, `training`, `gym`, `portrait`, `event`. `INDEX.md` lists each file with a one-line description. Tasks 3 and 5 read from here.

- [ ] **Step 1: Generate contact sheets**

Write `$SCRATCH/sheets.py` (scratchpad, throwaway):

```python
import sys
from pathlib import Path
from PIL import Image

SRC = Path("/Users/leo/Workspace/Thewaritnoi MuayThai/asset/ig-scrape-2026-08/media")
OUT = Path(sys.argv[1]); OUT.mkdir(exist_ok=True)
files = sorted(SRC.glob("*.jpg"))
COLS, ROWS, TH = 6, 5, 300
per = COLS * ROWS
for s in range(0, len(files), per):
    batch = files[s:s + per]
    sheet = Image.new("RGB", (COLS * TH, ROWS * TH), "black")
    for i, f in enumerate(batch):
        try:
            im = Image.open(f); im.thumbnail((TH, TH))
        except OSError:
            continue
        sheet.paste(im, ((i % COLS) * TH, (i // COLS) * TH))
    n = s // per
    sheet.save(OUT / f"sheet-{n:02d}.jpg", quality=80)
    (OUT / f"sheet-{n:02d}.txt").write_text(
        "\n".join(f"{i%COLS},{i//COLS} {f.name}" for i, f in enumerate(batch)))
print("sheets:", len(list(OUT.glob('*.jpg'))))
```

```bash
"$SCRATCH/venv/bin/python" "$SCRATCH/sheets.py" "$SCRATCH/sheets"
# expect: sheets: ~42
```

- [ ] **Step 2: Review every sheet and shortlist**

Read each `sheet-NN.jpg` with the Read tool (all of them — no sampling; log "reviewed 42/42 sheets" in the task report). Note grid coordinates of keepers, map to filenames via the matching `.txt`. Selection criteria — keep only images that are ALL of: sharp, decently lit, no meme/TV-screenshot reposts, no heavy text overlays (small watermarks OK). Target mix: ~8 fight, ~10 training, ~5 gym/facility, ~4 portrait, ~3 event. If a category is thin, take the best available and note the shortfall.

- [ ] **Step 3: Confirm shortlist at full size, copy + rename**

Read each shortlisted original at full size; drop any that fail up close. Then:

```bash
cp "../asset/ig-scrape-2026-08/media/<file>.jpg" "brand/library/fight-clinch-stadium-01.jpg"
# … one cp per keeper, names: <category>-<two-word-desc>-NN.jpg
```

Write `brand/library/INDEX.md`: one line per image — filename, one-line description, and why it was kept.

- [ ] **Step 4: Verify and commit**

```bash
ls brand/library/*.jpg | wc -l    # 25–35
git add brand/library && git commit -m "feat: curated brand photo library (~30 images)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Palette, typography, BRAND.md

**Files:**
- Create: `brand/BRAND.md`, `assets/fonts/anton-latin.woff2`, `assets/fonts/barlow-regular.woff2`, `assets/fonts/barlow-600.woff2`
- Read: `brand/library/`, `../asset/ig-scrape-2026-08/media/2026-02-24_07-39-35_UTC_profile_pic.jpg` (logo)

**Interfaces:**
- Consumes: Task 2's library.
- Produces: `brand/BRAND.md` with exact hex tokens (`--ink`, `--paper`, `--blood`, plus 2–3 supporting tones); font files + the CSS `@font-face` block Task 5 copies verbatim.

- [ ] **Step 1: Extract palette candidates**

`$SCRATCH/palette.py`:

```python
from pathlib import Path
from PIL import Image

LOGO = "/Users/leo/Workspace/Thewaritnoi MuayThai/asset/ig-scrape-2026-08/media/2026-02-24_07-39-35_UTC_profile_pic.jpg"
LIB = Path("/Users/leo/Workspace/Thewaritnoi MuayThai/Website/brand/library")
def tops(path, n=6):
    im = Image.open(path).convert("RGB").resize((100, 100))
    q = im.quantize(colors=n).convert("RGB")
    counts = sorted(q.getcolors(10000), reverse=True)
    return [f"#{r:02x}{g:02x}{b:02x}" for _, (r, g, b) in counts]
print("LOGO:", tops(LOGO))
for f in sorted(LIB.glob("*.jpg"))[:12]:
    print(f.name, tops(f, 4))
```

```bash
"$SCRATCH/venv/bin/python" "$SCRATCH/palette.py"
```

From the output pick: near-black ink, off-white paper, the logo red (use the actual sampled value, expected somewhere in the `#c81e2e`-ish family), one warm neutral from gym photos, one deep supporting tone. Record exact hexes.

- [ ] **Step 2: Download and subset fonts**

Display: **Anton** (condensed, matches the collegiate wordmark energy). Body: **Barlow** (regular + 600). Get WOFF2 from Google Fonts' API without a CDN dependency at runtime:

```bash
cd assets/fonts
for css in "family=Anton" "family=Barlow:wght@400;600"; do
  curl -s -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?${css}&display=swap"
done > /tmp/fonts.css   # then curl each woff2 URL found in it, latin subset only
grep -o 'https://[^)]*latin[^)]*woff2\|https://[^)]*\.woff2' /tmp/fonts.css
# download: anton-latin.woff2, barlow-regular.woff2, barlow-600.woff2
file *.woff2   # each: "Web Open Font Format (Version 2)"
```

- [ ] **Step 3: Write brand/BRAND.md**

Structure (fill every section with the actual values from Steps 1–2):

```markdown
# Brand — Krabi Lion Muay Thai / Thewaritnoi

## Names
Gym: Krabi Lion Muay Thai · Fighter/trainer: Thewaritnoi
Pairing line: "Krabi Lion Muay Thai — by Thewaritnoi". Never mix into one name.

## Palette
--ink: #…  (near-black, backgrounds)
--paper: #… (off-white, text on dark)
--blood: #… (logo red — CTAs, accents only, never body text)
--… (2–3 supporting tones, with where-to-use notes)

## Typography
Display: Anton — headings, ALL CAPS, tight tracking. Body: Barlow 400/600.
@font-face block (copy verbatim into site CSS): [the actual block]

## Logo
brand/logo.svg (Task 4). Clear space = height of the "T". Min width 120px.
On photos: only over dark/dimmed areas.

## Photography
What the curated library shows + rules (real training moments, high
contrast, dark-room grit; no memes, no heavy overlays).

## Voice
Direct, proud, welcoming to beginners. Short sentences. English.
```

- [ ] **Step 4: Verify and commit**

```bash
ls assets/fonts/*.woff2 | wc -l   # 3
git add brand/BRAND.md assets/fonts && git commit -m "feat: brand guidelines — palette, typography, voice

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Logo SVG recreation

**Files:**
- Create: `brand/logo.svg`, `brand/logo-original.jpg` (copy of IG profile pic, reference)
- Test: visual side-by-side screenshot for Leo

**Interfaces:**
- Consumes: BRAND.md palette hexes; Anton font.
- Produces: `brand/logo.svg` — viewBox `0 0 640 640`, dark background version; inner group reusable on transparent. Task 5 inlines or `<img>`s it.

- [ ] **Step 1: Trace the fighter silhouette**

```bash
brew list potrace >/dev/null 2>&1 || brew install potrace
```

`$SCRATCH/mask.py` — isolate the red silhouette as a bitmap:

```python
from PIL import Image
im = Image.open("/Users/leo/Workspace/Thewaritnoi MuayThai/Website/brand/logo-original.jpg").convert("RGB")
im = im.resize((im.width * 4, im.height * 4), Image.LANCZOS)  # upscale before threshold
px = im.load()
out = Image.new("1", im.size, 1)
o = out.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b = px[x, y]
        if r > 110 and r > g * 1.6 and r > b * 1.6:  # red-dominant → silhouette
            o[x, y] = 0
out.save("/tmp/silhouette.pbm")
```

```bash
cp "../asset/ig-scrape-2026-08/media/2026-02-24_07-39-35_UTC_profile_pic.jpg" brand/logo-original.jpg
"$SCRATCH/venv/bin/python" "$SCRATCH/mask.py"
potrace /tmp/silhouette.pbm -s -o /tmp/silhouette.svg --flat -t 10
```

Open `/tmp/silhouette.svg` (Read tool) — the path should read as the kicking fighter. If tracing produces garbage after two threshold adjustments, fall back to hand-authoring a simplified high-knee fighter path and flag it prominently for Leo's review.

- [ ] **Step 2: Compose logo.svg**

Hand-write `brand/logo.svg`: `viewBox="0 0 640 640"`, `--ink` background rect, "THEWARITNOI" in Anton (converted to outlines via text→path is unnecessary — embed the font with a `<style>@font-face` data-URI, or use `<text>` with the site-hosted font and provide the PNG-safe fallback note), red silhouette path centered, "KRABI" / "MUAYTHAI" flanking bottom in `--paper`. Match the original's arched-top wordmark layout.

- [ ] **Step 3: Side-by-side check for Leo**

Render logo.svg to PNG and composite next to the original:

```bash
"$SCRATCH/venv/bin/pip" -q install cairosvg
"$SCRATCH/venv/bin/python" - <<'EOF'
import cairosvg
cairosvg.svg2png(url="brand/logo.svg", write_to="/tmp/logo-new.png", output_width=640)
from PIL import Image
a = Image.open("brand/logo-original.jpg").resize((640, 640))
b = Image.open("/tmp/logo-new.png").convert("RGB")
s = Image.new("RGB", (1300, 640), "white"); s.paste(a, (0, 0)); s.paste(b, (660, 0))
s.save("/tmp/logo-compare.png")
EOF
```

Send `/tmp/logo-compare.png` to Leo (SendUserFile). **Spec requires Leo's review if the recreation drifts — send it either way and note anything you changed.** Do not block the next task on his reply unless the drift is major.

- [ ] **Step 4: Commit**

```bash
git add brand/logo.svg brand/logo-original.jpg
git commit -m "feat: recreate logo as SVG from 320px IG original

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: The website — assets, index.html, screenshots

**Files:**
- Create: `assets/img/*.webp`, `index.html`, `PLACEHOLDERS.md`, `serve.mjs`, `screenshot.mjs`
- Read: `brand/BRAND.md`, `brand/library/`, `brand/logo.svg`, `../asset/ig-scrape-2026-08/captions/` (facts for copy)

**Interfaces:**
- Consumes: everything Tasks 2–4 produced.
- Produces: the complete page; `PLACEHOLDERS.md` listing every `【CONFIRM: …】` marker with file:line.

- [ ] **Step 0: Invoke the frontend-design skill**

REQUIRED SUB-SKILL: `frontend-design:frontend-design` — read it before writing any HTML/CSS; apply it within BRAND.md's constraints (BRAND.md wins on palette/type/voice).

- [ ] **Step 1: Mine captions for facts**

```bash
grep -rhiE "price|baht|฿|class|schedule|session|contact|tel|phone|09[0-9]|@|map|location" \
  "../asset/ig-scrape-2026-08/captions/" | sort -u | head -60
```

Facts found → real copy. Facts missing → `【CONFIRM: …】` markers.

- [ ] **Step 2: Optimize curated images for web**

`$SCRATCH/webp.py`:

```python
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path("brand/library"); DST = Path("assets/img")
for f in sorted(SRC.glob("*.jpg")):
    im = ImageOps.exif_transpose(Image.open(f).convert("RGB"))
    w = 2000 if f.stem.startswith(("fight", "gym")) else 1600  # heroes wider
    if im.width > w:
        im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    im.save(DST / (f.stem + ".webp"), "WEBP", quality=82)
print(len(list(DST.glob("*.webp"))), "webp files")
```

```bash
"$SCRATCH/venv/bin/python" "$SCRATCH/webp.py"   # count matches library count
du -sh assets/img                                # sanity: a few MB total, not tens
```

- [ ] **Step 3: Build index.html**

One file, sections in spec order — Hero (full-bleed webp, logo, tagline, WhatsApp CTA) → About (gym + Thewaritnoi story from captions/spec background) → Training & Prices → Gallery (grid + no-dependency lightbox: `<dialog>` element, ~30 lines JS) → Location (embedded OpenStreetMap iframe or static map + `【CONFIRM: map pin】`) → Footer (socials, pairing line). Sticky WhatsApp button: `https://wa.me/【CONFIRM】?text=Hi%20Krabi%20Lion%20Muay%20Thai…` — with the placeholder marker styled bright yellow/black so it cannot ship unnoticed. `@font-face` block copied verbatim from BRAND.md; palette as CSS custom properties from BRAND.md; SEO title/description + OG tags with an `assets/img/` og:image. Smooth scroll via `scroll-behavior: smooth`.

- [ ] **Step 4: Write PLACEHOLDERS.md**

Every `【CONFIRM: …】` in the page, one line each: `index.html:<line> — what Leo must confirm`.

- [ ] **Step 5: Serve + screenshot**

Copy `serve.mjs` and `screenshot.mjs` from `/Users/leo/Workspace/Cocco House/Website/` (adjust port/paths only). Then:

```bash
node serve.mjs &   # note the port it prints
node screenshot.mjs                    # desktop 1440px full-page
node screenshot.mjs --mobile           # 390px — use Cocco House's mobile script if separate
```

Read both screenshots. Fix anything broken (overflow, contrast, missing images) and re-shoot until clean. Send final desktop + mobile screenshots to Leo (SendUserFile).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: one-page site — hero, about, training, gallery, location

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Deploy — GitHub + Vercel, live verification

**Files:**
- Create: GitHub repo `mrgreenll/thewaritnoi-muaythai`; Vercel project (`.vercel/` stays gitignored)

**Interfaces:**
- Consumes: the committed site.
- Produces: live `https://<project>.vercel.app` URL, recorded in CLAUDE.md.

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create mrgreenll/thewaritnoi-muaythai --public \
  --source . --push --description "One-page site for Krabi Lion Muay Thai by Thewaritnoi, Krabi"
git remote -v   # origin → github.com/mrgreenll/thewaritnoi-muaythai
```

- [ ] **Step 2: Vercel login (Leo in the loop)**

```bash
npx vercel login
```

This opens a browser confirmation — tell Leo it's waiting for him and pause until login succeeds. (`npx vercel whoami` to check.)

- [ ] **Step 3: Deploy**

```bash
npx vercel --prod --yes   # static root deploy, no config needed
```

Capture the production URL from the output.

- [ ] **Step 4: Verify live**

```bash
curl -sI <prod-url> | head -3                      # HTTP/2 200
curl -s <prod-url> | grep -c "Krabi Lion"          # ≥ 1
curl -sI <prod-url>/assets/img/<any>.webp | head -1  # 200
```

- [ ] **Step 5: Record and commit**

Append to `CLAUDE.md`: `Live: <prod-url> (Vercel, deployed 2026-08-22).`

```bash
git add CLAUDE.md && git commit -m "docs: record live Vercel URL

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push
```

Report to Leo: live URL + the open PLACEHOLDERS.md list (those swap in as he confirms facts).
