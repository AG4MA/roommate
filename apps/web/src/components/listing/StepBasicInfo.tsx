'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { Bed, Euro, Calendar } from 'lucide-react';

interface StepBasicInfoProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const roomTypes = [
  { value: 'SINGLE', label: 'Singola', desc: 'Una stanza in appartamento condiviso' },
  { value: 'DOUBLE', label: 'Doppia', desc: 'Stanza condivisa con un altro inquilino' },
  { value: 'STUDIO', label: 'Monolocale', desc: 'Ambiente unico con angolo cottura' },
  { value: 'ENTIRE_PLACE', label: 'Intero appartamento', desc: 'Tutto lo spazio è per l\'inquilino' },
] as const;

export function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titolo dell'annuncio *
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

      {/* Description */}
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

      {/* Room Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di stanza *</label>
        <div className="grid grid-cols-2 gap-3">
          {roomTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ roomType: type.value })}
              className={`flex flex-col items-start p-4 rounded-xl border-2 transition-colors text-left ${
                data.roomType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Bed className={`w-5 h-5 mb-2 ${data.roomType === type.value ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-800">{type.label}</span>
              <span className="text-xs text-gray-500 mt-1">{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Affitto mensile *</label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={data.price || ''}
              onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
              placeholder="550"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spese</label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={data.expenses || ''}
              onChange={(e) => onChange({ expenses: parseInt(e.target.value) || 0 })}
              placeholder="80"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deposito *</label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={data.deposit || ''}
              onChange={(e) => onChange({ deposit: parseInt(e.target.value) || 0 })}
              placeholder="1100"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Room Size */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Elevator */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.hasElevator}
          onChange={(e) => onChange({ hasElevator: e.target.checked })}
          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
        />
        <span className="text-gray-700">Ascensore presente</span>
      </label>

      {/* Availability */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disponibile dal *</label>
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
  );
}
