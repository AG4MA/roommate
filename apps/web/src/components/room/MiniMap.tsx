'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const LeafletMini = dynamic(() => import('./LeafletMini'), { ssr: false });

interface MiniMapProps {
  lat: number;
  lng: number;
  address: string;
}

export function MiniMap({ lat, lng, address }: MiniMapProps) {
  const [open, setOpen] = useState(false);

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
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-64 w-full">
          <LeafletMini lat={lat} lng={lng} address={address} />
        </div>
      )}
    </div>
  );
}
