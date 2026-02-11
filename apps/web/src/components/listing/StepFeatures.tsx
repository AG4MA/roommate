'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import {
  Wifi, Sofa, Bath, Sun, Wind, Flame,
  WashingMachine, UtensilsCrossed, Car, TreePine, Fence,
  PawPrint, Cigarette, Heart, Users, Clock
} from 'lucide-react';

interface StepFeaturesProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const featureOptions = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'furnished', label: 'Arredata', icon: Sofa },
  { key: 'privateBath', label: 'Bagno privato', icon: Bath },
  { key: 'balcony', label: 'Balcone', icon: Sun },
  { key: 'aircon', label: 'Aria condizionata', icon: Wind },
  { key: 'heating', label: 'Riscaldamento', icon: Flame },
  { key: 'washingMachine', label: 'Lavatrice', icon: WashingMachine },
  { key: 'dishwasher', label: 'Lavastoviglie', icon: UtensilsCrossed },
  { key: 'parking', label: 'Parcheggio', icon: Car },
  { key: 'garden', label: 'Giardino', icon: TreePine },
  { key: 'terrace', label: 'Terrazza', icon: Fence },
] as const;

export function StepFeatures({ data, onChange }: StepFeaturesProps) {
  const toggleFeature = (key: string) => {
    onChange({
      features: {
        ...data.features,
        [key]: !data.features[key as keyof typeof data.features],
      },
    });
  };

  const toggleRule = (key: string) => {
    onChange({
      rules: {
        ...data.rules,
        [key]: !data.rules[key as keyof typeof data.rules],
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Caratteristiche</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featureOptions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleFeature(key)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                data.features[key as keyof typeof data.features]
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Regole della casa</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toggleRule('petsAllowed')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
              data.rules.petsAllowed
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <PawPrint className="w-5 h-5" />
            <span className="font-medium text-sm">Animali ammessi</span>
          </button>
          <button
            type="button"
            onClick={() => toggleRule('smokingAllowed')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
              data.rules.smokingAllowed
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <Cigarette className="w-5 h-5" />
            <span className="font-medium text-sm">Fumo permesso</span>
          </button>
          <button
            type="button"
            onClick={() => toggleRule('couplesAllowed')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
              data.rules.couplesAllowed
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium text-sm">Coppie ammesse</span>
          </button>
          <button
            type="button"
            onClick={() => toggleRule('guestsAllowed')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
              data.rules.guestsAllowed
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Ospiti ammessi</span>
          </button>
        </div>
      </div>

      {/* Cleaning & Quiet Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pulizie</label>
          <input
            type="text"
            value={data.rules.cleaningSchedule}
            onChange={(e) => onChange({ rules: { ...data.rules, cleaningSchedule: e.target.value } })}
            placeholder="es. A turni settimanali"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ore di silenzio (inizio)</label>
          <input
            type="time"
            value={data.rules.quietHoursStart}
            onChange={(e) => onChange({ rules: { ...data.rules, quietHoursStart: e.target.value } })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ore di silenzio (fine)</label>
          <input
            type="time"
            value={data.rules.quietHoursEnd}
            onChange={(e) => onChange({ rules: { ...data.rules, quietHoursEnd: e.target.value } })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
