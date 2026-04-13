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

## Environment

- Node.js with ESM (`"type": "module"` in package.json)
- Dependencies: `@sanity/client`, `dotenv`
- Sanity credentials in `.env` (never committed)
