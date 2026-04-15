'use client';

import { useState, useCallback } from 'react';
import MapPicker from './map-picker';

interface ScrapeFormProps {
  onJobCreated: (jobId: string) => void;
}

export default function ScrapeForm({ onJobCreated }: ScrapeFormProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(3);
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSelect = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleSubmit = async () => {
    if (lat === null || lng === null) {
      setError('Click the map to set a center point.');
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

      onJobCreated(data.jobId);
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
              type="number"
              id="radius"
              min={0.5}
              max={50}
              step={0.5}
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(parseFloat(e.target.value) || 3)}
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
          disabled={submitting || lat === null}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {submitting ? 'Starting...' : 'Start Scrape'}
        </button>
      </div>
    </div>
  );
}
