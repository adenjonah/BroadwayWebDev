# Google Maps Scraper

## Purpose

Find small businesses on Google Maps that don't have websites — these are our sales leads.

## Requirements

- Search Google Maps by area + category (e.g., "delis in Morningside Heights")
- Filter for businesses with **no website** listed
- Extract per business: name, address, phone, category, rating, review count, hours
- Output to CSV compatible with `../leads/leads.csv` format

## Approach (TBD)

**Option A: Google Places API** (legitimate, costs money)
- Places Nearby Search + Place Details endpoints
- `website` field in response — filter where empty/null
- ~$17 per 1000 searches

**Option B: Browser automation** (gray area, fragile)
- Playwright/Puppeteer scripting Google Maps
- Free but breaks when Google changes their DOM
- Rate-limited, may trigger CAPTCHAs

Research needed before building. Start with Option A for reliability.
