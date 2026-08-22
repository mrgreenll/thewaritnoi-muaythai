# Placeholders — things Leo must confirm before this site goes public

Every item below appears in `index.html` as a `【CONFIRM: …】` marker, styled
bright yellow on black so it cannot ship unnoticed. Nothing here is filled with
plausible-looking fake data — if we did not have the fact, the page says so.

Delete each marker (and its line here) as the real answer arrives.

## Open markers

| # | index.html | Confirm |
|---|---|---|
| 1 | `index.html:1008` | Thewaritnoi's fight record — stadiums fought, titles, years training — and the year the gym opened. Sits in the "The gym" section where his story should be. |
| 2 | `index.html:1098` | Daily class times — morning and afternoon session start times, and whether drop-ins can train any hour the gym is open. (Opening hours themselves are confirmed: Sat–Thu 08:00–20:00.) |
| 3 | `index.html:1110` | Single session price |
| 4 | `index.html:1117` | Weekly package price |
| 5 | `index.html:1124` | Monthly package price |
| 6 | `index.html:1131` | Private one-to-one session price |
| 7 | `index.html:1161` | Nightly rate — private bedroom with shared bathroom (3 people), gym access included |
| 8 | `index.html:1169` | Nightly rate — private house (1 bedroom, living room, kitchen, bathroom) |
| 9 | `index.html:1240` | Full street address to print on the page, and confirmation that the Google Maps pin already linked is the current gym location |

## Also needs a decision (no marker on the page)

**The gym name.** `brand/BRAND.md` sets the public gym name as **Krabi Lion
Muay Thai**, paired as "Krabi Lion Muay Thai — by Thewaritnoi", and the page is
built that way throughout. But the gym's own Instagram announcement (post dated
2026-02-23) says:

> Thewaritnoi Krabi Lion Muaytai gym has changed its name to **Thewaritnoi
> Krabi Muaythai** gym, effective March 01, 2026.

The Instagram profile name is now `THEWARITNOI KRABI MUAYTHAI 📍AONANG`, and
2026 captions use "Thewaritnoi Krabi Muaythai". The `#krabilionmuaythai` hashtag
and the TikTok handle `@krabilion_muaythai` are both still in active use, and
the painted lion mark is still all over the gym.

Leo needs to confirm which name the website should carry. If it is the new one,
the change touches the `<title>`, meta description, OG tags, nav, hero, footer
and every WhatsApp prefill message — plus `brand/BRAND.md`, which is the source
of truth for the rest of the project.

**Domain.** The page deliberately ships with **no** `<link rel="canonical">`
and a relative `og:image` — an unowned canonical is worse than none. Once the
real domain (or the Vercel URL) is known, add `canonical`, `og:url`, and make
`og:image` absolute, since most link-preview scrapers will not resolve a
relative image path.

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
