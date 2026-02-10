'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import per evitare SSR issues con Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Mock data - stesso dei risultati
const mockLocations = [
  { id: '1', lat: 45.4773, lng: 9.2055, price: 550, title: 'Stanza Porta Venezia' },
  { id: '2', lat: 45.4951, lng: 9.2264, price: 450, title: 'Stanza Via Padova' },
  { id: '3', lat: 45.4485, lng: 9.1769, price: 750, title: 'Monolocale Navigli' },
  { id: '4', lat: 45.4815, lng: 9.2127, price: 600, title: 'Stanza Buenos Aires' },
];

export function SearchMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Caricamento mappa...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[45.4642, 9.1900]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockLocations.map((location) => (
          <Marker key={location.id} position={[location.lat, location.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{location.title}</h3>
                <p className="text-primary-600 font-bold">€{location.price}/mese</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
