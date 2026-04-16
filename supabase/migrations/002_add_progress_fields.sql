-- ═══════════════════════════════════════════════════════════
-- Broadway Web Dev — Scrape Progress Fields
-- Adds fine-grained progress tracking so the admin UI can show
-- the current tile index and the category being queried.
-- ═══════════════════════════════════════════════════════════

alter table public.scrape_jobs
  add column if not exists current_tile     integer not null default 0,
  add column if not exists current_category text    not null default '';
