'use client';

import type { ScrapeJob } from '@/lib/types/scraping';

type Stage = 'queuing' | 'scanning' | 'verifying' | 'stalled' | 'done' | 'failed';

const STAGE_META: Record<Stage, { label: string; color: string }> = {
  queuing:   { label: 'Queuing',    color: '#f59e0b' },
  scanning:  { label: 'Scanning',   color: 'var(--accent)' },
  verifying: { label: 'Verifying',  color: '#8b5cf6' },
  stalled:   { label: 'Stalled',    color: '#ef4444' },
  done:      { label: 'Done',       color: '#22c55e' },
  failed:    { label: 'Failed',     color: '#ef4444' },
};

// A running job with no heartbeat update in this window is considered
// stalled — the worker likely died mid-scan. User can click Resume.
export const STALE_HEARTBEAT_MS = 2 * 60 * 1000;

export function isStalled(job: ScrapeJob): boolean {
  if (job.status !== 'running') return false;
  if (!job.heartbeat_at) {
    // No heartbeat yet — give it a grace window based on started_at.
    if (!job.started_at) return false;
    return Date.now() - new Date(job.started_at).getTime() > STALE_HEARTBEAT_MS;
  }
  return Date.now() - new Date(job.heartbeat_at).getTime() > STALE_HEARTBEAT_MS;
}

export function stageFor(job: ScrapeJob): Stage {
  if (job.status === 'failed') return 'failed';
  if (job.status === 'completed') return 'done';
  if (job.status === 'pending') return 'queuing';
  // running
  if (isStalled(job)) return 'stalled';
  return job.candidates_total > 0 ? 'verifying' : 'scanning';
}

export default function StageBadge({ job }: { job: ScrapeJob }) {
  const stage = stageFor(job);
  const meta = STAGE_META[stage];
  return (
    <span
      className="stage-badge"
      style={{
        color: meta.color,
        borderColor: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}
