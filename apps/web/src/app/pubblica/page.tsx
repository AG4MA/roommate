'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Save, Send, Loader2, CheckCircle,
  Building2, User, Repeat2, ShieldAlert, AlertTriangle, BadgeCheck,
  UserPlus, UserX, Clock, Mail, Phone, Link2, Copy, Check
} from 'lucide-react';
import { trackAction } from '@/hooks/useAnalytics';

// Step components
import { StepBasicInfo } from '@/components/listing/StepBasicInfo';
import { StepLocation } from '@/components/listing/StepLocation';
import { StepFeatures } from '@/components/listing/StepFeatures';
import { StepPreferences } from '@/components/listing/StepPreferences';
import { StepMedia } from '@/components/listing/StepMedia';
import { StepReview } from '@/components/listing/StepReview';

export interface ListingFormData {
  title: string;
  description: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'ENTIRE_PLACE';
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
    cleaningSchedule: string;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  preferences: {
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    ageMin: number | null;
    ageMax: number | null;
    occupation: string[];
    languages: string[];
  };
  images: { url: string; caption?: string }[];
  videoUrl: string;
  roommates: { name: string; age?: number; occupation?: string; bio?: string }[];
  publisherType?: 'private' | 'company' | 'sublet';
  companyName?: string;
  vatNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
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
    guestsAllowed: true, cleaningSchedule: '', quietHoursStart: '', quietHoursEnd: '',
  },
  preferences: {
    gender: null, ageMin: null, ageMax: null, occupation: [], languages: [],
  },
  images: [],
  videoUrl: '',
  roommates: [],
};

const LISTING_STEPS = [
  { title: 'Informazioni base', label: 'Info' },
  { title: 'Posizione', label: 'Posizione' },
  { title: 'Caratteristiche e regole', label: 'Dettagli' },
  { title: 'Chi cerchi', label: 'Preferenze' },
  { title: 'Foto e video', label: 'Media' },
  { title: 'Riepilogo', label: 'Pubblica' },
];

type PublisherType = 'private' | 'company' | 'sublet';
type RegistrationMode = 'registered' | 'anonymous';
type OnboardingPhase = 'reg-choice' | 'type' | 'declarations' | 'company-info' | 'done';

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

// ---- Phase 1: Type selection ----

const TYPE_OPTIONS: { value: PublisherType; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: 'private', icon: <User className="w-8 h-8" />, label: 'Privato', desc: 'Sei un privato cittadino che affitta una stanza nel proprio appartamento' },
  { value: 'company', icon: <Building2 className="w-8 h-8" />, label: 'Azienda', desc: "Sei un'azienda o agenzia che gestisce immobili per affitto a stanze" },
  { value: 'sublet', icon: <Repeat2 className="w-8 h-8" />, label: 'Subaffitto', desc: 'Sei un inquilino e vuoi subaffittare la tua stanza a qualcun altro' },
];

function OnboardingTypeStep({ onSelect, onBack, regMode }: { onSelect: (t: PublisherType) => void; onBack: () => void; regMode: RegistrationMode }) {
  const options = regMode === 'anonymous' ? TYPE_OPTIONS.filter((o) => o.value !== 'company') : TYPE_OPTIONS;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Tipo di inserzionista</h1>
      <p className="text-gray-500 mb-10 text-center max-w-md">Prima di tutto, dicci chi sei. Il processo sar&agrave; adattato alle tue esigenze.</p>
      <div className={`grid grid-cols-1 ${options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 w-full max-w-2xl`}>
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onSelect(opt.value)} className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-primary-400 hover:shadow-lg transition-all text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">{opt.icon}</div>
            <span className="text-lg font-semibold text-gray-800">{opt.label}</span>
            <span className="text-sm text-gray-500 leading-snug">{opt.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={onBack} className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
        <ChevronLeft className="w-5 h-5" />Indietro
      </button>
    </div>
  );
}

// ---- Phase 2: Declarations ----

