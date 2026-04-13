// scripts/build.js — Fetch Sanity data and generate static HTML from template.

import 'dotenv/config';
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as helpers from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Parse CLI args
// ---------------------------------------------------------------------------

function parseSlugArg() {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
}

// ---------------------------------------------------------------------------
// 2. Sanity client
// ---------------------------------------------------------------------------

function createSanityClient() {
  const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
  if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
    throw new Error('Missing SANITY_PROJECT_ID or SANITY_DATASET in .env');
  }
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
}

// ---------------------------------------------------------------------------
// 3. GROQ query
// ---------------------------------------------------------------------------

async function fetchBusinesses(client, slug) {
  const filter = slug
    ? `*[_type == "business" && isPublished == true && slug.current == $slug]`
    : `*[_type == "business" && isPublished == true]`;
  const params = slug ? { slug } : {};
  return client.fetch(`${filter}{...}`, params);
}

// ---------------------------------------------------------------------------
// 4. Build replacements map
// ---------------------------------------------------------------------------

function buildReplacements(biz) {
  const str = (val) => val ?? '';

  return {
    '{{BUSINESS_NAME}}': str(biz.name),
    '{{TAGLINE}}': str(biz.tagline),
    '{{DESCRIPTION_DESKTOP}}': str(biz.description?.split('\n\n')[0]),
    '{{DESCRIPTION_MOBILE}}': str(biz.descriptionMobile).replace(/\*\*(.*?)\*\*/g, '$1'),
    '{{PHONE_TEL}}': str(biz.phone),
    '{{PHONE_FORMATTED}}': str(biz.phoneFormatted),
    '{{ADDRESS}}': str(biz.address),
    '{{CITY_STATE_ZIP}}': str(biz.cityStateZip),
    '{{NEIGHBORHOOD}}': str(biz.neighborhood),
    '{{GOOGLE_MAPS_EMBED_URL}}': str(biz.googleMapsEmbedUrl),
    '{{GOOGLE_MAPS_DIRECTIONS_URL}}': str(biz.googleMapsDirectionsUrl),
    '{{GOOGLE_MAPS_QUERY}}': str(biz.googleMapsQuery),
    '{{PAYMENT_LINE}}': str(biz.paymentLine),
    '{{MENU_NOTE}}': str(biz.menuNote),
    '{{ABOUT_KICKER}}': str(biz.aboutKicker),
    '{{ABOUT_HEADING}}': str(biz.aboutHeading),
    '{{MENU_KICKER}}': str(biz.menuKicker),
    '{{MENU_HEADING}}': str(biz.menuHeading),
    '{{MENU_SUBTITLE}}': str(biz.menuSubtitle),
    '{{SPECIALTY_KICKER}}': str(biz.specialtyKicker),
    '{{SPECIALTY_HEADING}}': str(biz.specialtyHeading),
    '{{SPECIALTY_SUBTITLE}}': str(biz.specialtySubtitle),
    '{{REVIEWS_KICKER}}': str(biz.reviewsKicker),
    '{{REVIEWS_HEADING}}': str(biz.reviewsHeading),
    '{{VISIT_KICKER}}': str(biz.visitKicker),
    '{{VISIT_HEADING}}': str(biz.visitHeading),
    '{{CATERING_HEADLINE}}': str(biz.cateringHeadline),
    '{{CATERING_DESCRIPTION}}': str(biz.cateringDescription),
    '{{SEO_TITLE}}': str(biz.seo?.title),
    '{{SEO_DESCRIPTION}}': str(biz.seo?.description),
    '{{YEAR}}': String(new Date().getFullYear()),

    // HTML blocks
    '{{FACTS_HTML}}': helpers.generateFactsHtml(biz.facts),
    '{{PRESS_HTML}}': helpers.generatePressHtml(biz.pressLinks),
    '{{MENU_HTML}}': helpers.generateMenuHtml(biz.menuSections),
    '{{BUILD_YOUR_OWN_HTML}}': helpers.generateBuildYourOwnHtml(biz.buildYourOwn),
    '{{SPECIALTY_HTML}}': helpers.generateSpecialtyHtml(biz.specialtyItems),
    '{{CATERING_HTML}}': helpers.generateCateringHtml(biz),
    '{{REVIEWS_HTML}}': helpers.generateReviewsHtml(biz.reviews),
    '{{REVIEW_DOTS_HTML}}': helpers.generateReviewDotsHtml(biz.reviews?.length),
    '{{HOURS_HTML}}': helpers.generateHoursHtml(biz.hours),
    '{{DELIVERY_HTML}}': helpers.generateDeliveryHtml(biz.deliveryLinks),
    '{{SOCIALS_HTML}}': helpers.generateSocialsHtml(biz.socialLinks),
    '{{ABOUT_DESKTOP_HTML}}': helpers.generateAboutDesktopHtml(biz.description),
    '{{ABOUT_MOBILE_HTML}}': helpers.generateAboutMobileHtml(biz.descriptionMobile),
  };
}

// ---------------------------------------------------------------------------
// 5. Apply replacements to template
// ---------------------------------------------------------------------------

function applyTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (html, [placeholder, value]) => html.replaceAll(placeholder, value),
    template,
  );
}

// ---------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------

export async function build(slugFilter) {
  const slug = slugFilter ?? parseSlugArg();
  const client = createSanityClient();
  const businesses = await fetchBusinesses(client, slug);

  if (businesses.length === 0) {
    console.log(slug ? `No published business found for slug "${slug}".` : 'No published businesses found.');
    return;
  }

  const templatePath = join(ROOT, 'templates', 'small-biz-marketing', 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }
  const template = readFileSync(templatePath, 'utf-8');

  for (const biz of businesses) {
    const bizSlug = biz.slug?.current;
    if (!bizSlug) {
      console.warn(`Skipping business "${biz.name}" — no slug defined.`);
      continue;
    }

    const replacements = buildReplacements(biz);
    const html = applyTemplate(template, replacements);

    const outDir = join(ROOT, 'sites', bizSlug);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }
    writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
    console.log(`  Built: sites/${bizSlug}/index.html`);
  }

  console.log(`\nDone — ${businesses.length} site(s) built.`);
}

// Run when invoked directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  build().catch((err) => {
    console.error('Build failed:', err.message);
    process.exit(1);
  });
}
