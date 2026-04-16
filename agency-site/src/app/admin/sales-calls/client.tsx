'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  SCRIPT,
  START_NODE_ID,
  type CallNode,
  type CallResponse,
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
  const [currentNodeId, setCurrentNodeId] = useState<string>(START_NODE_ID);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const node: CallNode | undefined = SCRIPT[currentNodeId];

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
    setHistory([]);
    setCurrentNodeId(START_NODE_ID);
  }, []);

  const breadcrumbs = useMemo(() => history.slice(-4), [history]);

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
            <p>Script node not found. <button className="btn btn-outline" onClick={handleReset}>Start over</button></p>
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

      <div className="admin-content">
        <div className="container sales-calls-root">
          {isOutcome ? (
            <OutcomeCard node={node} onReset={handleReset} />
          ) : (
            <SetterCard node={node} onRespond={handleResponse} />
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

function SetterCard({
  node,
  onRespond,
}: {
  node: CallNode;
  onRespond: (response: CallResponse) => void;
}) {
  return (
    <>
      <div className="sales-calls-card">
        <div className="sales-calls-speaker sales-calls-speaker--setter">You say</div>
        <div className="sales-calls-line">{node.line}</div>
        {node.note ? <div className="sales-calls-note">{node.note}</div> : null}
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
  onReset,
}: {
  node: CallNode;
  onReset: () => void;
}) {
  const outcome = node.terminal;
  if (!outcome) return null;
  const outcomeClass = OUTCOME_CLASS[outcome];
  const outcomeLabel = OUTCOME_LABEL[outcome];

  return (
    <div className={`sales-calls-outcome ${outcomeClass}`}>
      <div className="sales-calls-outcome-tag">Outcome</div>
      <div className="sales-calls-outcome-title">{outcomeLabel}</div>
      {node.note ? <div className="sales-calls-outcome-note">{node.note}</div> : null}
      <button type="button" className="btn btn-primary sales-calls-outcome-cta" onClick={onReset}>
        Start new call
      </button>
    </div>
  );
}
