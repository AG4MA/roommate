'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import { FileText, Calendar, RefreshCw, Home, MapPin, Info } from 'lucide-react';

interface StepContractProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

const contractTypes = [
  { value: 'transitorio', label: 'Transitorio', desc: 'Da 1 a 18 mesi' },
  { value: 'studenti', label: 'Studenti', desc: 'Da 6 a 36 mesi' },
  { value: '4+4', label: '4+4', desc: 'Canone libero' },
  { value: '3+2', label: '3+2', desc: 'Canone concordato' },
  { value: 'uso_foresteria', label: 'Uso foresteria', desc: 'Per aziende' },
  { value: 'comodato', label: 'Comodato d\'uso', desc: 'Gratuito o simbolico' },
];

export function StepContract({ data, onChange }: StepContractProps) {
  const updateContract = (updates: Partial<ListingFormData['contract']>) => {
    onChange({ contract: { ...data.contract, ...updates } });
  };

  return (
    <div className="space-y-5">
      {/* Card: Tipo di contratto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Tipo di contratto
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contractTypes.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateContract({ type: value })}
              className={`p-4 rounded-xl border-2 transition-colors text-left ${
                data.contract.type === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-sm block">{label}</span>
              <span className="text-xs opacity-75">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card: Durata */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Durata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inizio contratto</label>
            <input type="date" value={data.contract.startDate} onChange={(e) => updateContract({ startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fine contratto</label>
            <input type="date" value={data.contract.endDate} onChange={(e) => updateContract({ endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durata minima (mesi)</label>
            <input type="number" min={1} value={data.contract.minDuration ?? ''} onChange={(e) => updateContract({ minDuration: e.target.value ? parseInt(e.target.value) : null })} placeholder="es. 6" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durata massima (mesi)</label>
            <input type="number" min={1} value={data.contract.maxDuration ?? ''} onChange={(e) => updateContract({ maxDuration: e.target.value ? parseInt(e.target.value) : null })} placeholder="es. 12" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      {/* Card: Rinnovo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary-600" />
          Rinnovo
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {([
            { value: null, label: 'Non specificato' },
            { value: true, label: 'Sì, rinnovabile' },
            { value: false, label: 'No, non rinnovabile' },
          ] as { value: boolean | null; label: string }[]).map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => updateContract({ renewalPossible: value })}
              className={`p-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                data.contract.renewalPossible === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {data.contract.renewalPossible === true && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condizioni di rinnovo</label>
            <input type="text" value={data.contract.renewalConditions} onChange={(e) => updateContract({ renewalConditions: e.target.value })} placeholder="es. Rinnovo automatico di 12 mesi, disdetta con 3 mesi di preavviso" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}
      </div>

      {/* Card: Residenza e domicilio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary-600" />
          Residenza e domicilio
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Possibilità di residenza</label>
            <div className="grid grid-cols-3 gap-3">
              {([{ value: null, label: 'Non specificato' }, { value: true, label: 'Sì' }, { value: false, label: 'No' }] as { value: boolean | null; label: string }[]).map(({ value, label }) => (
                <button key={`res-${String(value)}`} type="button" onClick={() => updateContract({ residenceAllowed: value })} className={`p-3 rounded-xl border-2 transition-colors text-sm font-medium ${data.contract.residenceAllowed === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Possibilità di domicilio</label>
            <div className="grid grid-cols-3 gap-3">
              {([{ value: null, label: 'Non specificato' }, { value: true, label: 'Sì' }, { value: false, label: 'No' }] as { value: boolean | null; label: string }[]).map(({ value, label }) => (
                <button key={`dom-${String(value)}`} type="button" onClick={() => updateContract({ domicileAllowed: value })} className={`p-3 rounded-xl border-2 transition-colors text-sm font-medium ${data.contract.domicileAllowed === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card: Solo fuori sede */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Vincoli
        </h3>
        <button
          type="button"
          onClick={() => updateContract({ outOfTownOnly: !data.contract.outOfTownOnly })}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-colors w-full mb-4 ${
            data.contract.outOfTownOnly
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <div className="text-left">
            <span className="font-medium text-sm block">Solo inquilini fuori sede</span>
            <span className="text-xs opacity-75">Riservato a chi non ha la residenza nel comune</span>
          </div>
        </button>
        {data.contract.outOfTownOnly && (
          <input type="text" value={data.contract.outOfTownNote} onChange={(e) => updateContract({ outOfTownNote: e.target.value })} placeholder="Note aggiuntive (opzionale)" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Informazioni contrattuali</p>
          <p>Specificare il tipo di contratto e le condizioni aiuta gli inquilini a capire subito se l&apos;offerta fa al caso loro.</p>
        </div>
      </div>
    </div>
  );
}