function OnboardingDeclarations({ publisherType, onAccept, onBack }: { publisherType: PublisherType; onAccept: () => void; onBack: () => void }) {
  const [accepted, setAccepted] = useState<[boolean, boolean]>([false, false]);
  const allAccepted = accepted[0] && accepted[1];
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Regole della piattaforma</h1>
      <p className="text-gray-500 mb-8 text-center max-w-lg">rooMate &egrave; dedicata alla ricerca di <strong>stanze singole</strong> in appartamenti condivisi. Prima di procedere, conferma di aver letto e accettato le seguenti condizioni.</p>
      <div className="w-full max-w-lg space-y-4 mb-8">
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
          <input type="checkbox" checked={accepted[0]} onChange={() => setAccepted([!accepted[0], accepted[1]])} className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /><span className="font-semibold text-gray-800">Tipologia di stanze</span></div>
            <p className="text-sm text-gray-600 leading-relaxed">Dichiaro di aver compreso che su rooMate <strong>non &egrave; possibile pubblicare annunci per stanze doppie o monolocali</strong>. La piattaforma &egrave; dedicata esclusivamente a <strong>stanze singole</strong> in appartamenti condivisi.</p>
          </div>
        </label>
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
          <input type="checkbox" checked={accepted[1]} onChange={() => setAccepted([accepted[0], !accepted[1]])} className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><ShieldAlert className="w-5 h-5 text-red-500 shrink-0" /><span className="font-semibold text-gray-800">Identit&agrave; veritiera</span></div>
            <p className="text-sm text-gray-600 leading-relaxed">Dichiaro che le informazioni fornite sono veritiere. Comprendo che <strong>chi si finge privato ma &egrave; in realt&agrave; un&apos;azienda verr&agrave; eliminato permanentemente</strong> dalla piattaforma e non potr&agrave; pi&ugrave; farne parte.</p>
          </div>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"><ChevronLeft className="w-5 h-5" />Indietro</button>
        <button onClick={onAccept} disabled={!allAccepted} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><BadgeCheck className="w-5 h-5" />Accetto e continuo</button>
      </div>
    </div>
  );
}

// ---- Phase 3: Company info ----

