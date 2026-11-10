import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { MapPin, WAHDAT_COLONY_PIN, isValidMapPin } from '../utils/maps';

interface MapPinPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (pin: MapPin) => void;
}

function roundCoord(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export const MapPinPicker: React.FC<MapPinPickerProps> = ({ latitude, longitude, onChange }) => {
  const start = isValidMapPin(latitude, longitude)
    ? { lat: latitude, lng: longitude as number }
    : WAHDAT_COLONY_PIN;
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = L.map(mapNode.current, { scrollWheelZoom: true }).setView([start.lat, start.lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const icon = L.divIcon({
      className: 'map-pin-marker',
      html: '<span></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 26]
    });
    const marker = L.marker([start.lat, start.lng], { icon, draggable: true }).addTo(map);
    const publish = (latlng: L.LatLng) => {
      onChangeRef.current({ lat: roundCoord(latlng.lat), lng: roundCoord(latlng.lng) });
    };
    marker.on('dragend', () => publish(marker.getLatLng()));
    map.on('click', (event: L.LeafletMouseEvent) => {
      marker.setLatLng(event.latlng);
      publish(event.latlng);
    });
    mapRef.current = map;
    markerRef.current = marker;
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => {
      window.cancelAnimationFrame(frame);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once. Later coordinate changes move the marker below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isValidMapPin(latitude, longitude) || !markerRef.current || !mapRef.current) return;
    const next = L.latLng(latitude, longitude as number);
    const current = markerRef.current.getLatLng();
    if (Math.abs(current.lat - next.lat) < 1e-7 && Math.abs(current.lng - next.lng) < 1e-7) return;
    markerRef.current.setLatLng(next);
    mapRef.current.panTo(next);
  }, [latitude, longitude]);

  const applyTyped = (nextLat: string, nextLng: string) => {
    if (nextLat.trim() === '' || nextLng.trim() === '') return;
    const lat = Number(nextLat);
    const lng = Number(nextLng);
    if (!isValidMapPin(lat, lng)) {
      setStatus('Enter a latitude between -90 and 90 and a longitude between -180 and 180.');
      return;
    }
    setStatus('');
    onChange({ lat: roundCoord(lat), lng: roundCoord(lng) });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus('This browser cannot read your current location. Click the map instead.');
      return;
    }
    setStatus('Finding your current location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pin = {
          lat: roundCoord(position.coords.latitude),
          lng: roundCoord(position.coords.longitude)
        };
        setStatus('');
        onChange(pin);
      },
      () => {
        setStatus('Location permission was blocked. Click the map or type the coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="map-pin-picker">
      <p className="map-pin-help">Click the map or drag the pin. Then save so the public Google Map uses this point.</p>
      <div ref={mapNode} className="map-pin-canvas" role="application" aria-label="Map pin picker" />
      <div className="map-pin-fields">
        <label>
          Latitude
          <input
            type="number"
            step="0.000001"
            value={latitude ?? ''}
            onChange={(event) => applyTyped(event.target.value, String(longitude ?? ''))}
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="0.000001"
            value={longitude ?? ''}
            onChange={(event) => applyTyped(String(latitude ?? ''), event.target.value)}
          />
        </label>
        <button type="button" className="btn btn-outline" onClick={useMyLocation}>
          <LocateFixed size={16} aria-hidden="true" /> Use my current location
        </button>
      </div>
      {status ? <p className="map-pin-status" role="status">{status}</p> : null}
    </div>
  );
};
