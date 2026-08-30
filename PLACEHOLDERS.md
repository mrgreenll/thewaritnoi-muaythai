# Placeholders — things Leo must confirm before this site goes public

Every item below appears in `index.html` as a `【CONFIRM: …】` marker, styled
bright yellow on black so it cannot ship unnoticed. Nothing here is filled with
plausible-looking fake data — if we did not have the fact, the page says so.

Delete each marker (and its line here) as the real answer arrives.

## Open markers

| # | Page | Section | Confirm |
|---|---|---|---|
| 1 | `/` | The gym | Thewaritnoi's fight record — stadiums fought, titles, years training — and the year the gym opened. Asked 2026-08-26; Leo doesn't know yet — needs to come from Thewaritnoi himself. |
| 2 | `/stay/` | Sleep where you train | Room photography — **private bedroom only**. Private house is done: Leo supplied four shots on 2026-08-27 (bedroom, living room, kitchen, covered porch), now live in the strip. The bedroom strip still runs three "photo coming soon" tiles; swap each figure for an img when those shots arrive, following the private-house markup. |

To find it in the source: `grep -rn "CONFIRM" --include=index.html .`

## Reference: pre-rename price card (photographed 2026-08-26)

Source: front-desk card, Krabi Lion branding ("Thewaritnoy" spelling), so it
predates the March 2026 rename. Photo: `../asset/price-card-pre-rename.jpg`.
Published 2026-08-26 on Leo's instruction: use the old prices; he will tell us if they change.

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

**Everything except the fight record — resolved 2026-08-26, answers from Leo:**
- 12 package prices: old card's numbers published as current, per Leo. He notifies us of changes.
- Classes only (from the gym's rate sheet, season 1 Nov–31 May): 1 class 600 · 10 classes 5,000 ·
  1 week 1/day 3,000 · 1 week 2/day 4,500 · 1 month 15,000 THB.
- Personal 1-on-1: 1 session 1,000 · 10 sessions 9,000 · 20 sessions 16,000 THB.
- Motorbike rates confirmed unchanged; published on /stay/.
- Class times: 08:00–10:00 and 16:00–18:00 daily; published on /training/.
- Address: pin https://maps.app.goo.gl/KXW2GVkEBX3cpjxx7 (8.031096, 98.855529).
  Superseded 2026-08-30, on Leo's request for the full address: /find-us/ now shows the
  street address from the gym's own Google Business listing — 4 Soi Ao Nam Mao Phatthana
  (ซ.อ่าวน้ำเมาพัฒนา), Sai Thai, Mueang Krabi, Krabi 81000 — in English plus a Thai line
  for taxi drivers. "Ao Nang" stays as the site's branding locality (footer, headlines).
  NOTE: the Google Business listing still shows the old name "Krabi Lion Muay Thai" —
  Leo should update it to the new name.

