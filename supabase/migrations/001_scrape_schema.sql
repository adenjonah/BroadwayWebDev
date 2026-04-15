-- ═══════════════════════════════════════════════════════════
-- Broadway Web Dev — Scrape Jobs + Leads Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── SCRAPE JOBS ──────────────────────────────────────────

create table public.scrape_jobs (
  id              uuid primary key default gen_random_uuid(),
  status          text not null default 'pending'
                  check (status in ('pending', 'running', 'completed', 'failed')),
  center_lat      double precision not null,
  center_lng      double precision not null,
  radius_miles    double precision not null,
  query_filter    text not null default '',
  tiles_total     integer not null default 0,
  tiles_done      integer not null default 0,
  total_found     integer not null default 0,
  qualified_count integer not null default 0,
  error_message   text,
  created_at      timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  created_by      uuid references auth.users(id) not null
);

create index idx_scrape_jobs_status on public.scrape_jobs(status);
create index idx_scrape_jobs_created on public.scrape_jobs(created_at desc);

-- ── LEADS ────────────────────────────────────────────────

create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  place_id        text unique not null,
  name            text not null,
  address         text not null default '',
  lat             double precision not null,
  lng             double precision not null,
  phone           text not null default '',
  google_maps_url text not null default '',
  primary_type    text not null default '',
  types           text[] not null default '{}',
  lead_score      integer not null default 0
                  check (lead_score between 0 and 5),
  stage           text not null default 'new'
                  check (stage in (
                    'new', 'contacted_setter', 'contacted_closer',
                    'hard_no', 'maybe_later', 'sold'
                  )),
  notes           text not null default '',
  discovered_at   timestamptz not null default now(),
  scrape_job_id   uuid references public.scrape_jobs(id) on delete set null
);

create index idx_leads_scrape_job on public.leads(scrape_job_id);
create index idx_leads_stage on public.leads(stage);
create index idx_leads_score on public.leads(lead_score desc);
create index idx_leads_name on public.leads(name);
create index idx_leads_discovered on public.leads(discovered_at desc);

-- ── LEAD SCORING FUNCTION ────────────────────────────────

-- Strong business types that make good website clients
create or replace function is_strong_business_type(ptype text)
returns boolean as $$
begin
  return ptype in (
    'restaurant', 'cafe', 'bakery', 'bar', 'meal_delivery',
    'beauty_salon', 'hair_care', 'spa', 'gym',
    'store', 'clothing_store', 'jewelry_store', 'hardware_store',
    'grocery_or_supermarket', 'liquor_store', 'pet_store',
    'car_repair', 'car_wash', 'plumber', 'electrician',
    'roofing_contractor', 'painter', 'locksmith',
    'dentist', 'doctor', 'veterinary_care',
    'accounting', 'lawyer', 'real_estate_agency', 'insurance_agency',
    'hotel', 'motel', 'lodging',
    'laundry', 'dry_cleaning', 'florist', 'funeral_home',
    'moving_company', 'storage', 'travel_agency',
    'pharmacy', 'physiotherapist', 'meal_takeaway',
    'night_club', 'bowling_alley', 'amusement_park'
  );
end;
$$ language plpgsql immutable;

-- Auto-calculate lead score on insert or update
create or replace function calculate_lead_score()
returns trigger as $$
declare
  score integer := 0;
begin
  -- +1 has phone number (reachable)
  if new.phone <> '' then
    score := score + 1;
  end if;

  -- +1 strong business type (good client fit)
  if is_strong_business_type(new.primary_type) then
    score := score + 1;
  end if;

  -- +1 confirmed no website (all leads in this table passed DDG verification)
  score := score + 1;

  -- +1 rich Google profile (multiple types = more established)
  if array_length(new.types, 1) > 1 then
    score := score + 1;
  end if;

  -- +1 complete profile (both phone and type present)
  if new.phone <> '' and new.primary_type <> '' then
    score := score + 1;
  end if;

  new.lead_score := score;
  return new;
end;
$$ language plpgsql;

create trigger trg_lead_score
  before insert or update of phone, primary_type, types
  on public.leads
  for each row
  execute function calculate_lead_score();

-- ── ROW LEVEL SECURITY ───────────────────────────────────

alter table public.scrape_jobs enable row level security;
alter table public.leads enable row level security;

-- Authenticated users can read all jobs
create policy "auth_read_jobs"
  on public.scrape_jobs for select
  to authenticated using (true);

-- Authenticated users can create jobs (own user id)
create policy "auth_insert_jobs"
  on public.scrape_jobs for insert
  to authenticated with check (auth.uid() = created_by);

-- Authenticated users can read all leads
create policy "auth_read_leads"
  on public.leads for select
  to authenticated using (true);

-- Authenticated users can update leads (stage, notes)
create policy "auth_update_leads"
  on public.leads for update
  to authenticated using (true);

-- ── REALTIME ─────────────────────────────────────────────

alter publication supabase_realtime add table public.scrape_jobs;
alter publication supabase_realtime add table public.leads;
