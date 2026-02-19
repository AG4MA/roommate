'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Save, Send, Loader2, CheckCircle,
  Building2, User, Repeat2, ShieldAlert, AlertTriangle, BadgeCheck,
  UserPlus, UserX, Clock, Mail, Phone, Link2, Copy, Check, Lock
} from 'lucide-react';
import { trackAction } from '@/hooks/useAnalytics';
import { ListingWizard } from '@/components/listing/ListingWizard';

export interface ListingFormData {
  title: string;
  description: string;
  roomType: 'SINGLE'; // Solo stanze singole
  price: number;
  expenses: number;
  deposit: number;
  roomSize: number;
  totalSize: number | null;
  floor: number | null;
  hasElevator: boolean;
  availableFrom: string;
  minStay: number;
  maxStay: number | null;
  // House metadata
  totalRooms: number | null;
  bathrooms: number | null;
  specialAreas: string[];
  // Location
  address: string;
  city: string;
  neighborhood: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  features: {
    wifi: boolean;
    furnished: boolean;
    privateBath: boolean;
    balcony: boolean;
    aircon: boolean;
    heating: boolean;
    washingMachine: boolean;
    dishwasher: boolean;
    parking: boolean;
    garden: boolean;
    terrace: boolean;
  };
  rules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    couplesAllowed: boolean;
    guestsAllowed: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    cleaningSchedule: string;
  };
  preferences: {
    gender: 'MALE' | 'FEMALE' | null;
    ageMin: number | null;
    ageMax: number | null;
    occupation: string[];
  };
  // Pricing breakdown
  pricing: {
    allInclusive: boolean;
    electricityGas: number | null;
    water: number | null;
    heatingCost: number | null;
    condominiumFees: number | null;
    cleaningIncluded: boolean;
    cleaningFrequency: string;
    cleaningHours: string;
    cleaningArea: 'common' | 'all' | '';
    expenseNotes: string;
  };
  // Contract details
  contract: {
    type: string;
    startDate: string;
    endDate: string;
    minDuration: number | null;
    maxDuration: number | null;
    renewalPossible: boolean | null;
    renewalConditions: string;
    residenceAllowed: boolean | null;
    domicileAllowed: boolean | null;
    outOfTownOnly: boolean;
    outOfTownNote: string;
  };
  images: { url: string; caption?: string }[];
  videoUrl: string;
  roommates: { name: string; age?: number; gender?: string; occupation?: string; bio?: string }[];
  publisherType?: 'private' | 'company' | 'sublet';
  companyName?: string;
  vatNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPreference?: 'email' | 'phone' | 'app';
}

const INITIAL_DATA: ListingFormData = {
  title: '',
  description: '',
  roomType: 'SINGLE',
  price: 0,
  expenses: 0,
  deposit: 0,
  roomSize: 0,
  totalSize: null,
  floor: null,
  hasElevator: false,
  availableFrom: '',
  minStay: 6,
  maxStay: null,
  totalRooms: null,
  bathrooms: null,
  specialAreas: [],
  address: '',
  city: 'Milano',
  neighborhood: '',
  postalCode: '',
  latitude: 45.4642,
  longitude: 9.19,
  features: {
    wifi: false, furnished: false, privateBath: false, balcony: false,
    aircon: false, heating: true, washingMachine: false, dishwasher: false,
    parking: false, garden: false, terrace: false,
  },
  rules: {
    petsAllowed: false, smokingAllowed: false, couplesAllowed: false,
    guestsAllowed: true, quietHoursEnabled: false, quietHoursStart: '', quietHoursEnd: '',
    cleaningSchedule: '',
  },
  preferences: {
    gender: null, ageMin: null, ageMax: null, occupation: [],
  },
  pricing: {
    allInclusive: false,
    electricityGas: null,
    water: null,
    heatingCost: null,
    condominiumFees: null,
    cleaningIncluded: false,
    cleaningFrequency: '',
    cleaningHours: '',
    cleaningArea: '',
    expenseNotes: '',
  },
  contract: {
    type: '',
    startDate: '',
    endDate: '',
    minDuration: null,
    maxDuration: null,
    renewalPossible: null,
    renewalConditions: '',
    residenceAllowed: null,
    domicileAllowed: null,
    outOfTownOnly: false,
    outOfTownNote: '',
  },
  images: [],
  videoUrl: '',
  roommates: [],
};

type PublisherType = 'private' | 'company' | 'sublet';
type RegistrationMode = 'registered' | 'anonymous';
type OnboardingPhase = 'reg-choice' | 'setup' | 'done';

// ---- Phase 0: Registration choice ----

