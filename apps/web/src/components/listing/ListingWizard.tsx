'use client';

import { useState, useCallback, useRef } from 'react';
import type { ListingFormData } from '@/app/pubblica/page';
import { StepReview } from './StepReview';
import {
  ChevronLeft, ChevronRight, Send, Save, Loader2,
  // Features
  Wifi, Sofa, Bath, Sun, Wind, Flame, WashingMachine, UtensilsCrossed,
  Car, TreePine, Fence,
  // Rules
  PawPrint, Cigarette, Heart, Users, Clock,
  // Media
  Upload, X, Video, Plus, GripVertical, AlertCircle,
  // Misc
  Info, MapPin, MessageSquare, Mail, Phone,
} from 'lucide-react';

/* ================================================================
   Constants
   ================================================================ */

const SPECIAL_AREAS = [
  'Lavanderia', 'Salotto', 'Cucina abitabile', 'Balcone comune',
  'Terrazzo comune', 'Giardino comune', 'Cantina', 'Soffitta',
  'Palestra condominiale', 'Piscina condominiale',
];

const FEATURE_OPTIONS = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'furnished', label: 'Arredata', icon: Sofa },
  { key: 'privateBath', label: 'Bagno privato', icon: Bath },
  { key: 'balcony', label: 'Balcone', icon: Sun },
  { key: 'aircon', label: 'Aria condizionata', icon: Wind },
  { key: 'washingMachine', label: 'Lavatrice', icon: WashingMachine },
  { key: 'dishwasher', label: 'Lavastoviglie', icon: UtensilsCrossed },
  { key: 'parking', label: 'Parcheggio', icon: Car },
  { key: 'bikeParking', label: 'Parcheggio bici', icon: Bike },
  { key: 'garden', label: 'Giardino', icon: TreePine },
  { key: 'terrace', label: 'Terrazza', icon: Fence },
] as const;

const CONTRACT_TYPES = [
  { value: 'transitorio', label: 'Transitorio', desc: 'Da 1 a 18 mesi' },
  { value: 'studenti', label: 'Studenti', desc: 'Da 6 a 36 mesi' },
  { value: '4+4', label: '4+4', desc: 'Canone libero' },
  { value: '3+2', label: '3+2', desc: 'Canone concordato' },
  { value: 'uso_foresteria', label: 'Uso foresteria', desc: 'Per aziende' },
  { value: 'comodato', label: "Comodato d'uso", desc: 'Gratuito o simbolico' },
];

const GENDER_OPTIONS = [
  { value: null, label: 'Indifferente' },
  { value: 'MALE' as const, label: 'Uomo' },
  { value: 'FEMALE' as const, label: 'Donna' },
];

const OCCUPATION_OPTIONS = [
  { value: 'ANY', label: 'Indifferente' },
  { value: 'STUDENT', label: 'Studente' },
  { value: 'WORKING', label: 'Lavoratore' },
];

const CONTACT_OPTIONS = [
  { value: 'app' as const, label: 'App rooMate', icon: MessageSquare, desc: 'Chat integrata' },
  { value: 'email' as const, label: 'Email', icon: Mail, desc: 'Via email' },
  { value: 'phone' as const, label: 'Telefono', icon: Phone, desc: 'Chiamata / WhatsApp' },
];

/* ================================================================
   Types
   ================================================================ */

interface WizardCard {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  isValid: () => boolean;
  autoAdvance?: boolean;
  content: React.ReactNode;
}

interface ListingWizardProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
  onSubmit: (publish: boolean) => void;
  submitting: boolean;
  error: string;
  regMode: 'registered' | 'anonymous';
  onBack: () => void;
}

/* ================================================================
   Component
   ================================================================ */

