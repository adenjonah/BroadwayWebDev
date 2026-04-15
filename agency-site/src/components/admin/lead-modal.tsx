'use client';

import { useState } from 'react';
import type { Lead, LeadStage } from '@/lib/types/scraping';
import { LEAD_STAGES } from '@/lib/types/scraping';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updated: Lead) => void;
}

export default function LeadModal({ lead, onClose, onUpdate }: LeadModalProps) {
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [notes, setNotes] = useState(lead.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, notes }),
      });
      const { data } = await res.json();
      if (data) {
        onUpdate(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const scoreStars = '★'.repeat(lead.lead_score) + '☆'.repeat(5 - lead.lead_score);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <span className="modal-label">Address</span>
            <span>{lead.address || '—'}</span>
          </div>

          <div className="modal-field">
            <span className="modal-label">Phone</span>
            <span>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}</span>
          </div>

          <div className="modal-field">
            <span className="modal-label">Google Maps</span>
            <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer">
              Open in Maps &rarr;
            </a>
          </div>

          <div className="modal-field">
            <span className="modal-label">Type</span>
            <span>{lead.primary_type || '—'}</span>
          </div>

          <div className="modal-field">
            <span className="modal-label">All Types</span>
            <span className="modal-types">{lead.types.join(', ') || '—'}</span>
          </div>

          <div className="modal-field">
            <span className="modal-label">Lead Score</span>
            <span className="modal-score">{scoreStars}</span>
          </div>

          <div className="modal-divider" />

          <div className="form-group">
            <label htmlFor="modal-stage">Stage</label>
            <select
              id="modal-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStage)}
            >
              {LEAD_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="modal-notes">Notes</label>
            <textarea
              id="modal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={4}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
