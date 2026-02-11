'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { MapPin } from 'lucide-react';

interface StepLocationProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Via Lecco 15, Milano"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Milano"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quartiere</label>
          <input
            type="text"
            value={data.neighborhood}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
            placeholder="Porta Venezia"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
          <input
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            placeholder="20124"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitudine *</label>
          <input
            type="number"
            step="0.0001"
            value={data.latitude}
            onChange={(e) => onChange({ latitude: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitudine *</label>
          <input
            type="number"
            step="0.0001"
            value={data.longitude}
            onChange={(e) => onChange({ longitude: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Map placeholder — will be replaced with Leaflet picker in Phase 3 */}
      <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Mappa interattiva</p>
          <p className="text-sm">Clicca sulla mappa per posizionare il punto</p>
          <p className="text-xs mt-2 text-gray-400">
            Posizione: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
