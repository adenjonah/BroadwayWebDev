'use client';

import { useState, useCallback } from 'react';
import MapPicker from './map-picker';
import type { ScrapeJob } from '@/lib/types/scraping';

interface ScrapeFormProps {
  onJobCreated: (job: ScrapeJob) => void;
}

export default function ScrapeForm({ onJobCreated }: ScrapeFormProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radiusText, setRadiusText] = useState('3');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const radiusMiles = parseFloat(radiusText) || 0;

  const handleLocationSelect = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleSubmit = async () => {
    if (lat === null || lng === null) {
      setError('Click the map to set a center point.');
      return;
    }

    if (radiusMiles <= 0 || radiusMiles > 50) {
      setError('Radius must be between 0.1 and 50 miles.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, radiusMiles, query: query || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to start scrape');
        return;
      }

      if (data.workerStatus && data.workerStatus !== 'accepted') {
        setError(`Job created but worker trigger failed: ${data.workerStatus}`);
        // Still notify so the job shows in the list, but error stays visible
      }
      if (data.job) {
        onJobCreated(data.job);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scrape-form">
      <h3>New Scrape</h3>
      <p className="scrape-form-hint">Click the map to set the search center, then configure radius and start.</p>

      <MapPicker
        onLocationSelect={handleLocationSelect}
        radiusMiles={radiusMiles}
      />

      <div className="scrape-form-controls">
        <div className="scrape-form-row">
          <div className="form-group">
            <label htmlFor="radius">Radius (miles)</label>
            <input
              type="text"
              inputMode="decimal"
              id="radius"
              placeholder="3"
              value={radiusText}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty, digits, and one decimal point
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setRadiusText(val);
                }
              }}
              onBlur={() => {
                // On blur, if empty or invalid, don't force a value — let the user keep typing
                if (radiusText === '' || radiusText === '.') return;
                const num = parseFloat(radiusText);
                if (num > 50) setRadiusText('50');
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="query">Filter (optional)</label>
            <input
              type="text"
              id="query"
              placeholder='e.g. "restaurant" or "plumber"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {lat !== null && lng !== null && (
          <div className="scrape-form-coords">
            Center: {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        )}

        {error && <div className="scrape-form-error">{error}</div>}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || lat === null || radiusMiles <= 0}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {submitting ? 'Starting...' : 'Start Scrape'}
        </button>
      </div>
    </div>
  );
}
