'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, LeadStage } from '@/lib/types/scraping';
import { LEAD_STAGES } from '@/lib/types/scraping';
import LeadModal from './lead-modal';
import BulkActions from './bulk-actions';

interface LeadsTableProps {
  initialData: Lead[];
  initialTotal: number;
}

const STAGE_COLORS: Record<LeadStage, string> = {
  new: 'var(--accent)',
  contacted_setter: '#f59e0b',
  contacted_closer: '#f97316',
  hard_no: '#ef4444',
  maybe_later: '#8b5cf6',
  sold: '#22c55e',
};

export default function LeadsTable({ initialData, initialTotal }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState('discovered_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const limit = 25;

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    if (search) params.set('search', search);
    if (stageFilter) params.set('stage', stageFilter);
    if (minScore) params.set('minScore', minScore);

    const res = await fetch(`/api/leads?${params}`);
    const json = await res.json();
    if (json.data) {
      setLeads(json.data);
      setTotal(json.meta.total);
    }
  }, [page, search, stageFilter, minScore, sortBy, sortDir]);

  // Refetch when filters change (but not on initial mount — we have initialData)
  const isFirstRender = useState(true);
  useEffect(() => {
    if (isFirstRender[0]) {
      isFirstRender[0] = false;
      return;
    }
    fetchLeads();
  }, [fetchLeads]);

  // Subscribe to new leads via Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  };

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setModalLead(null);
  };

  const handleBulkComplete = () => {
    setSelected(new Set());
    fetchLeads();
  };

  const totalPages = Math.ceil(total / limit);
  const sortArrow = (col: string) => (sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');

  const stageLabel = (stage: LeadStage) =>
    LEAD_STAGES.find((s) => s.value === stage)?.label ?? stage;

  return (
    <div className="leads-section">
      <h3>Leads ({total})</h3>

      {/* Filters */}
      <div className="leads-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="leads-search"
        />
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Stages</option>
          {LEAD_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={minScore}
          onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
        >
          <option value="">Any Score</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      <BulkActions selectedIds={[...selected]} onComplete={handleBulkComplete} />

      {/* Table */}
      <div className="leads-table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th className="leads-th-check">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selected.size === leads.length}
                  onChange={toggleAll}
                />
              </th>
              <th onClick={() => handleSort('name')} className="leads-th-sort">
                Name{sortArrow('name')}
              </th>
              <th onClick={() => handleSort('primary_type')} className="leads-th-sort">
                Type{sortArrow('primary_type')}
              </th>
              <th>Phone</th>
              <th onClick={() => handleSort('lead_score')} className="leads-th-sort">
                Score{sortArrow('lead_score')}
              </th>
              <th>Website</th>
              <th onClick={() => handleSort('stage')} className="leads-th-sort">
                Stage{sortArrow('stage')}
              </th>
              <th onClick={() => handleSort('discovered_at')} className="leads-th-sort">
                Found{sortArrow('discovered_at')}
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`leads-row${selected.has(lead.id) ? ' leads-row-selected' : ''}`}
                onClick={() => setModalLead(lead)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                  />
                </td>
                <td className="leads-cell-name">{lead.name}</td>
                <td>{lead.primary_type || '—'}</td>
                <td>{lead.phone || '—'}</td>
                <td className="leads-cell-score">
                  {'★'.repeat(lead.lead_score)}
                  {'☆'.repeat(5 - lead.lead_score)}
                </td>
                <td className="leads-cell-website" onClick={(e) => e.stopPropagation()}>
                  {lead.discovered_website ? (
                    <a
                      href={lead.discovered_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leads-website-link"
                      title={lead.discovered_website}
                    >
                      Found
                    </a>
                  ) : (
                    <span className="leads-website-none">None</span>
                  )}
                </td>
                <td>
                  <span
                    className="leads-stage-badge"
                    style={{ color: STAGE_COLORS[lead.stage] }}
                  >
                    {stageLabel(lead.stage)}
                  </span>
                </td>
                <td className="leads-cell-date">
                  {new Date(lead.discovered_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="leads-empty">No leads found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="leads-pagination">
          <button
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Prev
          </button>
          <span className="leads-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Next
          </button>
        </div>
      )}

      {modalLead && (
        <LeadModal
          lead={modalLead}
          onClose={() => setModalLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
