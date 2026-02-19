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

interface LeafletMiniProps {
  lat: number;
  lng: number;
  address: string;
}

export default function LeafletMini({ lat, lng, address }: LeafletMiniProps) {
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
    </MapContainer>
  );
}
