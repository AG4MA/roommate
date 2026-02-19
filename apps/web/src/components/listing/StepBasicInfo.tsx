'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { Calendar, Home, Bath as BathIcon, DoorOpen } from 'lucide-react';

interface StepBasicInfoProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const SPECIAL_AREA_OPTIONS = [
  'Lavanderia', 'Salotto', 'Cucina abitabile', 'Balcone comune',
  'Terrazzo comune', 'Giardino comune', 'Cantina', 'Soffitta',
  'Palestra condominiale', 'Piscina condominiale',
];

export function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  const toggleArea = (area: string) => {
    const current = data.specialAreas;
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area];
    onChange({ specialAreas: updated });
  };

  return (
    <div className="space-y-5">
      {/* Card: Annuncio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">📝 L&apos;annuncio</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo dell&apos;annuncio *
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="es. Stanza singola luminosa con balcone - Porta Venezia"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400 mt-1">{data.title.length}/100 caratteri</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione *
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Descrivi la stanza, l'appartamento e il quartiere..."
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{data.description.length}/2000 caratteri</p>
          </div>
        </div>
      </div>

      {/* Card: Stanza e immobile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">🏠 Stanza e immobile</h3>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensione stanza (m²) *</label>
            <input
              type="number"
              value={data.roomSize || ''}
              onChange={(e) => onChange({ roomSize: parseInt(e.target.value) || 0 })}
              placeholder="14"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Totale appartamento (m²)</label>
            <input
              type="number"
              value={data.totalSize || ''}
              onChange={(e) => onChange({ totalSize: parseInt(e.target.value) || null })}
              placeholder="85"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piano</label>
            <input
              type="number"
              value={data.floor ?? ''}
              onChange={(e) => onChange({ floor: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <DoorOpen className="w-4 h-4 text-gray-400" />
              Stanze totali
            </label>
            <input
              type="number"
              min={1}
              value={data.totalRooms ?? ''}
              onChange={(e) => onChange({ totalRooms: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <BathIcon className="w-4 h-4 text-gray-400" />
              Bagni
            </label>
            <input
              type="number"
              min={1}
              value={data.bathrooms ?? ''}
              onChange={(e) => onChange({ bathrooms: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="2"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasElevator}
            onChange={(e) => onChange({ hasElevator: e.target.checked })}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-gray-700">Ascensore presente</span>
        </label>
      </div>

      {/* Card: Ambienti speciali */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Home className="w-4.5 h-4.5 text-primary-600" />
          Ambienti speciali
        </h3>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_AREA_OPTIONS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArea(area)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                data.specialAreas.includes(area)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Card: Disponibilità */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-primary-600" />
          Disponibilità
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibile dal *
            </label>
            <input
              type="date"
              value={data.availableFrom}
              onChange={(e) => onChange({ availableFrom: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permanenza min (mesi)</label>
            <input
              type="number"
              value={data.minStay}
              onChange={(e) => onChange({ minStay: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permanenza max (mesi)</label>
            <input
              type="number"
              value={data.maxStay ?? ''}
              onChange={(e) => onChange({ maxStay: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Nessun limite"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
