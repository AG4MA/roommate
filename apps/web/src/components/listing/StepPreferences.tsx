'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { UserCheck, Globe, Briefcase } from 'lucide-react';

interface StepPreferencesProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const genderOptions = [
  { value: null, label: 'Indifferente' },
  { value: 'MALE' as const, label: 'Uomo' },
  { value: 'FEMALE' as const, label: 'Donna' },
  { value: 'OTHER' as const, label: 'Altro' },
];

const occupationOptions = [
  { value: 'STUDENT', label: 'Studente' },
  { value: 'WORKING', label: 'Lavoratore' },
  { value: 'FREELANCER', label: 'Freelancer' },
];

const commonLanguages = [
  'Italiano', 'English', 'Español', 'Français',
  'Deutsch', 'Português', 'العربية', '中文',
];

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  const toggleOccupation = (value: string) => {
    const current = data.preferences.occupation;
    const updated = current.includes(value)
      ? current.filter((o) => o !== value)
      : [...current, value];
    onChange({ preferences: { ...data.preferences, occupation: updated } });
  };

  const toggleLanguage = (lang: string) => {
    const current = data.preferences.languages;
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    onChange({ preferences: { ...data.preferences, languages: updated } });
  };

  return (
    <div className="space-y-8">
      {/* Gender preference */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <UserCheck className="w-5 h-5 inline-block mr-2" />
          Genere preferito
        </h3>
        <p className="text-sm text-gray-500 mb-4">Seleziona il genere del coinquilino ideale</p>
        <div className="grid grid-cols-4 gap-3">
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

      {/* Age range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fascia di età</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Età minima</label>
            <input
              type="number"
              min={18}
              max={99}
              value={data.preferences.ageMin ?? ''}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...data.preferences,
                    ageMin: e.target.value ? parseInt(e.target.value) : null,
                  },
                })
              }
              placeholder="18"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Età massima</label>
            <input
              type="number"
              min={18}
              max={99}
              value={data.preferences.ageMax ?? ''}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...data.preferences,
                    ageMax: e.target.value ? parseInt(e.target.value) : null,
                  },
                })
              }
              placeholder="45"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Occupation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Briefcase className="w-5 h-5 inline-block mr-2" />
          Occupazione
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

      {/* Languages */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Globe className="w-5 h-5 inline-block mr-2" />
          Lingue parlate
        </h3>
        <p className="text-sm text-gray-500 mb-4">Seleziona le lingue richieste</p>
        <div className="flex flex-wrap gap-2">
          {commonLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                data.preferences.languages.includes(lang)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        Queste preferenze sono indicative e aiutano i cercatori a trovare annunci compatibili.
        Non sono vincolanti.
      </div>
    </div>
  );
}