function OnboardingRegChoice({ onSelect }: { onSelect: (mode: RegistrationMode) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Affitta stanza</h1>
      <p className="text-gray-500 mb-10 text-center max-w-md">
        Vuoi registrarti per avere tutte le funzionalit&agrave;, o preferisci pubblicare velocemente senza account?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <button onClick={() => onSelect('registered')} className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-primary-400 hover:shadow-lg transition-all text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">
            <UserPlus className="w-8 h-8" />
          </div>
          <span className="text-lg font-semibold text-gray-800">Con registrazione</span>
          <ul className="text-sm text-gray-500 text-left space-y-1.5">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Chat diretta con i candidati</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Best match &mdash; vedi chi &egrave; pi&ugrave; compatibile</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Scheduling automatico visite</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Annuncio attivo senza limiti di tempo</li>
          </ul>
          <span className="mt-2 px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-medium group-hover:bg-primary-700 transition-colors">Consigliato</span>
        </button>
        <button onClick={() => onSelect('anonymous')} className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg transition-all text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <UserX className="w-8 h-8" />
          </div>
          <span className="text-lg font-semibold text-gray-800">Senza registrazione</span>
          <ul className="text-sm text-gray-500 text-left space-y-1.5">
            <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />Annuncio attivo solo 15 giorni</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Contatto solo via email/telefono</li>
            <li className="flex items-start gap-2"><Link2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Modifiche con link + codice segreto</li>
            <li className="flex items-start gap-2"><UserPlus className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Puoi registrarti dopo e mantenere l&apos;annuncio</li>
          </ul>
          <span className="mt-2 px-4 py-1.5 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">Veloce</span>
        </button>
      </div>
    </div>
  );
}

// ---- Phase 1: Inline setup (type + declarations + company info) ----

const TYPE_OPTIONS: { value: PublisherType; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: 'private', icon: <User className="w-6 h-6" />, label: 'Privato', desc: 'Privato cittadino' },
  { value: 'company', icon: <Building2 className="w-6 h-6" />, label: 'Azienda', desc: 'Agenzia / impresa' },
  { value: 'sublet', icon: <Repeat2 className="w-6 h-6" />, label: 'Subaffitto', desc: 'Inquilino che subaffitta' },
];

