'use client';

import { useState } from 'react';

interface FoundPlace {
  place_id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  google_maps_url: string;
  primary_type: string;
  types: string[];
}

interface PlacesModalProps {
  places: FoundPlace[];
  jobLabel: string;
  onClose: () => void;
}

export default function PlacesModal({ places, jobLabel, onClose }: PlacesModalProps) {
  const [filter, setFilter] = useState<'all' | 'no_website' | 'has_website'>('all');
  const [search, setSearch] = useState('');

  const filtered = places.filter((p) => {
    if (filter === 'no_website' && p.website) return false;
    if (filter === 'has_website' && !p.website) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const noWebsiteCount = places.filter((p) => !p.website).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content places-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>All Places Found</h2>
            <p className="places-modal-sub">{jobLabel} &middot; {places.length} total &middot; {noWebsiteCount} without website</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="places-modal-filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All ({places.length})</option>
            <option value="no_website">No website ({noWebsiteCount})</option>
            <option value="has_website">Has website ({places.length - noWebsiteCount})</option>
          </select>
        </div>

        <div className="places-modal-list">
          {filtered.map((place) => (
            <div key={place.place_id} className="places-modal-item">
              <div className="places-modal-item-header">
                <span className="places-modal-item-name">{place.name}</span>
                <span className={`places-modal-item-badge ${place.website ? 'has-site' : 'no-site'}`}>
                  {place.website ? 'Has website' : 'No website'}
                </span>
              </div>
              <div className="places-modal-item-details">
                {place.primary_type && <span className="places-modal-item-type">{place.primary_type}</span>}
                {place.phone && <span>{place.phone}</span>}
              </div>
              {place.address && <div className="places-modal-item-address">{place.address}</div>}
              <div className="places-modal-item-links">
                {place.google_maps_url && (
                  <a href={place.google_maps_url} target="_blank" rel="noopener noreferrer">Maps &rarr;</a>
                )}
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer">Website &rarr;</a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="places-modal-empty">No places match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
