'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  SCRIPT,
  START_NODE_ID,
  PATH_LABEL,
  PATH_SHORT,
  resolveLine,
  type CallNode,
  type CallResponse,
  type CallPath,
  type ResponseTone,
  type TerminalOutcome,
} from '@/lib/sales-calls/script';

interface HistoryEntry {
  nodeId: string;
  responseLabel: string;
}

const TONE_CLASS: Record<ResponseTone, string> = {
  positive: 'sales-calls-response-btn--positive',
  neutral: 'sales-calls-response-btn--neutral',
  objection: 'sales-calls-response-btn--objection',
  negative: 'sales-calls-response-btn--negative',
};

const OUTCOME_CLASS: Record<TerminalOutcome, string> = {
  booked: 'sales-calls-outcome--booked',
  callback: 'sales-calls-outcome--callback',
  not_interested: 'sales-calls-outcome--not-interested',
  wrong_number: 'sales-calls-outcome--wrong-number',
};

const OUTCOME_LABEL: Record<TerminalOutcome, string> = {
  booked: 'Appointment booked',
  callback: 'Callback scheduled',
  not_interested: 'Not interested',
  wrong_number: 'Wrong number',
};

export default function SalesCallsClient() {
  const [path, setPath] = useState<CallPath | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>(START_NODE_ID);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const node: CallNode | undefined = SCRIPT[currentNodeId];

  const handleSelectPath = useCallback((selected: CallPath) => {
    setPath(selected);
    setCurrentNodeId(START_NODE_ID);
    setHistory([]);
  }, []);

  const handleResponse = useCallback((response: CallResponse) => {
    setHistory((prev) => [...prev, { nodeId: currentNodeId, responseLabel: response.label }]);
    if (response.next === START_NODE_ID) {
      setHistory([]);
      setCurrentNodeId(START_NODE_ID);
      return;
    }
    setCurrentNodeId(response.next);
  }, [currentNodeId]);

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setCurrentNodeId(last.nodeId);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setPath(null);
    setHistory([]);
    setCurrentNodeId(START_NODE_ID);
  }, []);

  const breadcrumbs = useMemo(() => history.slice(-4), [history]);

  if (path === null) {
    return <PathSelector onSelect={handleSelectPath} />;
  }

  if (!node) {
    return (
      <>
        <div className="admin-header">
          <div className="container">
            <h1>Sales Call Script</h1>
          </div>
        </div>
        <div className="admin-content">
          <div className="container">
            <p>
              Script node not found.{' '}
              <button className="btn btn-outline" onClick={handleReset}>Start over</button>
            </p>
          </div>
        </div>
      </>
    );
  }

  const isOutcome = node.speaker === 'outcome' && node.terminal !== undefined;

  return (
    <>
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>Sales Call Script</h1>
              <p>Read the line. Click what they said. Next line shows up.</p>
            </div>
            <div className="sales-calls-header-actions">
              <span className="sales-calls-path-chip">{PATH_SHORT[path]}</span>
              <button
                type="button"
                className="btn btn-outline sales-calls-reset"
                onClick={handleReset}
              >
                Start new call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container sales-calls-root">
          {isOutcome ? (
            <OutcomeCard node={node} path={path} onReset={handleReset} />
          ) : (
            <SetterCard node={node} path={path} onRespond={handleResponse} />
          )}

          <div className="sales-calls-footer">
            <button
              type="button"
              className="btn btn-outline sales-calls-back"
              onClick={handleBack}
              disabled={history.length === 0}
            >
              ← Back
            </button>
            <div className="sales-calls-history" aria-label="Recent steps">
              {breadcrumbs.length === 0 ? (
                <span className="sales-calls-history-empty">Call just started.</span>
              ) : (
                breadcrumbs.map((entry, idx) => (
                  <span key={`${entry.nodeId}-${idx}`} className="sales-calls-history-chip">
                    <span className="sales-calls-history-node">{entry.nodeId}</span>
                    <span className="sales-calls-history-sep">→</span>
                    <span className="sales-calls-history-resp">{entry.responseLabel}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PathSelector({ onSelect }: { onSelect: (path: CallPath) => void }) {
  return (
    <>
      <div className="admin-header">
        <div className="container">
          <h1>Sales Call Script</h1>
          <p>Pick the right script path for this lead before you dial.</p>
        </div>
      </div>
      <div className="admin-content">
        <div className="container sales-calls-root">
          <div className="sales-calls-path-selector">
            <div className="sales-calls-path-prompt">
              Does this business currently have a website?
            </div>
            <div className="sales-calls-path-options">
              <button
                type="button"
                className="sales-calls-path-option sales-calls-path-option--no"
                onClick={() => onSelect('no_website')}
              >
                <span className="sales-calls-path-option-title">No current site</span>
                <span className="sales-calls-path-option-sub">
                  {PATH_LABEL.no_website}. Pitch: &quot;we already built you one.&quot;
                </span>
              </button>
              <button
                type="button"
                className="sales-calls-path-option sales-calls-path-option--yes"
                onClick={() => onSelect('has_website')}
              >
                <span className="sales-calls-path-option-title">Has a site</span>
                <span className="sales-calls-path-option-sub">
                  {PATH_LABEL.has_website}. Pitch: &quot;we already built you a redesign.&quot;
                </span>
              </button>
            </div>
            <div className="sales-calls-path-hint">
              You can switch paths by clicking &quot;Start new call&quot; at any time.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SetterCard({
  node,
  path,
  onRespond,
}: {
  node: CallNode;
  path: CallPath;
  onRespond: (response: CallResponse) => void;
}) {
  const line = resolveLine(node.line, path);
  const noteText = node.note ? resolveLine(node.note, path) : null;

  return (
    <>
      <div className="sales-calls-card">
        <div className="sales-calls-speaker sales-calls-speaker--setter">You say</div>
        <div className="sales-calls-line">{line}</div>
        {noteText ? <div className="sales-calls-note">{noteText}</div> : null}
      </div>

      <div className="sales-calls-responses-label">They said…</div>
      <div className="sales-calls-responses">
        {node.responses.map((response, idx) => {
          const toneClass = response.tone ? TONE_CLASS[response.tone] : '';
          return (
            <button
              key={`${response.label}-${idx}`}
              type="button"
              className={`sales-calls-response-btn ${toneClass}`.trim()}
              onClick={() => onRespond(response)}
            >
              <span className="sales-calls-response-label">{response.label}</span>
              <span className="sales-calls-response-arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function OutcomeCard({
  node,
  path,
  onReset,
}: {
  node: CallNode;
  path: CallPath;
  onReset: () => void;
}) {
  const outcome = node.terminal;
  if (!outcome) return null;
  const outcomeClass = OUTCOME_CLASS[outcome];
  const outcomeLabel = OUTCOME_LABEL[outcome];
  const noteText = node.note ? resolveLine(node.note, path) : null;

  return (
    <div className={`sales-calls-outcome ${outcomeClass}`}>
      <div className="sales-calls-outcome-tag">Outcome</div>
      <div className="sales-calls-outcome-title">{outcomeLabel}</div>
      {noteText ? <div className="sales-calls-outcome-note">{noteText}</div> : null}
      <button type="button" className="btn btn-primary sales-calls-outcome-cta" onClick={onReset}>
        Start new call
      </button>
    </div>
  );
}
