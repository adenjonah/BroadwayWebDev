'use client';

import { useState } from 'react';
import type { LeadStage } from '@/lib/types/scraping';
import { LEAD_STAGES } from '@/lib/types/scraping';

interface BulkActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export default function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [stage, setStage] = useState<LeadStage>('contacted_setter');
  const [applying, setApplying] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleApply = async () => {
    setApplying(true);
    try {
      await fetch('/api/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, stage }),
      });
      onComplete();
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bulk-actions">
      <span className="bulk-actions-count">{selectedIds.length} selected</span>
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value as LeadStage)}
        className="bulk-actions-select"
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        className="btn btn-primary"
        onClick={handleApply}
        disabled={applying}
        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
      >
        {applying ? 'Applying...' : `Apply to ${selectedIds.length}`}
      </button>
    </div>
  );
}
