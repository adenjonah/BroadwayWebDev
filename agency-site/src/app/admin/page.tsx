import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();

  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const { count: jobsCount } = await supabase
    .from('scrape_jobs')
    .select('*', { count: 'exact', head: true });

  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('stage', 'new');

  return (
    <>
      <div className="admin-header">
        <div className="container">
          <h1>Dashboard</h1>
        </div>
      </div>
      <div className="admin-content">
        <div className="container">
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{leadsCount ?? 0}</div>
              <div className="dashboard-stat-label">Total Leads</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{newLeads ?? 0}</div>
              <div className="dashboard-stat-label">New (Uncontacted)</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{jobsCount ?? 0}</div>
              <div className="dashboard-stat-label">Scrape Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
