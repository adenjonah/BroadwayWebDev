'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ScrapeJob } from '@/lib/types/scraping';
import ProgressBar from './progress-bar';
import PlacesModal from './places-modal';
import StageBadge, { stageFor } from './stage-badge';

interface JobListProps {
  jobs: ScrapeJob[];
  setJobs: Dispatch<SetStateAction<ScrapeJob[]>>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  running: 'var(--accent)',
  completed: '#22c55e',
  failed: '#ef4444',
};

// Rough verification cost per candidate (DDG delay + jitter average)
const VERIFY_SECONDS_PER_CANDIDATE = 5;
// Guess: ~30% of found places survive the candidate filter
const CANDIDATE_YIELD_ESTIMATE = 0.3;
// Suppress ETA until we have this many seconds of data
const ETA_WARMUP_SECONDS = 10;

// Google Places API (New) Text Search Pro SKU: $32 / 1000 calls.
const GOOGLE_TEXT_SEARCH_COST_PER_CALL = 0.032;
// Per-tile: 14 categories × ~1.8 pages avg = ~25 calls (see worker/places.py).
const CALLS_PER_TILE_NO_FILTER = 14 * 1.8;
// User-specified query: single category × ~1.8 pages.
const CALLS_PER_TILE_WITH_FILTER = 1.8;

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

