# Brand — Thewaritnoi Krabi Muaythai

## Names

Gym: **Thewaritnoi Krabi Muaythai** · Fighter/trainer: **Thewaritnoi**

**Renamed 2026-08-22 (Leo-approved).** The gym operated as **Krabi Lion
Muay Thai**, paired as "Krabi Lion Muay Thai — by Thewaritnoi", until the
gym's own Instagram announcement (post dated 2026-02-23) put the change
into effect on 2026-03-01. The IG profile name is now `THEWARITNOI KRABI
MUAYTHAI`, and the gym's logo already reads THEWARITNOI KRABI MUAYTHAI.

The fighter's name is now built into the gym name, so the old pairing
line is retired — do not reintroduce "— by Thewaritnoi" or any other
pairing construction. Site copy carries exactly one "formerly Krabi Lion
Muay Thai" mention for recognition/SEO continuity (About section); don't
add more.

Note: "Thewaritnoi MuayThai" (no "Krabi", no space before "Thai") is only
the internal client/repo folder name — never use it as the public gym
name; the public name always includes "Krabi" and is spelled "Muaythai"
as one word.

## Palette

Sampled from the actual logo file and the curated photo library with
`Pillow` (`Image.quantize` + `getcolors`) — see task-3-report.md for the
raw script output. No invented hex values.

```
--ink:      #060404   near-black, page background. Sampled directly from
                       the logo file (2nd-largest cluster after pure
                       #000000 in a 6-color quantization of the profile
                       pic) — a hair off true black so large flat areas
                       don't crush to pure #000.
--paper:    #eeeadc   off-white, body text on dark backgrounds. Sampled
                       from gym-floor-wordmark-02.jpg (the palest cluster
                       in a 10-color quantization) — a warm cream rather
                       than clinical white, matches the gym's natural
                       light and floor tones.
--blood:    #c52d18   the logo red. CTAs and accent details ONLY — never
                       body text, never large fills. Sampled from a
                       16-color quantization of the logo (the dominant
                       red cluster inside the kicking-fighter silhouette,
                       1122 of ~40k sampled pixels). Runs slightly
                       more orange than a pure crimson — that's the real
                       ink used in the mark, not a stylized guess.
--sand:     #7d7663   warm neutral. Secondary/muted text, dividers,
                       borders on dark surfaces. Sampled from
                       gym-floor-wordmark-02.jpg (mid taupe cluster) —
                       echoes the ring floor and rope tones across the
                       library.
--midnight: #12122f   deep indigo-black. Alternate section backgrounds,
                       gradient stops behind stadium/night photography
                       (fight and event categories skew toward this cast
                       under sodium/stadium lighting). Sampled from
                       fight-punch-exchange-03.jpg.
--rust:     #883635   muted brick-red. Hover/active states and secondary
                       accents that need warmth without the full
                       saturation of --blood (e.g. a pressed button, a
                       link visited-state). Sampled from
                       fight-high-kick-08.jpg.
```

Usage rules:
- `--ink` and `--paper` are the only two colors allowed for body copy
  (paper-on-ink is the default reading mode; ink-on-paper for light
  sections if any).
- `--blood` never carries text at body size — CTA fills/borders, the
  fighter-red accent underline, small badges only.
- `--sand` and `--midnight` are surface/structure tones, not text colors
  except for de-emphasized labels (`--sand` on `--ink`).
- `--rust` is a state color (hover/active/visited), not a resting-state
  color.

## Typography

Display: **Anton** — headings, ALL CAPS, tight tracking (`letter-spacing:
-0.01em` to `0` depending on size; Anton is already condensed so avoid
loosening it). Matches the collegiate wordmark energy of the logo.

Body: **Barlow** — 400 for running text, 600 for emphasis/labels/nav.

Self-hosted, latin subset only, no runtime CDN request. Files live in
`assets/fonts/`:
- `assets/fonts/anton-latin.woff2`
- `assets/fonts/barlow-regular.woff2`
- `assets/fonts/barlow-600.woff2`

`@font-face` block — copy verbatim into site CSS (paths are relative to
the site root, alongside `index.html`):

```css
@font-face {
  font-family: 'Anton';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('assets/fonts/anton-latin.woff2') format('woff2');
}

@font-face {
  font-family: 'Barlow';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('assets/fonts/barlow-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Barlow';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('assets/fonts/barlow-600.woff2') format('woff2');
}
```

Stack fallbacks: `font-family: 'Anton', Impact, sans-serif;` for display,
`font-family: 'Barlow', -apple-system, 'Segoe UI', sans-serif;` for body.

## Logo

`brand/logo.svg` (Task 4). Clear space = the height of the "T" in
THEWARITNOI on all sides. Minimum width 120px — below that the crest
detail and small type ("KRABI" / "MUAYTHAI") stop reading.

On photos: place only over dark or dimmed areas (the mark is a black
disc with white type and a red silhouette — it disappears on light
backgrounds without a scrim). Never stretch or recolor the mark when it
stands alone as a gym crest.

## Photography

The curated library (`brand/library/`, 30 images, indexed in
`brand/library/INDEX.md`) is real gym life, not stock or staged
marketing: professional stadium-fight shoots (clinch, flying knee, punch
exchanges, ring-side corners), a professional training shoot with
dramatic side/backlighting, real Krabi locations (beach padwork at
sunrise with the karst islands behind, the covered rooftop ring with
international flags and open sky), the gym's own hand-painted lion
mural and floor wordmark, and unposed moments (hand-wrapping ringside,
a string-light evening gathering, a post-fight group photo under the
Thai flag).

Style notes drawn from the library:
- **Dark and gritty by default.** Most frames run near-black with warm
  or blue-cast highlights (stadium lighting, indoor gym light, night
  events) — this is where `--ink` and `--midnight` come from; treat that
  cast as the house look, not something to color-correct away.
- **High contrast, real sweat.** Backlit and side-lit action shots
  (pad coaching, dynamic kicks) are the strongest images in the set —
  favor that silhouette/rim-light look over flat, evenly-lit shots.
- **Krabi is a character, not a backdrop.** The beach and rooftop
  training shots (karst islands, longtail boats, open sky) are the
  images that make this gym unmistakably local — use them, don't crop
  them down to generic gym content.
- **Incidental brand signage is fine.** Ring-rope sponsor branding, gym
  wall/floor signage, and a small stadium-logo watermark appear
  in-scene on a few images; that's part of the photographed room, not a
  graphic overlay, and is on-brand.
- **No memes, no heavy overlays, no tourist-brochure gloss.** Every
  image was screened against those criteria before inclusion — don't
  add new photography that fails them (no text memes, no watermark-
  everything, no glossy resort-style staging).
- **Gender and format diversity already exists in the set** (female
  fighters across fight/training/portrait categories) — keep that mix
  when selecting images for layout, don't default to only the male
  hero shots.

## Voice

Direct, proud, welcoming to beginners. Short sentences. English.

- Speak like a trainer, not a marketer: concrete claims ("train with a
  real fighter," "beginners welcome, no experience needed") over vague
  hype ("unleash your potential").
- Proud of Krabi and of the gym's own fighters — name the place, name
  the achievement, don't generalize it away.
- Never condescending to first-timers; the gym's own photo library
  shows total-beginner-friendly training right alongside pro fight
  footage, and the copy should read the same way.
- Avoid combat-sports cliché filler ("warrior spirit," "unleash the
  beast"). Say what actually happens at the gym.
