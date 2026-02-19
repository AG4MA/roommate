'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ListingCard } from '@roommate/shared';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer   = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker      = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup       = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const MapEvents = dynamic(
  () => Promise.resolve(function MapEventsInner({ onBoundsChange }: { onBoundsChange?: (b: { north: number; south: number; east: number; west: number }) => void }) {
    const { useMapEvents } = require('react-leaflet');
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    useMapEvents({
      moveend(e: L.LeafletEvent) {
        if (!onBoundsChange) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const map = e.target as L.Map;
          const b = map.getBounds();
          onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
        }, 600);
      },
    });
    return null;
  }),
  { ssr: false },
);

function makePriceIcon(price: number) {
  if (typeof window === 'undefined') return undefined;
  return L.divIcon({
    className: '',
    html: `<div class="map-price-badge">&euro;${price}</div>`,
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
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className="map-loading">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="map-spinner" />
          <p className="text-sm">Caricamento mappa...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = listings.length > 0
    ? [listings.reduce((s, l) => s + l.latitude, 0) / listings.length, listings.reduce((s, l) => s + l.longitude, 0) / listings.length]
    : [45.4642, 9.19];

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={13} className="h-full w-full rounded-none lg:rounded-xl" scrollWheelZoom zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onBoundsChange={onBoundsChange} />
        {listings.map((l) => (
          <Marker key={l.id} position={[l.latitude, l.longitude]} icon={makePriceIcon(l.price)}>
            <Popup maxWidth={260} closeButton={false}>
              <Link href={`/stanza/${l.id}`} className="block group">
                {l.images?.[0]?.url && <img src={l.images[0].url} alt={l.title} className="map-popup-img" />}
                <h3 className="map-popup-title">{l.title}</h3>
                <p className="map-popup-subtitle">{l.neighborhood || l.city}</p>
                <p className="map-popup-price">&euro;{l.price}/mese</p>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}