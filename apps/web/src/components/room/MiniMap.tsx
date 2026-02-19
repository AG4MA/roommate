'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2 } from 'lucide-react';
import type { TransitStop } from './LeafletMini';

const LeafletMini = dynamic(() => import('./LeafletMini'), { ssr: false });

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

interface MiniMapProps {
  lat: number;
  lng: number;
  address: string;
}

// Haversine distance in meters
function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function fetchTransitStops(lat: number, lng: number): Promise<TransitStop[]> {
  const around = `(around:1000,${lat},${lng})`;
  const query = `
[out:json][timeout:10];
(
  node["station"="subway"]${around};
  node["railway"="subway_entrance"]${around};
  node["railway"="station"]${around};
  way["railway"="station"]${around};
  node["highway"="bus_stop"]${around};
  node["railway"="tram_stop"]${around};
  node["amenity"="bicycle_parking"]${around};
);
out center;
`;
  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return [];
    const data = await res.json();

    const stops: TransitStop[] = [];
    const seen = new Set<string>();
    for (const el of data.elements) {
      const tags = el.tags || {};
      let type = '';
      if (tags.station === 'subway' || tags.railway === 'subway_entrance') type = 'METRO_STATION';
      else if (tags.railway === 'station') type = 'TRAIN_STATION';
      else if (tags.highway === 'bus_stop') type = 'BUS_STOP';
      else if (tags.railway === 'tram_stop') type = 'TRAM_STOP';
      else if (tags.amenity === 'bicycle_parking') type = 'BICYCLE_PARKING';
      if (!type) continue;

      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null) continue;

      const defaults: Record<string, string> = {
        METRO_STATION: 'Metro', TRAIN_STATION: 'Stazione', BUS_STOP: 'Fermata Bus', TRAM_STOP: 'Fermata Tram', BICYCLE_PARKING: 'Deposito Bici',
      };
      const name = tags.name || defaults[type] || type;
      const key = `${type}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      stops.push({ type, name, lat: elLat, lng: elLng, distanceM: distanceM(lat, lng, elLat, elLng) });
    }
    stops.sort((a, b) => a.distanceM - b.distanceM);
    return stops;
  } catch {
    return [];
  }
}

export function MiniMap({ lat, lng, address }: MiniMapProps) {
  const [open, setOpen] = useState(false);
  const [transitStops, setTransitStops] = useState<TransitStop[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStops = useCallback(async () => {
    setLoading(true);
    const stops = await fetchTransitStops(lat, lng);
    setTransitStops(stops);
    setLoading(false);
  }, [lat, lng]);

  useEffect(() => {
    if (open && transitStops.length === 0) {
      loadStops();
    }
  }, [open, transitStops.length, loadStops]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        {open ? 'Chiudi mappa' : 'Apri mappa'}
      </button>

      {open && (
        <div className="mt-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 h-64 w-full relative">
            {loading && (
              <div className="absolute top-2 right-2 z-[1000] bg-white/80 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Caricamento fermate...
              </div>
            )}
            <LeafletMini lat={lat} lng={lng} address={address} transitStops={transitStops} />
          </div>
          {/* Transit stops legend */}
          {transitStops.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {['METRO_STATION', 'TRAIN_STATION', 'TRAM_STOP', 'BUS_STOP', 'BICYCLE_PARKING'].map((type) => {
                const count = transitStops.filter((s) => s.type === type).length;
                if (count === 0) return null;
                const emoji: Record<string, string> = { BUS_STOP: '🚌', TRAM_STOP: '🚊', METRO_STATION: '🚇', TRAIN_STATION: '🚉', BICYCLE_PARKING: '🚲' };
                const labels: Record<string, string> = { BUS_STOP: 'Bus', TRAM_STOP: 'Tram', METRO_STATION: 'Metro', TRAIN_STATION: 'Treno', BICYCLE_PARKING: 'Bici' };
                return (
                  <span key={type} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {emoji[type]} {labels[type]} ({count})
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
