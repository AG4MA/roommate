'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ListingCard } from '@roommate/shared';

// Dynamic imports for react-leaflet (avoid SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false },
);

// Helper to fire bounds-change events from the inner map
const MapEvents = dynamic(
  () =>
    Promise.resolve(
      function MapEventsInner({
        onBoundsChange,
      }: {
        onBoundsChange?: (b: { north: number; south: number; east: number; west: number }) => void;
      }) {
        const { useMapEvents } = require('react-leaflet');
        const debounceRef = useRef<ReturnType<typeof setTimeout>>();

        useMapEvents({
          moveend(e: L.LeafletEvent) {
            if (!onBoundsChange) return;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              const map = e.target as L.Map;
              const b = map.getBounds();
              onBoundsChange({
                north: b.getNorth(),
                south: b.getSouth(),
                east: b.getEast(),
                west: b.getWest(),
              });
            }, 600);
          },
        });
        return null;
      },
    ),
  { ssr: false },
);

// Create a custom price-badge icon for each listing
function makePriceIcon(price: number) {
  if (typeof window === 'undefined') return undefined;
  return L.divIcon({
    className: '',
    html: `<div style="
      background: white;
      color: #0369a1;
      font-weight: 700;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,.18);
      border: 2px solid #0ea5e9;
      white-space: nowrap;
      text-align: center;
    ">€${price}</div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 15],
    popupAnchor: [0, -15],
  });
}

interface SearchMapProps {
  listings: ListingCard[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export function SearchMap({ listings, onBoundsChange }: SearchMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm">Caricamento mappa...</p>
        </div>
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
        className="h-full w-full rounded-none lg:rounded-xl"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* CartoDB Voyager — modern, clean basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Fire bounds change on map pan/zoom */}
        <MapEvents onBoundsChange={onBoundsChange} />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={makePriceIcon(listing.price)}
          >
            <Popup maxWidth={260} closeButton={false}>
              <Link href={`/stanza/${listing.id}`} className="block group">
                {listing.images?.[0]?.url && (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-primary-600 transition-colors">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{listing.neighborhood || listing.city}</p>
                <p className="text-primary-600 font-bold text-sm mt-1">€{listing.price}/mese</p>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
