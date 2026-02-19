'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import type { ListingCard } from '@roommate/shared';

/* ── Price badge icon ── */
function makePriceIcon(price: number, active = false) {
  return L.divIcon({
    className: '',
    html: `<div class="map-price-badge${active ? ' map-price-badge--active' : ''}">&euro;${price}</div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 15],
    popupAnchor: [0, -18],
  });
}

/* ── Map events listener ── */
function MapEvents({ onBoundsChange }: { onBoundsChange?: (b: { north: number; south: number; east: number; west: number }) => void }) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useMapEvents({
    moveend(e) {
      if (!onBoundsChange) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const map = e.target as L.Map;
        const b = map.getBounds();
        onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
      }, 500);
    },
  });
  return null;
}

/* ── Main Map component (client only) ── */
interface LeafletMapProps {
  listings: ListingCard[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export default function LeafletMap({ listings, onBoundsChange }: LeafletMapProps) {
  const center: [number, number] = listings.length > 0
    ? [
        listings.reduce((s, l) => s + l.latitude, 0) / listings.length,
        listings.reduce((s, l) => s + l.longitude, 0) / listings.length,
      ]
    : [45.4642, 9.19]; // Milano default

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-none lg:rounded-2xl"
        scrollWheelZoom
        zoomControl={false}
      >
        {/* Minimal tile layer — CartoDB Positron: clean white/grey, streets + labels only */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Zoom controls bottom-right */}
        <ZoomControl position="bottomright" />

        {/* Bounds tracker */}
        <MapEvents onBoundsChange={onBoundsChange} />

        {/* Listing markers */}
        {listings.map((l) => (
          <Marker key={l.id} position={[l.latitude, l.longitude]} icon={makePriceIcon(l.price)}>
            <Popup maxWidth={240} closeButton={false} className="map-popup-root">
              <Link href={`/stanza/${l.id}`} className="block group">
                {l.images?.[0]?.url && (
                  <img src={l.images[0].url} alt={l.title} className="map-popup-img" />
                )}
                <div className="map-popup-body">
                  <h3 className="map-popup-title">{l.title}</h3>
                  <p className="map-popup-subtitle">{l.neighborhood || l.city}</p>
                  <div className="map-popup-footer">
                    <span className="map-popup-price">&euro;{l.price}<span className="map-popup-price-unit">/mese</span></span>
                    <span className="map-popup-type">{l.roomType === 'SINGLE' ? 'Singola' : l.roomType === 'DOUBLE' ? 'Doppia' : l.roomType === 'STUDIO' ? 'Monolocale' : 'Intero'}</span>
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Listing count overlay */}
      {listings.length > 0 && (
        <div className="map-count-badge">
          {listings.length} annunci
        </div>
      )}
    </div>
  );
}
