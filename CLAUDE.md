# BroadwayWebDev

## What this is

Monorepo for a web dev company that builds simple marketing sites for small businesses. One Sanity CMS powers all client sites via a build script that generates static HTML.

## Architecture

- **CMS**: Sanity (one project, multi-tenant). Each client = one `business` document.
- **Template**: `templates/small-biz-marketing/index.html` with `{{PLACEHOLDER}}` tokens.
- **Build**: `scripts/build.js` fetches Sanity data via GROQ, replaces placeholders, writes static HTML to `sites/<slug>/index.html`.
- **Deploy**: Each site deploys independently to Vercel from `sites/<slug>/`.
- **No frameworks**: Vanilla HTML/CSS/JS. No React, no SSG framework. The build script is a simple Node.js string replacer.

## Key conventions

- Client sites live in `sites/<slug>/` — slug matches the Sanity document's `slug` field
- Template uses `{{PLACEHOLDER_NAME}}` for simple values and `{{BLOCK_HTML}}` for generated HTML fragments (reviews, menu, hours, etc.)
- `<!-- EDIT: ... -->` comments in HTML mark editable sections for reference
- Each site dir has: `index.html` (generated), static assets (logo, images), `vercel.json`, `notes.md` (sales notes)
- `notes.md` in each site is the client research/pitch doc — not generated, hand-written

## Commands

```bash
npm run build -- --slug <slug>   # Build one site
npm run build:all                # Build all published sites
npm run new-site -- <slug>       # Scaffold new client directory
```

## When creating a new client site

1. Always start from the template — never build from scratch
2. Create the business document in Sanity first
3. Run new-site.sh to scaffold the directory
4. Add static assets (logo, images) to the site directory
5. Run the build script to generate HTML

## File size limits

- Template HTML: large (~1100 lines) — this is expected, it's a full single-page site
- `scripts/build.js`: keep under 200 lines
- `scripts/helpers.js`: keep under 200 lines
- Individual helper functions: keep under 30 lines each

## Lead Generation Scraper

`scraper/` — Python tool that finds businesses with no website using Google Places API + DuckDuckGo verification.

### Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Usage
```bash
npm run scrape -- --lat 40.7128 --lng -74.0060 --radius-miles 5 --out results.csv
# Or with a query filter:
npm run scrape -- --lat 40.7128 --lng -74.0060 --radius-miles 5 --query "restaurant" --out results.csv
```

Key flags: `--no-verify-web` (skip DDG verification), `--tile-miles N` (sub-circle size for large areas).

## Environment

- Node.js with ESM (`"type": "module"` in package.json)
- Dependencies: `@sanity/client`, `dotenv`
- Python 3 with venv for the scraper (`requirements.txt`)
- Sanity credentials + `GOOGLE_MAPS_API_KEY` in `.env` (never committed)
