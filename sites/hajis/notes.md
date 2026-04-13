# Hajis Famous Deli — Site Notes

## What the Google listing gave us

- **Name:** Hajis Famous Deli
- **Category:** Deli ($10–20)
- **Address:** 1129 Amsterdam Ave, New York, NY 10025 (Morningside Heights, next to Columbia)
- **Phone:** (646) 684-3003
- **Rating:** 4.7 from 52 reviews
- **Hours:** Only "closes 11:40 PM" was available — no per-day breakdown
- **About:** 30+ years in business, legendary chopped cheese, juice bar, fast food, protein snacks
- **Menu highlights:** chopped cheese, Philly cheese, steak sandwich, Peter Luger burger, chicken over rice, chicken tenders, falafel, veggie burger, citrus-avocado juice, smoothies, milkshakes, salads, ice cream
- **Review themes:** signature chopped cheese, unique Philly sauce, warm staff, student-friendly, open late, good value, solid juice bar

## What's in the generated site

- Single-page static site (`index.html`) — no JS, no build step, just double-click to open
- Uses the provided `logo.png` in the header, hero, and favicon
- Palette pulled from the logo: deep green primary, cream background, charcoal text
- Editorial typography: Playfair Display headings + Inter body (one Google Fonts link)
- Sections: Hero → About → Menu → Reviews → Visit (contact + embedded Google Map) → Footer
- Primary CTA: "Call to Order" (tel link). Secondary: "Get Directions" (Google Maps)
- Embedded Google Maps iframe via the no-key `?output=embed` pattern
- Socials in footer: Instagram, TikTok, Facebook (all three confirmed URLs)
- All inline Feather SVG icons (pinned v4.29.0 markup), zero emoji
- Every editable block wrapped in `<!-- EDIT: ... -->` comments so the owner can ctrl+F and change copy without touching structure

## Things the owner should verify / fill in

1. **Hours table** — the listing only shows "closes 11:40 PM". I defaulted every day to `7:00 AM – 11:40 PM`. Flagged with an EDIT comment for the owner to correct.
2. **Review testimonials** — all three are paraphrased, not verbatim. Names (Marcus, Priya, Sofia) are placeholders; owner may want to swap in real customers.
3. **Menu items** — inferred from the listing. Owner may want to add/remove specific items or prices.

## Suggested upsells to pitch

1. **Online ordering integration** — Toast, Square, or ChowNow menu embedded directly on the site. High value for a late-night spot near a college campus.
2. **Photo gallery** — 8–12 real food photos of the chopped cheese, Philly, chicken over rice. Would dramatically lift conversion; they currently have no owned photography on the web.
3. **Delivery aggregator badges** — linked buttons for Uber Eats / DoorDash / Grubhub / Seamless if they're on those platforms.
4. **Catering / bulk-order page** — Columbia student groups, dorm events, and nearby offices are a natural catering market worth a dedicated landing page.
5. **SEO landing content** — a short "Best chopped cheese in Morningside Heights" blog post would rank well and feed organic traffic into the site.

## Cold-pitch talking points

- "You've got a 4.7 rating, a signature dish people travel for, and zero web presence outside of Google Maps. A simple site locks in that brand before a competitor does."
- "Columbia students search for late-night food constantly. Right now they're finding you through Maps — a site with a menu and an online-order button converts that traffic into actual tickets."
- "30 years on Amsterdam Ave is a story worth telling. A proper website gives you somewhere to put that story, link it from your Instagram bio, and hand out the URL on receipts."

## Weaknesses in current Google Maps presence

- Only 52 reviews despite 30+ years in business — suggests reviews aren't being actively requested at the counter
- Hours on the listing are incomplete (only a closing time is visible)
- No website link on the Google Business Profile — this site fills that gap directly
- Social accounts exist (TikTok, IG, FB) but aren't cross-linked from the listing
- **Press coverage is invisible.** Hajis is credited as the *inventor* of the chopped cheese — NYT covered it in 2016, Hungry Travelers wrote a feature, and there's a YouTube video about it. None of this is surfaced on Google Maps, the listing, or anywhere the owner controls. This is the single biggest missed branding lever.
- **New product lines are hidden.** Dubai Pudding, Strawberry Dubai Chocolate, the protein bar lineup (8 flavors), yogurt/oats breakfast bowls, and the $4 / 3-for-$9 fresh ginger shots aren't mentioned anywhere publicly. These are exactly the kind of items that drive viral discovery on TikTok/IG — especially Dubai chocolate, which is still a trending search.
- **Catering is completely unadvertised.** The deli offers full catering (juices, sandwich platters, fruit trays) but there's no landing page, no price sheet, no lead capture. Columbia groups, offices, and dorm events are walking past this.

## New upsell ideas (post-data-drop)

1. **Dedicated catering landing page** — `/catering` with sample platters, pricing tiers, lead form or just a big phone CTA. Huge ROI for a spot next to Columbia.
2. **Press / media page** — `/press` collecting the NYT article, Hungry Travelers piece, YouTube feature, and any future coverage. Link it from the homepage "As featured in" strip and from the IG bio. Turns the "inventor of the chopped cheese" claim into something verifiable.
3. **"Inventor of the chopped cheese" story page** — long-form origin story. This is unique content no competitor can replicate, and it would rank for "who invented the chopped cheese" searches.
4. **TikTok content angle for Dubai desserts** — the strawberry Dubai chocolate specifically is prime viral fodder. Worth flagging to the owner even if it's outside the website scope.
5. **Ginger shot promo card at the counter** — the $4 / 3-for-$9 deal should be a physical counter card, not just implied.
