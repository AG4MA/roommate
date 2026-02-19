'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ListingCard } from '@roommate/shared';

/* The heavy leaflet component is loaded only on client — no SSR at all */
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface SearchMapProps {
  listings: ListingCard[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export function SearchMap({ listings, onBoundsChange }: SearchMapProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <div className="map-loading">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="map-spinner" />
          <p className="text-sm">Caricamento mappa…</p>
        </div>
      </div>
    );
  }

  return <LeafletMap listings={listings} onBoundsChange={onBoundsChange} />;
}
