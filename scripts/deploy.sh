#!/usr/bin/env bash
# Deploy a specific client site to Vercel.
# Usage: bash scripts/deploy.sh <slug>

set -euo pipefail

SLUG="${1:?Usage: deploy.sh <slug>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_DIR="${ROOT}/sites/${SLUG}"

if [ ! -d "$SITE_DIR" ]; then
  echo "Error: site directory not found at sites/${SLUG}/"
  exit 1
fi

echo "Building site for ${SLUG}..."
node "${ROOT}/scripts/build.js" --slug "$SLUG"

echo ""
echo "Deploying sites/${SLUG}/ to Vercel..."
cd "$SITE_DIR"
vercel --prod

echo ""
echo "Deploy complete for ${SLUG}."