function OnboardingCompanyInfo({ companyName, vatNumber, onChange, onNext, onBack }: { companyName: string; vatNumber: string; onChange: (u: { companyName?: string; vatNumber?: string }) => void; onNext: () => void; onBack: () => void }) {
  const { data: session } = useSession();
  const valid = companyName.trim().length >= 2 && /^[A-Z]{2}\d{9,12}$/.test(vatNumber.replace(/\s/g, '').toUpperCase());
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4"><Building2 className="w-8 h-8" /></div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Profilo azienda</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">Per pubblicare come azienda &egrave; necessario fornire i dati fiscali.{!session && <span className="block mt-2 text-primary-600 font-medium">Dovrai anche effettuare la registrazione per continuare.</span>}</p>
      <div className="w-full max-w-md space-y-4 mb-8">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Ragione sociale</label><input type="text" value={companyName} onChange={(e) => onChange({ companyName: e.target.value })} placeholder="Es. Immobiliare Rossi S.r.l." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label><input type="text" value={vatNumber} onChange={(e) => onChange({ vatNumber: e.target.value })} placeholder="Es. IT01234567890" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono" /><p className="text-xs text-gray-400 mt-1">Formato: codice paese (2 lettere) + numeri</p></div>
        {!session && <div className="p-4 rounded-xl bg-amber-50 border border-amber-200"><p className="text-sm text-amber-800"><strong>Registrazione obbligatoria:</strong> I profili aziendali devono registrarsi prima di pubblicare un annuncio.</p><a href="/registrati" className="inline-block mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700">Registrati ora &rarr;</a></div>}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"><ChevronLeft className="w-5 h-5" />Indietro</button>
        <button onClick={onNext} disabled={!valid || !session} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Continua<ChevronRight className="w-5 h-5" /></button>
      </div>
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
  const [currentStep, setCurrentStep] = useState(0);
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
    return <OnboardingRegChoice onSelect={(mode) => { setRegMode(mode); trackAction('affitta_reg_choice', { mode }); setOnboardingPhase('type'); }} />;
  }

  if (onboardingPhase === 'type') {
    return <OnboardingTypeStep regMode={regMode!} onSelect={(type) => { setPublisherType(type); setFormData((p) => ({ ...p, publisherType: type })); trackAction('affitta_type_selected', { type }); setOnboardingPhase('declarations'); }} onBack={() => setOnboardingPhase('reg-choice')} />;
  }

  if (onboardingPhase === 'declarations') {
    return <OnboardingDeclarations publisherType={publisherType!} onAccept={() => { trackAction('affitta_declarations_accepted'); setOnboardingPhase(publisherType === 'company' ? 'company-info' : 'done'); }} onBack={() => setOnboardingPhase('type')} />;
  }

  if (onboardingPhase === 'company-info') {
    return <OnboardingCompanyInfo companyName={formData.companyName || ''} vatNumber={formData.vatNumber || ''} onChange={(u) => setFormData((p) => ({ ...p, ...u }))} onNext={() => setOnboardingPhase('done')} onBack={() => setOnboardingPhase('declarations')} />;
  }

  if (publisherType === 'company' && (!session || session.user.role !== 'landlord')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Registrazione obbligatoria</h1>
        <p className="text-gray-500 mb-6">I profili aziendali devono registrarsi come proprietari per pubblicare annunci.</p>
        <a href="/registrati" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">Registrati come proprietario</a>
      </div>
    );
  }

  if (regMode === 'registered' && !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Accedi o registrati</h1>
        <p className="text-gray-500 mb-6">Hai scelto di pubblicare con registrazione. Accedi o crea un account per continuare.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/registrati?redirect=/pubblica" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"><UserPlus className="w-5 h-5" />Registrati</a>
          <a href="/login?redirect=/pubblica" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Accedi</a>
        </div>
        <button onClick={() => setOnboardingPhase('reg-choice')} className="mt-6 text-sm text-gray-500 hover:text-primary-600 transition-colors">&larr; Torna indietro e pubblica senza registrazione</button>
      </div>
    );
  }

  const updateFormData = (updates: Partial<ListingFormData>) => setFormData((p) => ({ ...p, ...updates }));
  const handleNext = () => { if (currentStep < LISTING_STEPS.length - 1) { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); } };
  const handlePrev = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); } };

  const handleSubmit = async (publish: boolean) => {
    setSubmitting(true);
    setError('');

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

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepBasicInfo data={formData} onChange={updateFormData} />;
      case 1: return <StepLocation data={formData} onChange={updateFormData} />;
      case 2: return <StepFeatures data={formData} onChange={updateFormData} />;
      case 3: return <StepPreferences data={formData} onChange={updateFormData} />;
      case 4: return <StepMedia data={formData} onChange={updateFormData} />;
      case 5: return <StepReview data={formData} />;
      default: return null;
    }
  };

  const typeLabel = publisherType === 'company' ? 'Azienda' : publisherType === 'sublet' ? 'Subaffitto' : 'Privato';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Pubblica annuncio</h1>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">{typeLabel}</span>
        {regMode === 'anonymous' && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Senza registrazione</span>}
      </div>
      <p className="text-gray-500 mb-8">Compila tutti i campi per pubblicare il tuo annuncio</p>

      {regMode === 'anonymous' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 mb-3"><strong>Pubblicazione senza account:</strong> l&apos;annuncio sar&agrave; attivo per 15 giorni. I candidati potranno contattarti solo via email o telefono.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-600" /><input type="email" placeholder="La tua email *" value={formData.contactEmail || ''} onChange={(e) => updateFormData({ contactEmail: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" /></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-600" /><input type="tel" placeholder="Telefono (opzionale)" value={formData.contactPhone || ''} onChange={(e) => updateFormData({ contactPhone: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" /></div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-8 overflow-x-auto">
        {LISTING_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center">
            <button onClick={() => idx <= currentStep && setCurrentStep(idx)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${idx === currentStep ? 'bg-primary-600 text-white' : idx < currentStep ? 'bg-primary-50 text-primary-700 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
              {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">{idx + 1}</span>}
              {step.label}
            </button>
            {idx < LISTING_STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 ${idx < currentStep ? 'bg-primary-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">{LISTING_STEPS[currentStep].title}</h2>
      {error && <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">{renderStep()}</div>

      <div className="flex justify-between items-center">
        <button onClick={() => { if (currentStep === 0) setOnboardingPhase('declarations'); else handlePrev(); }} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"><ChevronLeft className="w-5 h-5" />Indietro</button>
        <div className="flex gap-3">
          {currentStep === LISTING_STEPS.length - 1 ? (
            <>
              {regMode !== 'anonymous' && <button onClick={() => handleSubmit(false)} disabled={submitting} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"><Save className="w-5 h-5" />Salva bozza</button>}
              <button onClick={() => handleSubmit(true)} disabled={submitting} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50 transition-colors">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}Pubblica</button>
            </>
          ) : (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">Avanti<ChevronRight className="w-5 h-5" /></button>
          )}
        </div>
      </div>
    </div>
  );
}