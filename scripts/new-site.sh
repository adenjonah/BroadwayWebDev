#!/usr/bin/env bash
# Scaffold a new client site directory.
# Usage: bash scripts/new-site.sh <slug>

set -euo pipefail

SLUG="${1:?Usage: new-site.sh <slug>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_DIR="${ROOT}/sites/${SLUG}"
TEMPLATE_DIR="${ROOT}/templates/small-biz-marketing"

if [ -d "$SITE_DIR" ]; then
  echo "Error: site directory already exists at sites/${SLUG}/"
  exit 1
fi

mkdir -p "$SITE_DIR"

# Copy template favicon if it exists
if [ -f "${TEMPLATE_DIR}/favicon.svg" ]; then
  cp "${TEMPLATE_DIR}/favicon.svg" "${SITE_DIR}/favicon.svg"
fi

# Create stub vercel.json
cat > "${SITE_DIR}/vercel.json" <<EOF
{
  "version": 2,
  "builds": [
    { "src": "**", "use": "@vercel/static" }
  ]
}
EOF

# Create empty notes file
touch "${SITE_DIR}/notes.md"

echo ""
echo "Scaffolded sites/${SLUG}/"
echo ""
echo "Next steps:"
echo "  1. Create a 'business' document in Sanity with slug '${SLUG}'"
echo "  2. Add static assets (logo, images) to sites/${SLUG}/"
echo "  3. Run: npm run build -- --slug ${SLUG}"
echo ""
