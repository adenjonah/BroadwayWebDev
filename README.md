# BroadwayWebDev

Web development company that builds simple marketing websites for small businesses.

## How it works

1. **Find leads** — scrape Google Maps for businesses without websites
2. **Cold call** — pitch web development services, book a sales meeting
3. **Build prototype** — generate a demo site from our template + CMS
4. **Close the sale** — show the prototype at the meeting
5. **Go live** — connect the site to hosting (Vercel)

## Architecture

```
BroadwayWebDev/
├── studio/              # Sanity Studio (CMS dashboard)
├── sites/<slug>/        # Generated client sites (one per client)
├── templates/           # HTML templates with {{PLACEHOLDER}} tokens
├── scripts/             # Build, scaffold, and deploy scripts
└── infra/               # Sales pipeline tools (scraper, leads)
```

### CMS (Sanity)

- One Sanity project, one Studio dashboard for all clients
- Each client is a `business` document with a `slug` matching `sites/<slug>/`
- Non-technical editor uses the web dashboard to edit text, images, reviews

### Build pipeline

```
Editor publishes in Sanity → webhook fires → Vercel rebuilds
build.js: GROQ query → fetch data → inject into template → static HTML
```

### Sites

- Vanilla HTML/CSS/JS — no frameworks, no build tools beyond our script
- Each site deploys independently to its own Vercel project
- Static assets (logo, images) live in `sites/<slug>/`

## Setup

```bash
# Install dependencies
npm install

# Copy env vars and fill in Sanity credentials
cp .env.example .env

# Build a specific site
npm run build -- --slug hajis

# Build all published sites
npm run build:all

# Scaffold a new client site
npm run new-site -- <slug>
```

## Adding a new client

1. Create a `business` document in Sanity Studio with the client's info
2. Run `npm run new-site -- <slug>` to scaffold the directory
3. Add static assets (logo, images) to `sites/<slug>/`
4. Run `npm run build -- --slug <slug>` to generate the site
5. Deploy: `cd sites/<slug> && vercel --prod`

## Current clients

| Slug | Business | Status |
|---|---|---|
| hajis | Hajis Famous Deli | Prototype built |
