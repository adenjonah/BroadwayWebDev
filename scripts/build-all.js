// scripts/build-all.js — Build all published sites (no slug filter).

import { build } from './build.js';

build(null).catch((err) => {
  console.error('Build-all failed:', err.message);
  process.exit(1);
});
