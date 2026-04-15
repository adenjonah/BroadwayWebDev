import { createClient } from '@/lib/supabase/server';
import ScrapingPageClient from './client';
import '@/styles/scraping.css';

export default async function ScrapingPage() {
  const supabase = await createClient();

  // Fetch recent jobs
  const { data: jobs } = await supabase
    .from('scrape_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch first page of leads
  const { data: leads, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('discovered_at', { ascending: false })
    .range(0, 24);

  return (
    <ScrapingPageClient
      initialJobs={jobs ?? []}
      initialLeads={leads ?? []}
      initialLeadsTotal={count ?? 0}
    />
  );
}
