'use client';

import { useCallback, useState } from 'react';
import type { ScrapeJob, Lead } from '@/lib/types/scraping';
import ScrapeForm from '@/components/admin/scrape-form';
import JobList from '@/components/admin/job-list';
import LeadsTable from '@/components/admin/leads-table';

interface ScrapingPageClientProps {
  initialJobs: ScrapeJob[];
  initialLeads: Lead[];
  initialLeadsTotal: number;
}

export default function ScrapingPageClient({
  initialJobs,
  initialLeads,
  initialLeadsTotal,
}: ScrapingPageClientProps) {
  const [activeTab, setActiveTab] = useState<'scrape' | 'leads'>('scrape');
  const [jobs, setJobs] = useState<ScrapeJob[]>(initialJobs);

  const handleJobCreated = useCallback((job: ScrapeJob) => {
    setActiveTab('scrape');
    // Optimistic insert — Realtime will reconcile subsequent updates.
    setJobs((prev) => {
      if (prev.some((j) => j.id === job.id)) return prev;
      return [job, ...prev];
    });
  }, []);

  return (
    <>
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>Lead Scraping</h1>
              <p>{initialLeadsTotal} leads from {jobs.length} scrape jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="scrape-tabs">
        <div className="container">
          <button
            className={`scrape-tab${activeTab === 'scrape' ? ' active' : ''}`}
            onClick={() => setActiveTab('scrape')}
          >
            Scrape
          </button>
          <button
            className={`scrape-tab${activeTab === 'leads' ? ' active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Leads ({initialLeadsTotal})
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {activeTab === 'scrape' && (
            <div className="scrape-panel">
              <div className="scrape-panel-form">
                <ScrapeForm onJobCreated={handleJobCreated} />
              </div>
              <div className="scrape-panel-jobs">
                <JobList jobs={jobs} setJobs={setJobs} />
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <LeadsTable
              initialData={initialLeads}
              initialTotal={initialLeadsTotal}
            />
          )}
        </div>
      </div>
    </>
  );
}
