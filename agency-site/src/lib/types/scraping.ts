export interface ScrapeJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  center_lat: number;
  center_lng: number;
  radius_miles: number;
  query_filter: string;
  tiles_total: number;
  tiles_done: number;
  total_found: number;
  qualified_count: number;
  candidates_total: number;
  candidates_verified: number;
  current_tile: number;
  current_category: string;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_by: string;
}

export type LeadStage =
  | 'new'
  | 'contacted_setter'
  | 'contacted_closer'
  | 'hard_no'
  | 'maybe_later'
  | 'sold';

export const LEAD_STAGES: { value: LeadStage; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted_setter', label: 'Contacted (Setter)' },
  { value: 'contacted_closer', label: 'Contacted (Closer)' },
  { value: 'hard_no', label: 'Hard No' },
  { value: 'maybe_later', label: 'Maybe Later' },
  { value: 'sold', label: 'Sold' },
];

export interface Lead {
  id: string;
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  google_maps_url: string;
  primary_type: string;
  types: string[];
  lead_score: number;
  stage: LeadStage;
  notes: string;
  discovered_at: string;
  discovered_website: string;
  scrape_job_id: string | null;
}
