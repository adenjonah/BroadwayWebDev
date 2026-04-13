// scripts/helpers.js — HTML generation helpers for the build pipeline.
// Each function takes Sanity document data and returns an HTML string.

const STAR_SVG = '<svg viewBox="0 0 24 24"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>';

const PHONE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

const BAG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const INSTAGRAM_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>';

const TIKTOK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.69h-1z"/></svg>';

const FACEBOOK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>';

const SOCIAL_ICONS = {
  instagram: INSTAGRAM_SVG,
  tiktok: TIKTOK_SVG,
  facebook: FACEBOOK_SVG,
};

export function generateFactsHtml(facts) {
  if (!facts?.length) return '';
  return facts.map(({ label, value, url }) => {
    const dd = url
      ? `<dd><a href="${url}" target="_blank" rel="noopener">${value}</a></dd>`
      : `<dd>${value}</dd>`;
    return `<div><dt>${label}</dt>${dd}</div>`;
  }).join('\n');
}

export function generatePressHtml(pressLinks) {
  if (!pressLinks?.length) return '';
  return pressLinks.map(({ name, url }) =>
    `<a href="${url}" target="_blank" rel="noopener">${name}</a>`
  ).join('\n');
}

export function generateMenuHtml(menuSections) {
  if (!menuSections?.length) return '';
  const mid = Math.ceil(menuSections.length / 2);
  const renderSection = ({ title, note, items }) => {
    const noteHtml = note ? `\n    <p class="menu-note">${note}</p>` : '';
    const itemsHtml = (items || []).map(({ name, price }) =>
      `      <li><span>${name}</span><span>${price}</span></li>`
    ).join('\n');
    return `  <div class="menu-block">\n    <h3>${title}</h3>${noteHtml}\n    <ul>\n${itemsHtml}\n    </ul>\n  </div>`;
  };
  const left = menuSections.slice(0, mid).map(renderSection).join('\n');
  const right = menuSections.slice(mid).map(renderSection).join('\n');
  return `<div>\n${left}\n</div>\n<div>\n${right}\n</div>`;
}

export function generateBuildYourOwnHtml(buildYourOwn) {
  if (!buildYourOwn) return '';
  const { proteins, toppings, sauces } = buildYourOwn;
  return [
    '<h4>Build Your Own</h4>',
    `<p><strong>Proteins:</strong> ${proteins || ''}</p>`,
    `<p><strong>Toppings (up to 3, extras $0.75):</strong> ${toppings || ''}</p>`,
    `<p><strong>Sauces:</strong> ${sauces || ''}</p>`,
  ].join('\n');
}

export function generateSpecialtyHtml(specialtyItems) {
  if (!specialtyItems?.length) return '';
  return specialtyItems.map(({ tag, title, description, promoPrice }) => {
    const promo = promoPrice
      ? `\n  <div class="promo-price">${promoPrice}</div>`
      : '';
    return `<div class="specialty">\n  <span class="tag">${tag}</span>\n  <h3>${title}</h3>\n  <p>${description}</p>${promo}\n</div>`;
  }).join('\n');
}

export function generateCateringHtml(business) {
  if (!business.cateringEnabled) return '';
  const headline = business.cateringHeadline || '';
  const desc = business.cateringDescription || '';
  const phone = business.phone || '';
  const phoneFormatted = business.phoneFormatted || phone;
  return [
    '<div class="banner" style="margin-top: 3rem;">',
    '  <div>',
    `    <h3>${headline}</h3>`,
    `    <p>${desc}</p>`,
    '  </div>',
    '  <div>',
    `    <a class="btn btn-primary" href="tel:${phone}">`,
    `      ${PHONE_SVG}`,
    `      Call ${phoneFormatted}`,
    '    </a>',
    '  </div>',
    '</div>',
  ].join('\n');
}

export function generateReviewsHtml(reviews) {
  if (!reviews?.length) return '';
  return reviews.map(({ author, meta, text, rating }) => {
    const stars = STAR_SVG.repeat(rating || 5);
    return [
      '<blockquote>',
      `  <div class="stars" aria-label="${rating || 5} out of 5 stars">`,
      `    ${stars}`,
      '  </div>',
      `  <p>${text}</p>`,
      '  <cite>',
      `    <span class="reviewer-name">\u2014 ${author}</span>`,
      `    <span class="reviewer-meta">${meta}</span>`,
      '    <span class="google-label">Google review</span>',
      '  </cite>',
      '</blockquote>',
    ].join('\n');
  }).join('\n');
}

export function generateReviewDotsHtml(count) {
  if (!count || count <= 0) return '';
  return '<span></span>'.repeat(count);
}

export function generateHoursHtml(hours) {
  if (!hours?.length) return '';
  return hours.map(({ day, open, close }) =>
    `<tr><td>${day}</td><td>${open} \u2013 ${close}</td></tr>`
  ).join('\n');
}

export function generateDeliveryHtml(deliveryLinks) {
  if (!deliveryLinks?.length) return '';
  return deliveryLinks.map(({ platform, url }) =>
    `<a href="${url}" target="_blank" rel="noopener">${BAG_SVG} ${platform}</a>`
  ).join('\n');
}

export function generateSocialsHtml(socialLinks) {
  if (!socialLinks?.length) return '';
  return socialLinks.map(({ platform, url }) => {
    const icon = SOCIAL_ICONS[platform] || '';
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    return `<a href="${url}" target="_blank" rel="noopener" aria-label="${label}">${icon}</a>`;
  }).join('\n');
}

export function generateAboutDesktopHtml(description) {
  if (!description) return '';
  return description.split('\n\n').map((p) => `<p>${p.trim()}</p>`).join('\n');
}

export function generateAboutMobileHtml(descriptionMobile) {
  if (!descriptionMobile) return '';
  const text = descriptionMobile.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return text;
}
