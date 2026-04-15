'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ScrapeJob } from '@/lib/types/scraping';
import ProgressBar from './progress-bar';

interface JobListProps {
  initialJobs: ScrapeJob[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--text-dim)',
  running: 'var(--accent)',
  completed: '#22c55e',
  failed: '#ef4444',
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function JobList({ initialJobs }: JobListProps) {
  const [jobs, setJobs] = useState<ScrapeJob[]>(initialJobs);

  // Subscribe to realtime updates on scrape_jobs
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('scrape-jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scrape_jobs' },
        (payload) => {
          const updated = payload.new as ScrapeJob;
          setJobs((prev) => {
            const exists = prev.find((j) => j.id === updated.id);
            if (exists) {
              return prev.map((j) => (j.id === updated.id ? updated : j));
            }
            return [updated, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (jobs.length === 0) {
    return (
      <div className="job-list-empty">
        <p>No scrape jobs yet. Start one above.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      <h3>Scrape Jobs</h3>
      <div className="job-list-items">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <span
                className="job-status-badge"
                style={{ color: STATUS_COLORS[job.status] }}
              >
                {job.status}
              </span>
              <span className="job-card-time">{formatTime(job.created_at)}</span>
            </div>

            <div className="job-card-location">
              {job.center_lat.toFixed(3)}, {job.center_lng.toFixed(3)} — {job.radius_miles}mi
              {job.query_filter && <span className="job-card-query"> &middot; &ldquo;{job.query_filter}&rdquo;</span>}
            </div>

            {(job.status === 'running' || job.status === 'completed') && (
              <ProgressBar
                current={job.tiles_done}
                total={job.tiles_total}
                label="Tiles scanned"
              />
            )}

            <div className="job-card-stats">
              <span>Found: {job.total_found}</span>
              <span>Leads: {job.qualified_count}</span>
            </div>

            {job.error_message && (
              <div className="job-card-error">{job.error_message}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
