'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { UserCheck, Briefcase } from 'lucide-react';

interface StepPreferencesProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const genderOptions = [
  { value: null, label: 'Indifferente' },
  { value: 'MALE' as const, label: 'Uomo' },
  { value: 'FEMALE' as const, label: 'Donna' },
];

const occupationOptions = [
  { value: 'ANY', label: 'Indifferente' },
  { value: 'STUDENT', label: 'Studente' },
  { value: 'WORKING', label: 'Lavoratore' },
];

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  const toggleOccupation = (value: string) => {
    // "Indifferente" (ANY) clears all others; selecting specific clears ANY
    if (value === 'ANY') {
      onChange({ preferences: { ...data.preferences, occupation: ['ANY'] } });
      return;
    }
    const withoutAny = data.preferences.occupation.filter((o) => o !== 'ANY');
    const updated = withoutAny.includes(value)
      ? withoutAny.filter((o) => o !== value)
      : [...withoutAny, value];
    onChange({ preferences: { ...data.preferences, occupation: updated.length === 0 ? [] : updated } });
  };

  return (
    <div className="space-y-5">
      {/* Card: Genere preferito */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          <UserCheck className="w-5 h-5 inline-block mr-2" />
          👤 Genere preferito
        </h3>
        <p className="text-sm text-gray-500 mb-4">Seleziona il genere del coinquilino ideale</p>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ preferences: { ...data.preferences, gender: value } })}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                data.preferences.gender === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card: Fascia di età */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">🎂 Fascia di età</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Età minima</label>
            <input type="number" min={18} max={99} value={data.preferences.ageMin ?? ''} onChange={(e) => onChange({ preferences: { ...data.preferences, ageMin: e.target.value ? parseInt(e.target.value) : null } })} placeholder="18" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Età massima</label>
            <input type="number" min={18} max={99} value={data.preferences.ageMax ?? ''} onChange={(e) => onChange({ preferences: { ...data.preferences, ageMax: e.target.value ? parseInt(e.target.value) : null } })} placeholder="45" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      {/* Card: Occupazione */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          <Briefcase className="w-5 h-5 inline-block mr-2" />
          💼 Occupazione
        </h3>
        <p className="text-sm text-gray-500 mb-4">Puoi selezionare più opzioni</p>
        <div className="grid grid-cols-3 gap-3">
          {occupationOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleOccupation(value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                data.preferences.occupation.includes(value)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        Queste preferenze sono indicative e aiutano i cercatori a trovare annunci compatibili.
        Non sono vincolanti.
      </div>
    </div>
  );
}