export function ListingWizard({ data, onChange, onSubmit, submitting, error, regMode, onBack }: ListingWizardProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const [showRulesInfo, setShowRulesInfo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const autoNextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- helpers ---------- */

  const goNext = useCallback(() => {
    setDirection('next');
    setAnimating(true);
    setTimeout(() => {
      setCurrentCard((c) => c + 1);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }, []);

  const goPrev = useCallback(() => {
    if (autoNextTimer.current) { clearTimeout(autoNextTimer.current); autoNextTimer.current = null; }
    if (currentCard === 0) { onBack(); return; }
    setDirection('prev');
    setAnimating(true);
    setTimeout(() => {
      setCurrentCard((c) => c - 1);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }, [currentCard, onBack]);

  const autoNext = useCallback(() => {
    autoNextTimer.current = setTimeout(goNext, 400);
  }, [goNext]);

  const updatePricing = (u: Partial<ListingFormData['pricing']>) =>
    onChange({ pricing: { ...data.pricing, ...u } });
  const updateContract = (u: Partial<ListingFormData['contract']>) =>
    onChange({ contract: { ...data.contract, ...u } });
  const updatePrefs = (u: Partial<ListingFormData['preferences']>) =>
    onChange({ preferences: { ...data.preferences, ...u } });
  const updateRules = (u: Partial<ListingFormData['rules']>) =>
    onChange({ rules: { ...data.rules, ...u } });

  const toggleFeature = (key: string) =>
    onChange({ features: { ...data.features, [key]: !data.features[key as keyof typeof data.features] } });
  const toggleRule = (key: string) =>
    onChange({ rules: { ...data.rules, [key]: !data.rules[key as keyof typeof data.rules] } });
  const toggleArea = (area: string) => {
    const updated = data.specialAreas.includes(area)
      ? data.specialAreas.filter((a) => a !== area)
      : [...data.specialAreas, area];
    onChange({ specialAreas: updated });
  };
  const toggleOccupation = (value: string) => {
    if (value === 'ANY') { updatePrefs({ occupation: ['ANY'] }); return; }
    const withoutAny = data.preferences.occupation.filter((o) => o !== 'ANY');
    const updated = withoutAny.includes(value)
      ? withoutAny.filter((o) => o !== value)
      : [...withoutAny, value];
    updatePrefs({ occupation: updated.length === 0 ? [] : updated });
  };

  /* image upload */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const newImages = [...data.images];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) { setUploadError('Le immagini devono essere inferiori a 5MB'); continue; }
        const fd = new FormData(); fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.success) newImages.push({ url: json.data.url, caption: '' });
        else setUploadError(json.error || 'Errore durante il caricamento');
      }
      onChange({ images: newImages });
    } catch { setUploadError('Errore di connessione durante il caricamento'); }
    finally { setUploading(false); e.target.value = ''; }
  };
  const removeImage = (i: number) => onChange({ images: data.images.filter((_, idx) => idx !== i) });
  const updateCaption = (i: number, caption: string) =>
    onChange({ images: data.images.map((img, idx) => idx === i ? { ...img, caption } : img) });

  /* roommates */
  const addRoommate = () =>
    onChange({ roommates: [...data.roommates, { name: '', age: undefined, gender: '', occupation: '', bio: '' }] });
  const updateRoommate = (i: number, u: Partial<ListingFormData['roommates'][0]>) =>
    onChange({ roommates: data.roommates.map((r, idx) => idx === i ? { ...r, ...u } : r) });
  const removeRoommate = (i: number) =>
    onChange({ roommates: data.roommates.filter((_, idx) => idx !== i) });

  /* ---------- reusable UI ---------- */

  const chipBtn = (active: boolean) =>
    `px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
      active
        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
    }`;
  const featureBtn = (active: boolean) =>
    `flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
      active
        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
        : 'border-gray-200 text-gray-600 hover:border-gray-300'
    }`;
  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  /* ================================================================
     Card definitions — each card = one focused screen
     ================================================================ */

  const cards: WizardCard[] = [

    /* ---- 0: Titolo ---- */
    {
      id: 'titolo', emoji: '📝', title: "Dai un titolo all'annuncio",
      subtitle: 'Un titolo chiaro e specifico attira più candidati',
      isValid: () => data.title.trim().length >= 5,
      content: (
        <div>
          <input type="text" value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="es. Stanza luminosa con balcone – Porta Venezia" maxLength={100} className={inputCls} autoFocus />
          <p className="text-xs text-gray-400 mt-2 text-right">{data.title.length}/100</p>
        </div>
      ),
    },

    /* ---- 1: Descrizione ---- */
    {
      id: 'descrizione', emoji: '✏️', title: 'Descrivi la stanza',
      subtitle: 'Racconta cosa la rende speciale',
      isValid: () => data.description.trim().length >= 20,
      content: (
        <div>
          <textarea value={data.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Descrivi la stanza, l'appartamento e il quartiere..." rows={6} maxLength={2000} className={`${inputCls} resize-none`} />
          <p className="text-xs text-gray-400 mt-2 text-right">{data.description.length}/2000</p>
        </div>
      ),
    },

    /* ---- 2: Dimensioni ---- */
    {
      id: 'dimensioni', emoji: '📐', title: 'Dimensioni',
      subtitle: 'Quanto è grande la stanza e l\'appartamento?',
      isValid: () => data.roomSize > 0,
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Dimensione stanza (m²) *</label>
            <input type="number" value={data.roomSize || ''} onChange={(e) => onChange({ roomSize: parseInt(e.target.value) || 0 })} placeholder="14" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Totale appartamento (m²)</label>
            <input type="number" value={data.totalSize || ''} onChange={(e) => onChange({ totalSize: parseInt(e.target.value) || null })} placeholder="85" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Piano</label>
            <input type="number" value={data.floor ?? ''} onChange={(e) => onChange({ floor: e.target.value ? parseInt(e.target.value) : null })} placeholder="3" className={inputCls} />
          </div>
        </div>
      ),
    },

    /* ---- 3: Immobile ---- */
    {
      id: 'immobile', emoji: '🏠', title: "L'immobile",
      subtitle: 'Qualche dettaglio sull\'appartamento',
      isValid: () => true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Stanze totali</label>
              <input type="number" min={1} value={data.totalRooms ?? ''} onChange={(e) => onChange({ totalRooms: e.target.value ? parseInt(e.target.value) : null })} placeholder="4" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bagni</label>
              <input type="number" min={1} value={data.bathrooms ?? ''} onChange={(e) => onChange({ bathrooms: e.target.value ? parseInt(e.target.value) : null })} placeholder="2" className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={data.hasElevator} onChange={(e) => onChange({ hasElevator: e.target.checked })} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
            <span className="text-gray-700 font-medium">Ascensore presente</span>
          </label>
        </div>
      ),
    },

    /* ---- 4: Ambienti speciali ---- */
    {
      id: 'ambienti', emoji: '🛋️', title: 'Ambienti condivisi',
      subtitle: 'Seleziona gli spazi comuni disponibili',
      isValid: () => true,
      content: (
        <div className="flex flex-wrap gap-2.5">
          {SPECIAL_AREAS.map((area) => (
            <button key={area} type="button" onClick={() => toggleArea(area)} className={chipBtn(data.specialAreas.includes(area))}>
              {area}
            </button>
          ))}
        </div>
      ),
    },

    /* ---- 5: Disponibilità ---- */
    {
      id: 'disponibilita', emoji: '📅', title: 'Quando è disponibile?',
      subtitle: 'Indica da quando e per quanto tempo',
      isValid: () => !!data.availableFrom,
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Disponibile dal *</label>
            <input type="date" value={data.availableFrom} onChange={(e) => onChange({ availableFrom: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Permanenza minima (mesi)</label>
              <input type="number" value={data.minStay} onChange={(e) => onChange({ minStay: parseInt(e.target.value) || 1 })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Permanenza massima (mesi)</label>
              <input type="number" value={data.maxStay ?? ''} onChange={(e) => onChange({ maxStay: e.target.value ? parseInt(e.target.value) : null })} placeholder="Nessun limite" className={inputCls} />
            </div>
          </div>
        </div>
      ),
    },

    /* ---- 6: Posizione ---- */
    {
      id: 'posizione', emoji: '📍', title: 'Dove si trova?',
      subtitle: "L'indirizzo della stanza",
      isValid: () => data.address.trim().length > 0 && data.city.trim().length > 0,
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Indirizzo *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={data.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Via Lecco 15, Milano" className={`${inputCls} pl-10`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Città *</label>
              <input type="text" value={data.city} onChange={(e) => onChange({ city: e.target.value })} placeholder="Milano" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quartiere</label>
              <input type="text" value={data.neighborhood} onChange={(e) => onChange({ neighborhood: e.target.value })} placeholder="Porta Venezia" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CAP</label>
              <input type="text" value={data.postalCode} onChange={(e) => onChange({ postalCode: e.target.value })} placeholder="20124" className={inputCls} />
            </div>
          </div>
          {/* Map placeholder */}
          <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mt-2">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium text-sm">Mappa interattiva</p>
              <p className="text-xs mt-1">{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</p>
            </div>
          </div>
        </div>
      ),
    },

    /* ---- 7: Affitto ---- */
    {
      id: 'affitto', emoji: '💰', title: 'Quanto costa?',
      subtitle: 'Indica il prezzo mensile',
      isValid: () => data.price > 0,
      content: (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Affitto mensile (€) *</label>
            <input type="number" value={data.price || ''} onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })} placeholder="550" className={`${inputCls} text-2xl font-bold text-center`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Spese stimate (€/mese)</label>
              <input type="number" value={data.expenses || ''} onChange={(e) => onChange({ expenses: parseInt(e.target.value) || 0 })} placeholder="80" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Caparra (€)</label>
              <input type="number" value={data.deposit || ''} onChange={(e) => onChange({ deposit: parseInt(e.target.value) || 0 })} placeholder="550" className={inputCls} />
            </div>
          </div>
        </div>
      ),
    },

    /* ---- 8: Dettaglio spese ---- */
    {
      id: 'spese', emoji: '📊', title: 'Dettaglio spese',
      subtitle: 'Aiuta gli inquilini a capire cosa è incluso',
      isValid: () => true,
      content: (
        <div className="space-y-4">
          <button type="button" onClick={() => updatePricing({ allInclusive: !data.pricing.allInclusive })} className={`w-full p-4 rounded-xl border-2 font-medium text-sm transition-all ${data.pricing.allInclusive ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            ✅ Tutto incluso nel prezzo
          </button>
          {!data.pricing.allInclusive && (
            <div className="space-y-3 pt-2">
              {[
                { key: 'electricityGas' as const, label: '⚡ Luce e gas (€/mese)' },
                { key: 'water' as const, label: '💧 Acqua (€/mese)' },
                { key: 'heatingCost' as const, label: '🔥 Riscaldamento (€/mese)' },
                { key: 'condominiumFees' as const, label: '🏢 Condominiali (€/mese)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input type="number" value={data.pricing[key] ?? ''} onChange={(e) => updatePricing({ [key]: e.target.value ? parseInt(e.target.value) : null })} placeholder="—" className={inputCls} />
                </div>
              ))}
            </div>
          )}
          <div>
            <label className={labelCls}>Note sulle spese</label>
            <input type="text" value={data.pricing.expenseNotes} onChange={(e) => updatePricing({ expenseNotes: e.target.value })} placeholder="es. Bollette divise tra 3 coinquilini" className={inputCls} />
          </div>
        </div>
      ),
    },

    /* ---- 9: Pulizie ---- */
    {
      id: 'pulizie', emoji: '🧹', title: 'Pulizie',
      subtitle: 'Come sono organizzate le pulizie?',
      isValid: () => true,
      content: (
        <div className="space-y-4">
          <button type="button" onClick={() => updatePricing({ cleaningIncluded: !data.pricing.cleaningIncluded })} className={`w-full p-4 rounded-xl border-2 font-medium text-sm transition-all ${data.pricing.cleaningIncluded ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            🧹 Pulizia professionale inclusa
          </button>
          {data.pricing.cleaningIncluded && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Frequenza</label>
                  <input type="text" value={data.pricing.cleaningFrequency} onChange={(e) => updatePricing({ cleaningFrequency: e.target.value })} placeholder="2 volte/settimana" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Durata</label>
                  <input type="text" value={data.pricing.cleaningHours} onChange={(e) => updatePricing({ cleaningHours: e.target.value })} placeholder="2 ore" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-2">
                {[{ v: 'common' as const, l: 'Solo aree comuni' }, { v: 'all' as const, l: 'Tutta la casa' }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => updatePricing({ cleaningArea: v })} className={chipBtn(data.pricing.cleaningArea === v)}>{l}</button>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-gray-100 pt-4">
            <label className={labelCls}>Organizzazione pulizie tra coinquilini</label>
            <input type="text" value={data.rules.cleaningSchedule} onChange={(e) => updateRules({ cleaningSchedule: e.target.value })} placeholder="es. A turni settimanali" className={inputCls} />
          </div>
        </div>
      ),
    },

    /* ---- 10: Tipo contratto (AUTO-ADVANCE) ---- */
    {
      id: 'contratto-tipo', emoji: '📄', title: 'Tipo di contratto',
      subtitle: 'Seleziona il tipo offerto',
      isValid: () => data.contract.type.length > 0,
      autoAdvance: true,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {CONTRACT_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => { updateContract({ type: value }); autoNext(); }}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                data.contract.type === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold text-base block">{label}</span>
              <span className="text-sm opacity-75">{desc}</span>
            </button>
          ))}
        </div>
      ),
    },

    /* ---- 11: Durata contratto ---- */
    {
      id: 'contratto-durata', emoji: '⏱️', title: 'Durata del contratto',
      subtitle: 'Date e durata',
      isValid: () => true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Inizio contratto</label>
              <input type="date" value={data.contract.startDate} onChange={(e) => updateContract({ startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fine contratto</label>
              <input type="date" value={data.contract.endDate} onChange={(e) => updateContract({ endDate: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Durata minima (mesi)</label>
              <input type="number" min={1} value={data.contract.minDuration ?? ''} onChange={(e) => updateContract({ minDuration: e.target.value ? parseInt(e.target.value) : null })} placeholder="6" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Durata massima (mesi)</label>
              <input type="number" min={1} value={data.contract.maxDuration ?? ''} onChange={(e) => updateContract({ maxDuration: e.target.value ? parseInt(e.target.value) : null })} placeholder="12" className={inputCls} />
            </div>
          </div>
        </div>
      ),
    },

    /* ---- 12: Condizioni contrattuali ---- */
    {
      id: 'condizioni', emoji: '📋', title: 'Condizioni',
      subtitle: 'Rinnovo, residenza e vincoli',
      isValid: () => true,
      content: (
        <div className="space-y-6">
          {/* Rinnovo */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Rinnovabile?</p>
            <div className="grid grid-cols-3 gap-2">
              {([{ v: null, l: 'Non specificato' }, { v: true, l: 'Sì' }, { v: false, l: 'No' }] as { v: boolean | null; l: string }[]).map(({ v, l }) => (
                <button key={String(v)} type="button" onClick={() => updateContract({ renewalPossible: v })} className={chipBtn(data.contract.renewalPossible === v)}>{l}</button>
              ))}
            </div>
            {data.contract.renewalPossible === true && (
              <input type="text" value={data.contract.renewalConditions} onChange={(e) => updateContract({ renewalConditions: e.target.value })} placeholder="Condizioni di rinnovo..." className={`${inputCls} mt-3`} />
            )}
          </div>
          {/* Residenza / Domicilio */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Possibilità di residenza</p>
            <div className="grid grid-cols-3 gap-2">
              {([{ v: null, l: 'Non spec.' }, { v: true, l: 'Sì' }, { v: false, l: 'No' }] as { v: boolean | null; l: string }[]).map(({ v, l }) => (
                <button key={`r${String(v)}`} type="button" onClick={() => updateContract({ residenceAllowed: v })} className={chipBtn(data.contract.residenceAllowed === v)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Possibilità di domicilio</p>
            <div className="grid grid-cols-3 gap-2">
              {([{ v: null, l: 'Non spec.' }, { v: true, l: 'Sì' }, { v: false, l: 'No' }] as { v: boolean | null; l: string }[]).map(({ v, l }) => (
                <button key={`d${String(v)}`} type="button" onClick={() => updateContract({ domicileAllowed: v })} className={chipBtn(data.contract.domicileAllowed === v)}>{l}</button>
              ))}
            </div>
          </div>
          {/* Fuori sede */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={data.contract.outOfTownOnly} onChange={() => updateContract({ outOfTownOnly: !data.contract.outOfTownOnly })} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
            <div>
              <span className="text-sm font-medium text-gray-700 block">Solo fuori sede</span>
              <span className="text-xs text-gray-500">Riservato a chi non ha residenza nel comune</span>
            </div>
          </label>
        </div>
      ),
    },

    /* ---- 13: Caratteristiche ---- */
    {
      id: 'caratteristiche', emoji: '⚡', title: 'Caratteristiche',
      subtitle: 'Servizi e dotazioni della stanza',
      isValid: () => true,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {FEATURE_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => toggleFeature(key)} className={featureBtn(data.features[key as keyof typeof data.features])}>
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      ),
    },

    /* ---- 14: Regole ---- */
    {
      id: 'regole', emoji: '📋', title: 'Regole della casa',
      subtitle: 'Per una convivenza serena',
      isValid: () => true,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <button type="button" onClick={() => setShowRulesInfo(!showRulesInfo)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Info">
              <Info className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-400">Clicca per info sulle regole</span>
          </div>
          {showRulesInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-1">
              <p className="font-medium text-blue-800">Come funzionano?</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Attiva le regole che vuoi impostare</li>
                <li>Verranno mostrate nell&apos;annuncio</li>
                <li>Gli inquilini potranno filtrare per queste</li>
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => toggleRule('petsAllowed')} className={featureBtn(data.rules.petsAllowed)}>
              <PawPrint className="w-5 h-5" /><span className="font-medium text-sm">Animali ammessi</span>
            </button>
            <button type="button" onClick={() => toggleRule('smokingAllowed')} className={featureBtn(data.rules.smokingAllowed)}>
              <Cigarette className="w-5 h-5" /><span className="font-medium text-sm">Fumo permesso</span>
            </button>
            <button type="button" onClick={() => toggleRule('couplesAllowed')} className={featureBtn(data.rules.couplesAllowed)}>
              <Heart className="w-5 h-5" /><span className="font-medium text-sm">Coppie ammesse</span>
            </button>
            <button type="button" onClick={() => toggleRule('guestsAllowed')} className={featureBtn(data.rules.guestsAllowed)}>
              <Users className="w-5 h-5" /><span className="font-medium text-sm">Ospiti ammessi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const enabled = !data.rules.quietHoursEnabled;
                updateRules({
                  quietHoursEnabled: enabled,
                  quietHoursStart: enabled ? (data.rules.quietHoursStart || '22:00') : '',
                  quietHoursEnd: enabled ? (data.rules.quietHoursEnd || '08:00') : '',
                });
              }}
              className={featureBtn(data.rules.quietHoursEnabled)}
            >
              <Clock className="w-5 h-5" /><span className="font-medium text-sm">Ore di silenzio</span>
            </button>
          </div>
          {data.rules.quietHoursEnabled && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <Clock className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-700">Dalle</span>
              <input type="time" value={data.rules.quietHoursStart} onChange={(e) => updateRules({ quietHoursStart: e.target.value })} className="px-2 py-1.5 rounded-lg border border-green-300 text-sm bg-white" />
              <span className="text-sm text-green-700">alle</span>
              <input type="time" value={data.rules.quietHoursEnd} onChange={(e) => updateRules({ quietHoursEnd: e.target.value })} className="px-2 py-1.5 rounded-lg border border-green-300 text-sm bg-white" />
            </div>
          )}
        </div>
      ),
    },

    /* ---- 15: Genere preferito (AUTO-ADVANCE) ---- */
    {
      id: 'genere', emoji: '👤', title: 'Genere preferito',
      subtitle: 'Chi stai cercando come coinquilino?',
      isValid: () => true,
      autoAdvance: true,
      content: (
        <div className="space-y-3">
          {GENDER_OPTIONS.map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => { updatePrefs({ gender: value }); autoNext(); }}
              className={`w-full p-5 rounded-xl border-2 text-lg font-semibold transition-all ${
                data.preferences.gender === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ),
    },

    /* ---- 16: Preferenze età + occupazione ---- */
    {
      id: 'preferenze', emoji: '🎯', title: 'Altre preferenze',
      subtitle: 'Età e occupazione ideale del coinquilino',
      isValid: () => true,
      content: (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Fascia di età</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Età minima</label>
                <input type="number" min={18} max={99} value={data.preferences.ageMin ?? ''} onChange={(e) => updatePrefs({ ageMin: e.target.value ? parseInt(e.target.value) : null })} placeholder="18" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Età massima</label>
                <input type="number" min={18} max={99} value={data.preferences.ageMax ?? ''} onChange={(e) => updatePrefs({ ageMax: e.target.value ? parseInt(e.target.value) : null })} placeholder="45" className={inputCls} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Occupazione</p>
            <div className="grid grid-cols-3 gap-3">
              {OCCUPATION_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleOccupation(value)} className={chipBtn(data.preferences.occupation.includes(value))}>{label}</button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            Queste preferenze sono indicative e non vincolanti.
          </div>
        </div>
      ),
    },

    /* ---- 17: Numero massimo interessati ---- */
    {
      id: 'max-interessati', emoji: '👥', title: 'Quanti interessati vuoi gestire?',
      subtitle: 'Quando raggiungi questo numero, l\'annuncio verrà nascosto dalla ricerca fino a quando non si libera un posto',
      isValid: () => data.maxInterested >= 1,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => onChange({ maxInterested: Math.max(1, data.maxInterested - 1) })}
              className="w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 text-2xl font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <span className="text-5xl font-bold text-primary-600 tabular-nums w-16 text-center">{data.maxInterested}</span>
            <button
              type="button"
              onClick={() => onChange({ maxInterested: Math.min(20, data.maxInterested + 1) })}
              className="w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 text-2xl font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
          <p className="text-center text-sm text-gray-500">
            {data.maxInterested === 1
              ? 'Solo 1 persona potrà esprimere interesse alla volta'
              : `Fino a ${data.maxInterested} persone potranno esprimere interesse contemporaneamente`}
          </p>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            💡 Un numero basso ti permette di concentrarti su pochi candidati alla volta. Un numero alto velocizza la ricerca ma richiede più gestione.
          </div>
        </div>
      ),
    },

    /* ---- 18: Foto (BLOCKING) ---- */
    {
      id: 'foto', emoji: '📸', title: 'Foto della stanza',
      subtitle: 'Le foto fanno la differenza! Minimo 1 foto obbligatoria.',
      isValid: () => data.images.length > 0,
      content: (
        <div>
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{uploadError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {data.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption || `Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
                {idx === 0 && <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-lg font-medium">Copertina</span>}
                <input type="text" value={img.caption || ''} onChange={(e) => updateCaption(idx, e.target.value)} placeholder="Didascalia" className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            {data.images.length < 10 && (
              <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Carica foto</span>
                    <span className="text-xs text-gray-400 mt-1">{data.images.length}/10</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          {data.images.length > 1 && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <GripVertical className="w-3 h-3" />Trascina per riordinare (prossimamente)
            </p>
          )}
        </div>
      ),
    },

    /* ---- 18: Video + Coinquilini ---- */
    {
      id: 'extra', emoji: '🎬', title: 'Video e coinquilini',
      subtitle: 'Aggiungi un video tour e presenta i coinquilini',
      isValid: () => true,
      content: (
        <div className="space-y-6">
          {/* Video */}
          <div>
            <label className={labelCls}>
              <Video className="w-4 h-4 inline-block mr-1.5" />Video tour (YouTube / Vimeo)
            </label>
            <input type="url" value={data.videoUrl} onChange={(e) => onChange({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className={inputCls} />
          </div>
          {/* Coinquilini */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Coinquilini attuali</p>
            <div className="space-y-3">
              {data.roommates.map((rm, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">Coinquilino {idx + 1}</span>
                    <button type="button" onClick={() => removeRoommate(idx)} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" value={rm.name} onChange={(e) => updateRoommate(idx, { name: e.target.value })} placeholder="Nome" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="number" value={rm.age ?? ''} onChange={(e) => updateRoommate(idx, { age: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="Età" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <select value={rm.gender || ''} onChange={(e) => updateRoommate(idx, { gender: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                      <option value="">Genere</option><option value="MALE">Uomo</option><option value="FEMALE">Donna</option>
                    </select>
                    <select value={rm.occupation || ''} onChange={(e) => updateRoommate(idx, { occupation: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                      <option value="">Occupazione</option><option value="Studente">Studente</option><option value="Lavoratore">Lavoratore</option>
                    </select>
                  </div>
                  <textarea value={rm.bio || ''} onChange={(e) => updateRoommate(idx, { bio: e.target.value })} placeholder="Breve descrizione..." rows={2} maxLength={200} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" />
                </div>
              ))}
              {data.roommates.length < 5 && (
                <button type="button" onClick={addRoommate} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center">
                  <Plus className="w-5 h-5" />Aggiungi coinquilino
                </button>
              )}
            </div>
          </div>
        </div>
      ),
    },

    /* ---- 19: Contatto (AUTO-ADVANCE) ---- */
    {
      id: 'contatto', emoji: '📞', title: 'Come vuoi essere contattato?',
      subtitle: 'Scegli il canale preferito',
      isValid: () => !!data.contactPreference,
      autoAdvance: true,
      content: (
        <div className="space-y-3">
          {CONTACT_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => { onChange({ contactPreference: value }); autoNext(); }}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                data.contactPreference === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="text-left">
                <span className="font-semibold block">{label}</span>
                <span className="text-sm opacity-75">{desc}</span>
              </div>
            </button>
          ))}
          {regMode === 'registered' && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-xs text-primary-700 mt-2">
              💡 Essendo registrato, l&apos;app gestirà le richieste e troverà il miglior match per te, evitandoti troppe chiamate.
            </div>
          )}
        </div>
      ),
    },

    /* ---- 20b: Anonymous contact (only for anon) ---- */
    ...(regMode === 'anonymous' ? [{
      id: 'contatto-anonimo', emoji: '📧', title: 'Recapiti per i candidati',
      subtitle: "Senza account, gli inquilini ti contatteranno direttamente",
      isValid: () => !!(data.contactEmail || data.contactPhone),
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            ⏳ L&apos;annuncio sarà attivo per <strong>15 giorni</strong>.
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={data.contactEmail || ''} onChange={(e) => onChange({ contactEmail: e.target.value })} placeholder="mario@esempio.it" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefono (opzionale)</label>
            <input type="tel" value={data.contactPhone || ''} onChange={(e) => onChange({ contactPhone: e.target.value })} placeholder="+39 333 1234567" className={inputCls} />
          </div>
        </div>
      ),
    }] : []),

    /* ---- 21: Riepilogo ---- */
    {
      id: 'riepilogo', emoji: '✅', title: 'Tutto pronto!',
      subtitle: 'Controlla i dettagli e pubblica',
      isValid: () => data.images.length > 0,
      content: (
        <div>
          <StepReview data={data} />
        </div>
      ),
    },
  ];

  /* ================================================================
     Render
     ================================================================ */

  const card = cards[currentCard];
  const progress = ((currentCard + 1) / cards.length) * 100;
  const isLast = currentCard === cards.length - 1;

  /* slide animation class */
  const slideClass = animating
    ? direction === 'next'
      ? 'translate-x-[-30px] opacity-0 scale-95'
      : 'translate-x-[30px] opacity-0 scale-95'
    : 'translate-x-0 opacity-100 scale-100';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Sticky header with progress */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <button type="button" onClick={goPrev} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>
            <span className="text-sm text-gray-400 font-medium tabular-nums">
              {currentCard + 1} / {cards.length}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Emoji + title */}
        <div className={`text-center mb-8 transition-all duration-250 ease-out ${slideClass}`}>
          <span className="text-5xl mb-4 block">{card.emoji}</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
          {card.subtitle && <p className="text-gray-500">{card.subtitle}</p>}
        </div>

        {/* Error */}
        {error && <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700 text-sm">{error}</div>}

        {/* Card deck — stacked cards behind current */}
        <div className="relative">
          {/* Shadow card 2 (behind) */}
          {currentCard < cards.length - 2 && (
            <div className="absolute inset-x-4 top-3 h-16 bg-white/40 rounded-2xl border border-gray-200/40" />
          )}
          {/* Shadow card 1 (behind) */}
          {currentCard < cards.length - 1 && (
            <div className="absolute inset-x-2 top-1.5 h-16 bg-white/60 rounded-2xl border border-gray-200/60" />
          )}
          {/* Active card */}
          <div className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 transition-all duration-250 ease-out ${slideClass}`}>
            {card.content}
          </div>
        </div>

        {/* Navigation */}
        {!card.autoAdvance && (
          <div className="mt-8 flex justify-center gap-3">
            {isLast ? (
              <>
                {regMode !== 'anonymous' && (
                  <button type="button" onClick={() => onSubmit(false)} disabled={submitting} className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50">
                    <Save className="w-5 h-5" />Salva bozza
                  </button>
                )}
                <button type="button" onClick={() => onSubmit(true)} disabled={submitting || !card.isValid()} className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-primary-600/25">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Pubblica
                </button>
              </>
            ) : (
              <button type="button" onClick={goNext} disabled={!card.isValid()} className="flex items-center gap-2 px-10 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-40 transition-colors shadow-lg shadow-primary-600/25">
                Avanti
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Skip hint for optional cards */}
        {!isLast && !card.autoAdvance && card.isValid() && currentCard > 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Puoi anche saltare e completare dopo
          </p>
        )}
      </div>
    </div>
  );
}
