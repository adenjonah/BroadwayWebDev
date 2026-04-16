-- ═══════════════════════════════════════════════════════════
-- Broadway Web Dev — Scrape Job Heartbeat
--
-- The worker writes a fresh heartbeat_at timestamp every ~30s
-- during scan and after every candidate verify. The admin UI
-- flags a running job as "stalled" when heartbeat_at is older
-- than a threshold, letting the user click Resume to reset
-- status=pending (without losing tiles_done or found_places)
-- and re-trigger the worker.
-- ═══════════════════════════════════════════════════════════

alter table public.scrape_jobs
  add column if not exists heartbeat_at timestamptz;

create index if not exists idx_scrape_jobs_heartbeat
  on public.scrape_jobs(heartbeat_at)
  where status = 'running';
