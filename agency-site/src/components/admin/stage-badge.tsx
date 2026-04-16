'use client';

import type { ScrapeJob } from '@/lib/types/scraping';

type Stage = 'queuing' | 'scanning' | 'verifying' | 'done' | 'failed';

const STAGE_META: Record<Stage, { label: string; color: string }> = {
  queuing:   { label: 'Queuing',    color: '#f59e0b' },
  scanning:  { label: 'Scanning',   color: 'var(--accent)' },
  verifying: { label: 'Verifying',  color: '#8b5cf6' },
  done:      { label: 'Done',       color: '#22c55e' },
  failed:    { label: 'Failed',     color: '#ef4444' },
};

export function stageFor(job: ScrapeJob): Stage {
  if (job.status === 'failed') return 'failed';
  if (job.status === 'completed') return 'done';
  if (job.status === 'pending') return 'queuing';
  // running
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
