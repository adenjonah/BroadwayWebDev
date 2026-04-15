'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  radiusMiles: number;
  initialLat?: number;
  initialLng?: number;
}

declare global {
  interface Window {
    initMap?: () => void;
    google?: typeof google;
  }
}

export default function MapPicker({
  onLocationSelect,
  radiusMiles,
  initialLat = 40.7580,
  initialLng = -73.9855,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState('');

  const placeMarker = useCallback(
    (lat: number, lng: number) => {
      const map = mapInstance.current;
      if (!map || !window.google) return;

      const position = { lat, lng };

      // Update or create draggable marker
      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new google.maps.Marker({
          map,
          position,
          draggable: true,
          title: 'Drag to reposition',
        });

        // Update position when marker is dragged
        markerRef.current.addListener('dragend', () => {
          const pos = markerRef.current?.getPosition();
          if (pos && circleRef.current) {
            circleRef.current.setCenter(pos);
            onLocationSelect(pos.lat(), pos.lng());
          }
        });
      }

      // Update or create radius circle
      const radiusMeters = radiusMiles * 1609.34;
      if (circleRef.current) {
        circleRef.current.setCenter(position);
        circleRef.current.setRadius(radiusMeters);
      } else {
        circleRef.current = new google.maps.Circle({
          map,
          center: position,
          radius: radiusMeters,
          fillColor: '#4d8eff',
          fillOpacity: 0.1,
          strokeColor: '#4d8eff',
          strokeOpacity: 0.4,
          strokeWeight: 2,
        });
      }

      map.fitBounds(circleRef.current.getBounds()!);
      onLocationSelect(lat, lng);
    },
    [radiusMiles, onLocationSelect]
  );

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    window.initMap = () => setLoaded(true);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMap;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstance.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: initialLat, lng: initialLng },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0b10' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
      ],
    });

    // Click anywhere on the map to place/move the pin
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        placeMarker(e.latLng.lat(), e.latLng.lng());
      }
    });

    mapInstance.current = map;
  }, [loaded, initialLat, initialLng, placeMarker]);

  // Update circle radius when radiusMiles changes
  useEffect(() => {
    if (circleRef.current && radiusMiles > 0) {
      const radiusMeters = radiusMiles * 1609.34;
      circleRef.current.setRadius(radiusMeters);
      const map = mapInstance.current;
      if (map) {
        map.fitBounds(circleRef.current.getBounds()!);
      }
    }
  }, [radiusMiles]);

  const handleSearch = async () => {
    const query = searchValue.trim();
    if (!query || !window.google) return;

    setSearchError('');

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ address: query });
      if (response.results && response.results.length > 0) {
        const loc = response.results[0].geometry.location;
        placeMarker(loc.lat(), loc.lng());
        setSearchValue('');
      } else {
        setSearchError('No results found.');
      }
    } catch {
      setSearchError('Search failed. Try a more specific address.');
    }
  };

  return (
    <div className="map-picker">
      <div className="map-picker-search">
        <input
          type="text"
          placeholder="Search for a city or address..."
          value={searchValue}
          onChange={(e) => { setSearchValue(e.target.value); setSearchError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
        />
        <button type="button" onClick={handleSearch} className="btn btn-outline">
          Go
        </button>
      </div>
      {searchError && <div className="map-picker-error">{searchError}</div>}
      <div ref={mapRef} className="map-picker-canvas" />
      {!loaded && <div className="map-picker-loading">Loading map...</div>}
      <div className="map-picker-hint">Click to place pin &middot; Drag pin to reposition</div>
    </div>
  );
}
