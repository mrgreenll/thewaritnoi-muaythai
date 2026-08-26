# Placeholders — things Leo must confirm before this site goes public

Every item below appears in `index.html` as a `【CONFIRM: …】` marker, styled
bright yellow on black so it cannot ship unnoticed. Nothing here is filled with
plausible-looking fake data — if we did not have the fact, the page says so.

Delete each marker (and its line here) as the real answer arrives.

## Open markers

Referenced by page and section — not line number, which goes stale on every edit.

| # | Page | Section | Confirm |
|---|---|---|---|
| 1 | `/` | The gym | Thewaritnoi's fight record — stadiums fought, titles, years training — and the year the gym opened. |
| 2 | `/training/` | When we train | Daily class times — morning and afternoon session start times, and whether drop-ins can train any hour the gym is open. (Opening hours themselves are confirmed: Sat–Thu 08:00–20:00.) |
| 3 | `/training/` | What it costs | The 12 train-and-stay package prices (room/house × with/without meals × 1wk/2wk/1mo). Pre-rename numbers are on file below — confirm they still hold. |
| 4 | `/training/` | What it costs | Single session price, for visitors training without staying at the gym |
| 5 | `/training/` | What it costs | Private one-to-one session price |
| 6 | `/stay/` | Sleep where you train | Motorbike rental rates (pre-rename: 300/day, 1,700/wk, 3,000/2wk, 5,000/mo) |
| 7 | `/find-us/` | Address | Full street address to print on the page, and confirmation that the Google Maps pin already linked is the current gym location |

To find one in the source: `grep -rn "CONFIRM" --include=index.html .`

## Reference: pre-rename price card (photographed 2026-08-26)

Source: front-desk card, Krabi Lion branding ("Thewaritnoy" spelling), so it
predates the March 2026 rename. Photo: `../asset/price-card-pre-rename.jpg`.
These numbers must NOT be published until Thewaritnoi confirms they are current.

Train + stay packages, THB:

| | 1 week | 2 weeks | 1 month |
|---|---|---|---|
| Room | 7,900 | 14,900 | 27,900 |
| Room + meals | 9,900 | 18,900 | 35,900 |
| House | 11,900 | 21,900 | 39,900 |
| House + meals | 14,900 | 27,900 | 47,900 |

Motorbike rental: 300/day · 1,700/week · 3,000/two weeks · 5,000/month.
Meals = two per day (brunch and dinner). Bookings via WhatsApp.

## Resolved

**The gym name.** Leo approved the rename on 2026-08-22: the site now carries
the gym's current public name, **Thewaritnoi Krabi Muaythai**, everywhere
user-facing — `<title>`, meta description, OG/Twitter tags, nav/logo lockup,
hero poster type, section copy, footer lockup, WhatsApp prefills, and
aria-labels/alt text. `brand/BRAND.md` was updated to match. One tasteful
"formerly Krabi Lion Muay Thai" mention was kept in the About section for
recognition/SEO continuity; the old pairing line ("Krabi Lion Muay Thai — by
Thewaritnoi") is retired. The `#krabilionmuaythai` hashtag and the TikTok
handle `@krabilion_muaythai` are unaffected — those are real, still-active
external handles, not site copy.

## Also needs a decision (no marker on the page)

**Domain — partially resolved 2026-08-22.** The Vercel URL
(`https://thewaritnoi-muaythai.vercel.app`) is now known, so `og:image` and
`twitter:image` are absolute against it and `og:url` was added. The page
still deliberately ships with **no** `<link rel="canonical">` — an unowned
canonical is worse than none — and waits for the real custom domain. Once
that domain exists, add `canonical` and repoint `og:url`/`og:image` to it.

## Confirmed — do not "fix" these, they came from the gym's own channels

| Fact | Source |
|---|---|
| WhatsApp / phone `+66 89 198 4577` | Instagram bio (`📞` and `WhatsApp :` lines), the bio's own `wa.me/66891984577` link, and two accommodation captions |
| Open Saturday to Thursday, closed Fridays, 08:00–20:00 | Instagram bio |
| Ao Nang, Krabi | Instagram profile name `📍AONANG`; `#aonang` across captions |
| Google Maps pin `maps.app.goo.gl/nfayyZR3fqpnNMxP9` | Instagram bio link |
| Instagram `@thewaritnoi_krabimuaythai` | `asset/name and links` |
| Facebook `profile.php?id=61552646480668` | `asset/name and links` |
| TikTok `@krabilion_muaythai` | Instagram bio link |
| Accommodation: private bedroom + bathroom shared between 3, gym access; and a separate private house (1 bed, living room, kitchen, bathroom), limited availability, advance reservation required | Two accommodation captions |
| Student quote in the testimonial block | Caption dated 2026-02-22, reposted on the gym's own Instagram |
| "Beginner looking to get fit or a seasoned fighter wanting to go pro" | Gym caption, paraphrased into the About and Training copy |

## Notes

- Stay section added beyond spec's six sections — controller-approved deviation; Leo may cut.

**Nightly room rates (old markers 7–8).** Superseded 2026-08-26: the gym's own
price card shows accommodation is sold only as train-and-stay packages by the
week — there are no nightly rates. `/stay/` now points at the package matrix
on `/training/`.

**Training-only weekly/monthly packages (old markers 4–5).** Dropped
2026-08-26: the price card lists no training-only packages beyond what a
single session and private one-to-one would cover. If Thewaritnoi says
walk-in weekly/monthly training exists, re-add it.