function OnboardingSetup({
  regMode,
  companyName,
  vatNumber,
  onChangeCompany,
  onDone,
  onBack,
}: {
  regMode: RegistrationMode;
  companyName: string;
  vatNumber: string;
  onChangeCompany: (u: { companyName?: string; vatNumber?: string }) => void;
  onDone: (type: PublisherType) => void;
  onBack: () => void;
}) {
  const { data: session, update: updateSession } = useSession();
  const [selected, setSelected] = useState<PublisherType | null>(null);
  const [accepted, setAccepted] = useState<[boolean, boolean]>([false, false]);
  const allAccepted = accepted[0] && accepted[1];
  const options = regMode === 'anonymous' ? TYPE_OPTIONS.filter((o) => o.value !== 'company') : TYPE_OPTIONS;
  const companyValid = companyName.trim().length >= 2 && /^[A-Z]{2}\d{9,12}$/.test(vatNumber.replace(/\s/g, '').toUpperCase());

  // Inline registration state
  const needsRegistration = regMode === 'registered' && !session;
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const regValid = regName.trim().length >= 2 && regEmail.includes('@') && regPassword.length >= 8;

  const canProceed = selected && allAccepted
    && (selected !== 'company' || companyValid)
    && (!needsRegistration || regValid);

  const handleContinue = async () => {
    if (!canProceed || !selected) return;

    // If user needs to register, do it inline
    if (needsRegistration) {
      setRegLoading(true);
      setRegError('');
      try {
        // Register
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName,
            email: regEmail,
            password: regPassword,
            userType: 'landlord',
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setRegError(data.error || 'Errore durante la registrazione');
          setRegLoading(false);
          return;
        }
        // Auto-login
        const result = await signIn('credentials', {
          email: regEmail,
          password: regPassword,
          redirect: false,
        });
        if (result?.error) {
          setRegError('Registrazione riuscita ma login fallito. Riprova.');
          setRegLoading(false);
          return;
        }
        // Refresh session
        await updateSession();
        trackAction('inline_registration_pubblica', { type: selected });
      } catch {
        setRegError('Errore di connessione');
        setRegLoading(false);
        return;
      }
      setRegLoading(false);
    }

    onDone(selected);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Chi sei?</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">Seleziona il tipo di inserzionista. Il processo sar&agrave; adattato alle tue esigenze.</p>

      {/* Type cards — compact row */}
      <div className={`grid grid-cols-1 ${options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 w-full max-w-2xl mb-6`}>
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { setSelected(opt.value); setAccepted([false, false]); }}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                active
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : selected
                    ? 'border-gray-100 bg-gray-50 opacity-60 hover:opacity-90'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'}`}>{opt.icon}</div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className="block text-xs text-gray-500 leading-snug">{opt.desc}</span>
              </div>
              {active && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary-600" />}
            </button>
          );
        })}
      </div>

      {/* Declarations — appear when type selected */}
      {selected && (
        <div className="w-full max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Conferma le regole della piattaforma</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
                <input type="checkbox" checked={accepted[0]} onChange={() => setAccepted([!accepted[0], accepted[1]])} className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /><span className="text-sm font-semibold text-gray-800">Solo stanze singole</span></div>
                  <p className="text-xs text-gray-500 leading-relaxed">Su rooMate <strong>non si pubblicano stanze doppie o monolocali</strong>. Solo stanze singole in appartamenti condivisi.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
                <input type="checkbox" checked={accepted[1]} onChange={() => setAccepted([accepted[0], !accepted[1]])} className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /><span className="text-sm font-semibold text-gray-800">Identit&agrave; veritiera</span></div>
                  <p className="text-xs text-gray-500 leading-relaxed">Le informazioni sono veritiere. <strong>Chi si finge privato ma &egrave; un&apos;azienda verr&agrave; eliminato.</strong></p>
                </div>
              </label>
            </div>
          </div>

          {/* Company fields — inline when type=company */}
          {selected === 'company' && allAccepted && (
            <div className="border-t border-gray-100 pt-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-600" />Dati aziendali</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ragione sociale</label>
                  <input type="text" value={companyName} onChange={(e) => onChangeCompany({ companyName: e.target.value })} placeholder="Es. Immobiliare Rossi S.r.l." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Partita IVA</label>
                  <input type="text" value={vatNumber} onChange={(e) => onChangeCompany({ vatNumber: e.target.value })} placeholder="IT01234567890" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Inline registration fields — appear when registered mode + not logged in + flags accepted */}
          {needsRegistration && allAccepted && (
            <div className="border-t border-gray-100 pt-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary-600" />Crea il tuo account</p>
              <p className="text-xs text-gray-500 mb-4">Completa la registrazione per proseguire con la pubblicazione.</p>
              {regError && (
                <div className="mb-3 p-3 bg-red-50 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{regError}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Il tuo nome" required minLength={2} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="mario@esempio.it" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimo 8 caratteri" required minLength={8} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Hai gi&agrave; un account? <a href="/login?redirect=/pubblica" className="text-primary-600 hover:underline font-medium">Accedi</a>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4">
            <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />Indietro
            </button>
            <button
              onClick={handleContinue}
              disabled={!canProceed || regLoading}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              {needsRegistration && allAccepted ? 'Registrati e continua' : 'Continua'}
            </button>
          </div>
        </div>
      )}

      {/* Back button when no type selected yet */}
      {!selected && (
        <button onClick={onBack} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-4 h-4" />Indietro
        </button>
      )}
    </div>
  );
}

// ---- Anonymous success screen ----

function AnonymousSuccess({ listingId, editToken, editCode, expiresAt }: { listingId: string; editToken: string; editCode: string; expiresAt: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const editLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/stanza/${listingId}?edit=${editToken}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    await navigator.clipboard.writeText(text);
    if (type === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    else { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Annuncio pubblicato!</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">Salva il link e il codice qui sotto. Ti serviranno per modificare l&apos;annuncio.</p>
      <div className="w-full max-w-lg space-y-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />Link di modifica</label>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={editLink} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono text-gray-600 truncate" />
            <button onClick={() => copyToClipboard(editLink, 'link')} className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors">{copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copiedLink ? 'Copiato!' : 'Copia'}</button>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" />Codice segreto (6 cifre)</label>
          <div className="flex items-center gap-2">
            <span className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-2xl font-mono text-gray-800 tracking-[0.3em] text-center">{editCode}</span>
            <button onClick={() => copyToClipboard(editCode, 'code')} className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors">{copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copiedCode ? 'Copiato!' : 'Copia'}</button>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">L&apos;annuncio scade il {expiryDate}</p>
              <p>Dopo questa data verr&agrave; rimosso automaticamente, a meno che non ti registri e rivendichi l&apos;annuncio con il codice segreto.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={`/stanza/${listingId}`} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">Vedi annuncio</a>
          <a href="/registrati" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors"><UserPlus className="w-5 h-5" />Registrati e mantieni l&apos;annuncio</a>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function PubblicaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [regMode, setRegMode] = useState<RegistrationMode | null>(null);
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('reg-choice');
  const [publisherType, setPublisherType] = useState<PublisherType | null>(null);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [anonResult, setAnonResult] = useState<{ listingId: string; editToken: string; editCode: string; expiresAt: string } | null>(null);

  useEffect(() => {
    if (onboardingPhase === 'done' && publisherType) {
      trackAction('affitta_onboarding_done', { type: publisherType, mode: regMode || 'unknown' });
    }
  }, [onboardingPhase, publisherType, regMode]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (anonResult) return <AnonymousSuccess {...anonResult} />;

  if (onboardingPhase === 'reg-choice') {
    return <OnboardingRegChoice onSelect={(mode) => { setRegMode(mode); trackAction('affitta_reg_choice', { mode }); setOnboardingPhase('setup'); }} />;
  }

  if (onboardingPhase === 'setup') {
    return (
      <OnboardingSetup
        regMode={regMode!}
        companyName={formData.companyName || ''}
        vatNumber={formData.vatNumber || ''}
        onChangeCompany={(u) => setFormData((p) => ({ ...p, ...u }))}
        onDone={(type) => {
          setPublisherType(type);
          setFormData((p) => ({ ...p, publisherType: type }));
          trackAction('affitta_type_selected', { type });
          trackAction('affitta_declarations_accepted');
          setOnboardingPhase('done');
        }}
        onBack={() => setOnboardingPhase('reg-choice')}
      />
    );
  }

  if (publisherType === 'company' && (!session || session.user.role !== 'landlord')) {
    // Company users who somehow lost their session — redirect back to setup for inline re-registration
    return (
      <OnboardingSetup
        regMode={regMode!}
        companyName={formData.companyName || ''}
        vatNumber={formData.vatNumber || ''}
        onChangeCompany={(u) => setFormData((p) => ({ ...p, ...u }))}
        onDone={(type) => {
          setPublisherType(type);
          setFormData((p) => ({ ...p, publisherType: type }));
          setOnboardingPhase('done');
        }}
        onBack={() => setOnboardingPhase('reg-choice')}
      />
    );
  }

  // Registration is now handled inline in OnboardingSetup,
  // so if user lost session mid-wizard, redirect back to setup for re-login
  if (regMode === 'registered' && !session) {
    return (
      <OnboardingSetup
        regMode={regMode}
        companyName={formData.companyName || ''}
        vatNumber={formData.vatNumber || ''}
        onChangeCompany={(u) => setFormData((p) => ({ ...p, ...u }))}
        onDone={(type) => {
          setPublisherType(type);
          setFormData((p) => ({ ...p, publisherType: type }));
          setOnboardingPhase('done');
        }}
        onBack={() => setOnboardingPhase('reg-choice')}
      />
    );
  }

  const updateFormData = (updates: Partial<ListingFormData>) => setFormData((p) => ({ ...p, ...updates }));

  const handleSubmit = async (publish: boolean) => {
    setSubmitting(true);
    setError('');

    // Photo validation — blocking
    if (publish && formData.images.length === 0) {
      setError('Devi caricare almeno una foto per pubblicare l\'annuncio.');
      setSubmitting(false);
      return;
    }

    if (regMode === 'anonymous') {
      if (!formData.contactEmail && !formData.contactPhone) {
        setError('Inserisci almeno un recapito (email o telefono) per essere contattato.');
        setSubmitting(false);
        return;
      }
      try {
        const res = await fetch('/api/listings/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, availableFrom: formData.availableFrom || new Date().toISOString(), publish }),
        });
        const json = await res.json();
        if (json.success) {
          trackAction('listing_published_anonymous');
          setAnonResult({ listingId: json.data.id, editToken: json.data.editToken, editCode: json.data.editCode, expiresAt: json.data.expiresAt });
        } else {
          setError(json.error || "Errore durante la creazione dell'annuncio");
        }
      } catch { setError('Errore di connessione'); }
      finally { setSubmitting(false); }
      return;
    }

    if (!session) { router.push('/login?redirect=/pubblica'); return; }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, availableFrom: formData.availableFrom || new Date().toISOString(), publish }),
      });
      const json = await res.json();
      if (json.success) {
        trackAction('listing_published', { type: publisherType || 'unknown', publish: String(publish) });
        router.push(`/stanza/${json.data.id}`);
      } else {
        setError(json.error || "Errore durante la creazione dell'annuncio");
      }
    } catch { setError('Errore di connessione'); }
    finally { setSubmitting(false); }
  };

  return (
    <ListingWizard
      data={formData}
      onChange={updateFormData}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
      regMode={regMode || 'registered'}
      onBack={() => setOnboardingPhase('setup')}
    />
  );
}