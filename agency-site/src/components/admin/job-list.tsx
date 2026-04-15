'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ScrapeJob } from '@/lib/types/scraping';
import ProgressBar from './progress-bar';
import PlacesModal from './places-modal';

interface JobListProps {
  initialJobs: ScrapeJob[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
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

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '';
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  const seconds = Math.round((to - from) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export default function JobList({ initialJobs }: JobListProps) {
  const [jobs, setJobs] = useState<ScrapeJob[]>(initialJobs);
  const [, setTick] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [placesModal, setPlacesModal] = useState<{ places: unknown[]; label: string } | null>(null);

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

  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === 'pending' || j.status === 'running');
    if (!hasActive) return;

    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, [jobs]);

  const cancelJob = async (jobId: string) => {
    setLoadingAction(jobId);
    try {
      await fetch(`/api/scrape/${jobId}`, { method: 'DELETE' });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } finally {
      setLoadingAction(null);
    }
  };

  const viewPlaces = async (job: ScrapeJob) => {
    setLoadingAction(job.id);
    try {
      const res = await fetch(`/api/scrape/${job.id}`);
      const json = await res.json();
      if (json.data?.found_places) {
        setPlacesModal({
          places: json.data.found_places,
          label: `${job.center_lat.toFixed(3)}, ${job.center_lng.toFixed(3)} — ${job.radius_miles}mi`,
        });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const rerunJob = async (jobId: string) => {
    setLoadingAction(jobId);
    try {
      await fetch(`/api/scrape/${jobId}`, { method: 'POST' });
    } finally {
      setLoadingAction(null);
    }
  };

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
        {jobs.map((job) => {
          const isPending = job.status === 'pending';
          const isRunning = job.status === 'running';
          const isActive = isPending || isRunning;
          const isFinished = job.status === 'completed' || job.status === 'failed';
          const isBusy = loadingAction === job.id;

          return (
            <div key={job.id} className={`job-card${isActive ? ' job-card-active' : ''}`}>
              <div className="job-card-header">
                <span
                  className="job-status-badge"
                  style={{ color: STATUS_COLORS[job.status] }}
                >
                  {job.status.toUpperCase()}
                </span>
                <span className="job-card-time">{formatTime(job.created_at)}</span>
              </div>

              <div className="job-card-location">
                {job.center_lat.toFixed(3)}, {job.center_lng.toFixed(3)} — {job.radius_miles}mi
                {job.query_filter && <span className="job-card-query"> &middot; &ldquo;{job.query_filter}&rdquo;</span>}
              </div>

              <div className="job-card-status-detail">
                {isPending && 'Waking up worker machine...'}
                {isRunning && `Scanning tiles — ${formatDuration(job.started_at, null)} elapsed`}
                {job.status === 'completed' && `Finished in ${formatDuration(job.started_at, job.completed_at)}`}
                {job.status === 'failed' && 'Job failed — see error below'}
              </div>

              {(isPending || isRunning || job.status === 'completed') && (
                <ProgressBar
                  current={job.tiles_done}
                  total={job.tiles_total || 1}
                  label={isPending ? 'Waiting to start...' : 'Tiles scanned'}
                />
              )}

              <div className="job-card-stats">
                <span>Places found: {job.total_found}</span>
                <span>Qualified leads: {job.qualified_count}</span>
              </div>

              {job.error_message && (
                <div className="job-card-error">
                  <strong>Error:</strong> {job.error_message}
                </div>
              )}

              {/* Action buttons */}
              <div className="job-card-actions">
                {isActive && (
                  <button
                    className="job-action-btn job-action-cancel"
                    onClick={() => cancelJob(job.id)}
                    disabled={isBusy}
                  >
                    {isBusy ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                {isFinished && (
                  <>
                    {job.total_found > 0 && (
                      <button
                        className="job-action-btn job-action-view"
                        onClick={() => viewPlaces(job)}
                        disabled={isBusy}
                      >
                        {isBusy ? 'Loading...' : `View ${job.total_found} Places`}
                      </button>
                    )}
                    <button
                      className="job-action-btn job-action-rerun"
                      onClick={() => rerunJob(job.id)}
                      disabled={isBusy}
                    >
                      Re-run
                    </button>
                    <button
                      className="job-action-btn job-action-cancel"
                      onClick={() => cancelJob(job.id)}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {placesModal && (
        <PlacesModal
          places={placesModal.places as never[]}
          jobLabel={placesModal.label}
          onClose={() => setPlacesModal(null)}
        />
      )}
    </div>
  );
}
