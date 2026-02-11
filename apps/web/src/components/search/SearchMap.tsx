'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ListingCard } from '@roommate/shared';

// Dynamic import to avoid SSR issues with Leaflet
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

interface SearchMapProps {
  listings: ListingCard[];
}

export function SearchMap({ listings }: SearchMapProps) {
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

  // Calculate center from listings or default to Milan
  const center: [number, number] =
    listings.length > 0
      ? [
          listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length,
          listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length,
        ]
      : [45.4642, 9.19];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => (
          <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-primary-600 font-bold">€{listing.price}/mese</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
