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
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const updateMarker = useCallback(
    (lat: number, lng: number) => {
      const map = mapInstance.current;
      if (!map || !window.google) return;

      const position = { lat, lng };

      if (markerRef.current) {
        markerRef.current.position = position;
      } else {
        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
        });
      }

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places,marker&v=weekly`;
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
      mapId: 'broadway-scraper-map',
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

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        updateMarker(e.latLng.lat(), e.latLng.lng());
      }
    });

    mapInstance.current = map;
  }, [loaded, initialLat, initialLng, updateMarker]);

  // Update circle radius when radiusMiles changes
  useEffect(() => {
    if (circleRef.current) {
      const radiusMeters = radiusMiles * 1609.34;
      circleRef.current.setRadius(radiusMeters);
      const map = mapInstance.current;
      if (map) {
        map.fitBounds(circleRef.current.getBounds()!);
      }
    }
  }, [radiusMiles]);

  const handleSearch = async () => {
    if (!searchValue.trim() || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ address: searchValue });
      if (result.results[0]) {
        const loc = result.results[0].geometry.location;
        updateMarker(loc.lat(), loc.lng());
        setSearchValue('');
      }
    } catch {
      // Geocoding failed silently
    }
  };

  return (
    <div className="map-picker">
      <div className="map-picker-search">
        <input
          type="text"
          placeholder="Search for an address..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button type="button" onClick={handleSearch} className="btn btn-outline">
          Search
        </button>
      </div>
      <div ref={mapRef} className="map-picker-canvas" />
      {!loaded && <div className="map-picker-loading">Loading map...</div>}
    </div>
  );
}
