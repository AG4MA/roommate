'use client';

import { useState } from 'react';
import type { ListingFormData } from '@/app/pubblica/page';
import {
  Wifi, Sofa, Bath, Sun, Wind, Flame,
  WashingMachine, UtensilsCrossed, Car, TreePine, Fence,
  PawPrint, Cigarette, Heart, Users, Clock, Info, X
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
  const [showRulesInfo, setShowRulesInfo] = useState(false);

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
    <div className="space-y-5">
      {/* Card: Caratteristiche */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">⚡ Caratteristiche</h3>
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

      {/* Card: Regole della casa */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-gray-800">📋 Regole della casa</h3>
          <button type="button" onClick={() => setShowRulesInfo(true)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Informazioni sulle regole">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {showRulesInfo && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 relative">
            <button type="button" onClick={() => setShowRulesInfo(false)} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-blue-800 font-medium mb-2">Come funzionano le regole?</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Clicca per attivare o disattivare ogni regola</li>
              <li>Le regole attive verranno mostrate nella scheda dell&apos;annuncio</li>
              <li>Gli inquilini potranno filtrare la ricerca in base a queste</li>
              <li>Le ore di silenzio indicano la fascia oraria in cui si chiede silenzio</li>
            </ul>
            <p className="text-xs text-blue-500 mt-2">Manca una regola? <a href="/api/feedback" className="underline">Suggeriscila qui</a></p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button type="button" onClick={() => toggleRule('petsAllowed')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${data.rules.petsAllowed ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
            <PawPrint className="w-5 h-5" /><span className="font-medium text-sm">Animali ammessi</span>
          </button>
          <button type="button" onClick={() => toggleRule('smokingAllowed')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${data.rules.smokingAllowed ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
            <Cigarette className="w-5 h-5" /><span className="font-medium text-sm">Fumo permesso</span>
          </button>
          <button type="button" onClick={() => toggleRule('couplesAllowed')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${data.rules.couplesAllowed ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
            <Heart className="w-5 h-5" /><span className="font-medium text-sm">Coppie ammesse</span>
          </button>
          <button type="button" onClick={() => toggleRule('guestsAllowed')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${data.rules.guestsAllowed ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
            <Users className="w-5 h-5" /><span className="font-medium text-sm">Ospiti ammessi</span>
          </button>
          <button type="button" onClick={() => { const enabled = !data.rules.quietHoursEnabled; onChange({ rules: { ...data.rules, quietHoursEnabled: enabled, quietHoursStart: enabled ? (data.rules.quietHoursStart || '22:00') : '', quietHoursEnd: enabled ? (data.rules.quietHoursEnd || '08:00') : '' } }); }} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${data.rules.quietHoursEnabled ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
            <Clock className="w-5 h-5" /><span className="font-medium text-sm">Ore di silenzio</span>
          </button>
        </div>

        {data.rules.quietHoursEnabled && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
            <Clock className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-700">Dalle</span>
            <input type="time" value={data.rules.quietHoursStart} onChange={(e) => onChange({ rules: { ...data.rules, quietHoursStart: e.target.value } })} className="px-3 py-1.5 rounded-lg border border-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            <span className="text-sm text-green-700">alle</span>
            <input type="time" value={data.rules.quietHoursEnd} onChange={(e) => onChange({ rules: { ...data.rules, quietHoursEnd: e.target.value } })} className="px-3 py-1.5 rounded-lg border border-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
          </div>
        )}
      </div>

      {/* Card: Pulizie */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">🧹 Organizzazione pulizie</h3>
        <input
          type="text"
          value={data.rules.cleaningSchedule}
          onChange={(e) => onChange({ rules: { ...data.rules, cleaningSchedule: e.target.value } })}
          placeholder="es. A turni settimanali, Donna delle pulizie ogni lunedì"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}
