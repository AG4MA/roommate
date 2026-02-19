'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="background:#0284c7;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Transit stop icons by type
const transitColors: Record<string, string> = {
  BUS_STOP: '#16a34a',       // green
  TRAM_STOP: '#d97706',      // amber
  METRO_STATION: '#dc2626',  // red
  TRAIN_STATION: '#7c3aed',  // purple
  BICYCLE_PARKING: '#0891b2', // cyan
};

const transitLabels: Record<string, string> = {
  BUS_STOP: '🚌',
  TRAM_STOP: '🚊',
  METRO_STATION: '🚇',
  TRAIN_STATION: '🚉',
  BICYCLE_PARKING: '🚲',
};

function makeTransitIcon(type: string) {
  const color = transitColors[type] || '#6b7280';
  const emoji = transitLabels[type] || '📍';
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export interface TransitStop {
  type: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
}

interface LeafletMiniProps {
  lat: number;
  lng: number;
  address: string;
  transitStops?: TransitStop[];
}

export default function LeafletMini({ lat, lng, address, transitStops = [] }: LeafletMiniProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <Marker position={[lat, lng]} icon={pinIcon}>
        <Popup>{address}</Popup>
      </Marker>
      {transitStops.map((stop, idx) => (
        <Marker key={`${stop.type}-${idx}`} position={[stop.lat, stop.lng]} icon={makeTransitIcon(stop.type)}>
          <Popup>
            <strong>{stop.name}</strong>
            <br />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{stop.distanceM}m</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
