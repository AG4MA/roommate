'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { Euro, Zap, Droplets, Flame, Building2, Sparkles, Info } from 'lucide-react';

interface StepPricingProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

export function StepPricing({ data, onChange }: StepPricingProps) {
  const updatePricing = (updates: Partial<ListingFormData['pricing']>) => {
    onChange({ pricing: { ...data.pricing, ...updates } });
  };

  return (
    <div className="space-y-5">
      {/* Card: Affitto mensile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">💰 Affitto mensile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Euro className="w-4 h-4 inline mr-1" />
              Affitto (€/mese) *
            </label>
            <input
              type="number"
              min={0}
              value={data.price || ''}
              onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
              placeholder="es. 500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spese (€/mese)</label>
            <input
              type="number"
              min={0}
              value={data.expenses || ''}
              onChange={(e) => onChange({ expenses: parseInt(e.target.value) || 0 })}
              placeholder="es. 80"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposito cauzionale (€)</label>
            <input
              type="number"
              min={0}
              value={data.deposit || ''}
              onChange={(e) => onChange({ deposit: parseInt(e.target.value) || 0 })}
              placeholder="es. 500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Card: Modalità prezzo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">📊 Dettaglio spese</h3>
        <button
          type="button"
          onClick={() => updatePricing({ allInclusive: !data.pricing.allInclusive })}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-colors w-full mb-4 ${
            data.pricing.allInclusive
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <div className="text-left">
            <span className="font-medium text-sm block">Tutto incluso</span>
            <span className="text-xs opacity-75">L&apos;affitto include già tutte le spese</span>
          </div>
        </button>

        {!data.pricing.allInclusive && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Quanto paga in media il singolo coinquilino? (opzionale)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Luce/Gas
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.pricing.electricityGas ?? ''}
                  onChange={(e) => updatePricing({ electricityGas: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="€/mese"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Acqua
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.pricing.water ?? ''}
                  onChange={(e) => updatePricing({ water: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="€/mese"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Riscaldamento
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.pricing.heatingCost ?? ''}
                  onChange={(e) => updatePricing({ heatingCost: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="€/mese"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Condominio
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.pricing.condominiumFees ?? ''}
                  onChange={(e) => updatePricing({ condominiumFees: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="€/mese"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note sulle spese</label>
              <textarea
                value={data.pricing.expenseNotes}
                onChange={(e) => updatePricing({ expenseNotes: e.target.value })}
                placeholder="es. Riscaldamento centralizzato, Internet incluso nel condominio..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card: Pulizie */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">✨ Pulizie</h3>
        <button
          type="button"
          onClick={() => updatePricing({ cleaningIncluded: !data.pricing.cleaningIncluded })}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-colors w-full mb-4 ${
            data.pricing.cleaningIncluded
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium text-sm">Pulizia inclusa nel prezzo</span>
        </button>

        {data.pricing.cleaningIncluded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequenza</label>
              <select
                value={data.pricing.cleaningFrequency}
                onChange={(e) => updatePricing({ cleaningFrequency: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">Seleziona...</option>
                <option value="weekly">Settimanale</option>
                <option value="biweekly">Ogni 2 settimane</option>
                <option value="monthly">Mensile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ore per sessione</label>
              <input
                type="text"
                value={data.pricing.cleaningHours}
                onChange={(e) => updatePricing({ cleaningHours: e.target.value })}
                placeholder="es. 2 ore"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zona coperta</label>
              <select
                value={data.pricing.cleaningArea}
                onChange={(e) => updatePricing({ cleaningArea: e.target.value as 'common' | 'all' | '' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="">Seleziona...</option>
                <option value="common">Solo aree comuni</option>
                <option value="all">Tutto l&apos;appartamento</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Trasparenza sui costi</p>
          <p>Più sei dettagliato sulle spese, più fiducia ispirerai nei potenziali inquilini. 
          Indicare i costi reali aiuta a trovare rapidamente il coinquilino giusto.</p>
        </div>
      </div>
    </div>
  );
}