function formatEta(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (minutes < 60) return `${minutes}m ${secs}s`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatUsd(n: number): string {
  if (n < 0.01) return '<$0.01';
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${Math.round(n)}`;
}

function estimateCostUsd(job: ScrapeJob): { spent: number; projected: number } {
  const callsPerTile = job.query_filter
    ? CALLS_PER_TILE_WITH_FILTER
    : CALLS_PER_TILE_NO_FILTER;
  const spent = job.tiles_done * callsPerTile * GOOGLE_TEXT_SEARCH_COST_PER_CALL;
  const projected =
    Math.max(job.tiles_total, job.tiles_done) *
    callsPerTile *
    GOOGLE_TEXT_SEARCH_COST_PER_CALL;
  return { spent, projected };
}

function estimateEtaSeconds(job: ScrapeJob): number | null {
  if (!job.started_at) return null;
  const elapsed = (Date.now() - new Date(job.started_at).getTime()) / 1000;
  if (elapsed < ETA_WARMUP_SECONDS) return null;

  const stage = stageFor(job);
  if (stage === 'scanning') {
    if (job.tiles_done <= 0 || job.tiles_total <= 0) return null;
    const tileSeconds = elapsed / job.tiles_done;
    const tilesLeft = Math.max(0, job.tiles_total - job.tiles_done);
    const scanEta = tilesLeft * tileSeconds;
    // Approximate verify phase: we don't know candidates yet
    const projectedCandidates =
      (job.total_found / Math.max(1, job.tiles_done)) *
      job.tiles_total *
      CANDIDATE_YIELD_ESTIMATE;
    const verifyEta = projectedCandidates * VERIFY_SECONDS_PER_CANDIDATE;
    return scanEta + verifyEta;
  }
  if (stage === 'verifying') {
    const left = Math.max(0, job.candidates_total - job.candidates_verified);
    return left * VERIFY_SECONDS_PER_CANDIDATE;
  }
  return null;
}

const ACTIVE_POLL_MS = 3000;

export default function JobList({ jobs, setJobs }: JobListProps) {
  const [, setTick] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [placesModal, setPlacesModal] = useState<{ places: unknown[]; label: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('scrape-jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scrape_jobs' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id?: string };
            if (deleted?.id) {
              setJobs((prev) => prev.filter((j) => j.id !== deleted.id));
            }
            return;
          }

          const updated = payload.new as ScrapeJob;
          if (!updated?.id || !updated?.status) return;

          setJobs((prev) => {
            const exists = prev.find((j) => j.id === updated.id);
            if (exists) {
              // Reconcile newer fields; optimistic insert fills in the gaps.
              return prev.map((j) => (j.id === updated.id ? { ...j, ...updated } : j));
            }
            return [updated, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setJobs]);

  // Polling fallback: Realtime doesn't always deliver on this plan/network,
  // so while any job is active, refetch those rows every few seconds and
  // merge in updates. Also drives elapsed-time / ETA re-renders.
  const activeIdsKey = jobs
    .filter((j) => j.status === 'pending' || j.status === 'running')
    .map((j) => j.id)
    .sort()
    .join(',');

  useEffect(() => {
    if (!activeIdsKey) return;
    const ids = activeIdsKey.split(',');
    const supabase = createClient();

    let cancelled = false;
    const poll = async () => {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .in('id', ids);
      if (cancelled || error || !data) return;
      setJobs((prev) =>
        prev.map((j) => {
          const latest = data.find((d) => d.id === j.id) as ScrapeJob | undefined;
          return latest ? { ...j, ...latest } : j;
        }),
      );
    };

    void poll();
    const interval = setInterval(poll, ACTIVE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeIdsKey, setJobs]);

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
          const stage = stageFor(job);
          const isPending = stage === 'queuing';
          const isScanning = stage === 'scanning';
          const isVerifying = stage === 'verifying';
          const isActive = isPending || isScanning || isVerifying;
          const isFinished = stage === 'done' || stage === 'failed';
          const isBusy = loadingAction === job.id;

          const etaSeconds = isActive ? estimateEtaSeconds(job) : null;
          const cost = estimateCostUsd(job);

          return (
            <div key={job.id} className={`job-card${isActive ? ' job-card-active' : ''}`}>
              <div className="job-card-header">
                <div className="job-card-header-left">
                  <StageBadge job={job} />
                  <span
                    className="job-status-badge"
                    style={{ color: STATUS_COLORS[job.status] }}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <span className="job-card-time">{mounted ? formatTime(job.created_at) : ''}</span>
              </div>

              <div className="job-card-location">
                {job.center_lat.toFixed(3)}, {job.center_lng.toFixed(3)} — {job.radius_miles}mi
                {job.query_filter && <span className="job-card-query"> &middot; &ldquo;{job.query_filter}&rdquo;</span>}
              </div>

              {isPending && (
                <div className="job-card-status-detail">Waking up worker machine...</div>
              )}

              {isScanning && (
                <>
                  <ProgressBar
                    current={job.tiles_done}
                    total={job.tiles_total || 1}
                    label="Tiles scanned"
                  />
                  <div className="job-card-status-detail">
                    {job.tiles_total > 0
                      ? `Tile ${job.current_tile || job.tiles_done}/${job.tiles_total}`
                      : 'Preparing tiles...'}
                    {job.current_category && (
                      <> &middot; searching: <em>{job.current_category}</em></>
                    )}
                  </div>
                </>
              )}

              {isVerifying && (
                <>
                  <ProgressBar
                    current={job.candidates_verified}
                    total={job.candidates_total}
                    label="Verifying candidates (DDG)"
                  />
                  <div className="job-card-status-detail">
                    DDG verifying candidate {job.candidates_verified}/{job.candidates_total}
                  </div>
                </>
              )}

              {isFinished && stage === 'done' && (
                <div className="job-card-status-detail">
                  Finished in {mounted ? formatDuration(job.started_at, job.completed_at) : '...'}
                </div>
              )}
              {isFinished && stage === 'failed' && (
                <div className="job-card-status-detail">Job failed — see error below</div>
              )}

              {isActive && (
                <>
                  <div className="job-card-live">
                    <span>📍 {job.total_found} places found so far</span>
                    {mounted && etaSeconds !== null && (
                      <span>&middot; ⏱ ~{formatEta(etaSeconds)} remaining (est.)</span>
                    )}
                    {mounted && job.started_at && (
                      <span>&middot; {formatDuration(job.started_at, null)} elapsed</span>
                    )}
                  </div>
                  <div
                    className="job-card-live job-card-cost"
                    title="Google Places text search @ $32/1000 calls, ~25 calls per tile (14 categories × ~1.8 pages avg)"
                  >
                    <span>💰 {formatUsd(cost.spent)} spent</span>
                    <span>&middot; ~{formatUsd(cost.projected)} projected total (est.)</span>
                  </div>
                </>
              )}

              <div className="job-card-stats">
                <span>Places found: {job.total_found}</span>
                <span>Qualified leads: {job.qualified_count}</span>
                {isFinished && (
                  <span
                    title="Estimate: $32/1000 calls × tiles × ~25 calls per tile. Verify actual spend in Google Cloud billing."
                  >
                    Est. cost: ~{formatUsd(cost.projected)}
                  </span>
                )}
              </div>

              {job.error_message && (
                <div className="job-card-error">
                  <strong>Error:</strong> {job.error_message}
                </div>
              )}

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
