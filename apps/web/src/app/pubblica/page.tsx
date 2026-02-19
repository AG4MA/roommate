'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Save, Send, Loader2, CheckCircle,
  Building2, User, Repeat2, ShieldAlert, AlertTriangle, BadgeCheck
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
  // Basic info
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
  // Location
  address: string;
  city: string;
  neighborhood: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  // Features
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
  // Rules
  rules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    couplesAllowed: boolean;
    guestsAllowed: boolean;
    cleaningSchedule: string;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  // Preferences
  preferences: {
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    ageMin: number | null;
    ageMax: number | null;
    occupation: string[];
    languages: string[];
  };
  // Media
  images: { url: string; caption?: string }[];
  videoUrl: string;
  // Roommates
  roommates: { name: string; age?: number; occupation?: string; bio?: string }[];
  // Publisher type
  publisherType?: 'private' | 'company' | 'sublet';
  companyName?: string;
  vatNumber?: string;
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
    wifi: false,
    furnished: false,
    privateBath: false,
    balcony: false,
    aircon: false,
    heating: true,
    washingMachine: false,
    dishwasher: false,
    parking: false,
    garden: false,
    terrace: false,
  },
  rules: {
    petsAllowed: false,
    smokingAllowed: false,
    couplesAllowed: false,
    guestsAllowed: true,
    cleaningSchedule: '',
    quietHoursStart: '',
    quietHoursEnd: '',
  },
  preferences: {
    gender: null,
    ageMin: null,
    ageMax: null,
    occupation: [],
    languages: [],
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

// ──────────────────────────────────────────────────────────────
// Onboarding Phase: Type selection → Declarations → (Company info)
// ──────────────────────────────────────────────────────────────

type OnboardingPhase = 'type' | 'declarations' | 'company-info' | 'done';

const TYPE_OPTIONS: { value: PublisherType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    value: 'private',
    icon: <User className="w-8 h-8" />,
    label: 'Privato',
    desc: 'Sei un privato cittadino che affitta una stanza nel proprio appartamento',
  },
  {
    value: 'company',
    icon: <Building2 className="w-8 h-8" />,
    label: 'Azienda',
    desc: 'Sei un\'azienda o agenzia che gestisce immobili per affitto a stanze',
  },
  {
    value: 'sublet',
    icon: <Repeat2 className="w-8 h-8" />,
    label: 'Subaffitto',
    desc: 'Sei un inquilino e vuoi subaffittare la tua stanza a qualcun altro',
  },
];

function OnboardingTypeStep({ onSelect }: { onSelect: (t: PublisherType) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Affitta stanza</h1>
      <p className="text-gray-500 mb-10 text-center max-w-md">
        Prima di tutto, dicci chi sei. Il processo sarà adattato alle tue esigenze.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-primary-400 hover:shadow-lg transition-all text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 transition-colors">
              {opt.icon}
            </div>
            <span className="text-lg font-semibold text-gray-800">{opt.label}</span>
            <span className="text-sm text-gray-500 leading-snug">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OnboardingDeclarations({
  publisherType,
  onAccept,
  onBack,
}: {
  publisherType: PublisherType;
  onAccept: () => void;
  onBack: () => void;
}) {
  const [accepted, setAccepted] = useState<[boolean, boolean]>([false, false]);
  const allAccepted = accepted[0] && accepted[1];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Regole della piattaforma</h1>
      <p className="text-gray-500 mb-8 text-center max-w-lg">
        rooMate è dedicata alla ricerca di <strong>stanze singole</strong> in appartamenti condivisi.
        Prima di procedere, conferma di aver letto e accettato le seguenti condizioni.
      </p>

      <div className="w-full max-w-lg space-y-4 mb-8">
        {/* Declaration 1 */}
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
          <input
            type="checkbox"
            checked={accepted[0]}
            onChange={() => setAccepted([!accepted[0], accepted[1]])}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="font-semibold text-gray-800">Tipologia di stanze</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dichiaro di aver compreso che su rooMate <strong>non è possibile pubblicare annunci per
              stanze doppie o monolocali</strong>. La piattaforma è dedicata esclusivamente a <strong>stanze
              singole</strong> in appartamenti condivisi.
            </p>
          </div>
        </label>

        {/* Declaration 2 */}
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-primary-300 transition-colors">
          <input
            type="checkbox"
            checked={accepted[1]}
            onChange={() => setAccepted([accepted[0], !accepted[1]])}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span className="font-semibold text-gray-800">Identità veritiera</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dichiaro che le informazioni fornite sono veritiere. Comprendo che{' '}
              <strong>chi si finge privato ma è in realtà un&apos;azienda verrà eliminato
              permanentemente</strong> dalla piattaforma e non potrà più farne parte.
            </p>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Indietro
        </button>
        <button
          onClick={onAccept}
          disabled={!allAccepted}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <BadgeCheck className="w-5 h-5" />
          Accetto e continuo
        </button>
      </div>
    </div>
  );
}

function OnboardingCompanyInfo({
  companyName,
  vatNumber,
  onChange,
  onNext,
  onBack,
}: {
  companyName: string;
  vatNumber: string;
  onChange: (updates: { companyName?: string; vatNumber?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { data: session } = useSession();
  const valid = companyName.trim().length >= 2 && /^[A-Z]{2}\d{9,12}$/.test(vatNumber.replace(/\s/g, '').toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
        <Building2 className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Profilo azienda</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Per pubblicare come azienda è necessario fornire i dati fiscali.
        {!session && (
          <span className="block mt-2 text-primary-600 font-medium">
            Dovrai anche effettuare la registrazione per continuare.
          </span>
        )}
      </p>

      <div className="w-full max-w-md space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ragione sociale</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Es. Immobiliare Rossi S.r.l."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
          <input
            type="text"
            value={vatNumber}
            onChange={(e) => onChange({ vatNumber: e.target.value })}
            placeholder="Es. IT01234567890"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Formato: codice paese (2 lettere) + numeri. Es: IT01234567890</p>
        </div>

        {!session && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Registrazione obbligatoria:</strong> I profili aziendali devono registrarsi prima di pubblicare un annuncio.
            </p>
            <a
              href="/registrati"
              className="inline-block mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Registrati ora →
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Indietro
        </button>
        <button
          onClick={onNext}
          disabled={!valid || !session}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continua
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main page: Onboarding → Listing Form
// ──────────────────────────────────────────────────────────────

export default function PubblicaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Onboarding state
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('type');
  const [publisherType, setPublisherType] = useState<PublisherType | null>(null);

  // Listing form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track onboarding analytics
  useEffect(() => {
    if (onboardingPhase === 'done' && publisherType) {
      trackAction('affitta_onboarding_done', { type: publisherType });
    }
  }, [onboardingPhase, publisherType]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // ── Onboarding phases ──

  if (onboardingPhase === 'type') {
    return (
      <OnboardingTypeStep
        onSelect={(type) => {
          setPublisherType(type);
          setFormData((prev) => ({ ...prev, publisherType: type }));
          trackAction('affitta_type_selected', { type });
          setOnboardingPhase('declarations');
        }}
      />
    );
  }

  if (onboardingPhase === 'declarations') {
    return (
      <OnboardingDeclarations
        publisherType={publisherType!}
        onAccept={() => {
          trackAction('affitta_declarations_accepted');
          if (publisherType === 'company') {
            setOnboardingPhase('company-info');
          } else {
            setOnboardingPhase('done');
          }
        }}
        onBack={() => setOnboardingPhase('type')}
      />
    );
  }

  if (onboardingPhase === 'company-info') {
    return (
      <OnboardingCompanyInfo
        companyName={formData.companyName || ''}
        vatNumber={formData.vatNumber || ''}
        onChange={(u) => setFormData((prev) => ({ ...prev, ...u }))}
        onNext={() => setOnboardingPhase('done')}
        onBack={() => setOnboardingPhase('declarations')}
      />
    );
  }

  // ── After onboarding: require login for company, allow guest for private/sublet ──

  if (publisherType === 'company' && (!session || session.user.role !== 'landlord')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Registrazione obbligatoria</h1>
        <p className="text-gray-500 mb-6">
          I profili aziendali devono registrarsi come proprietari per pubblicare annunci.
        </p>
        <a
          href="/registrati"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
        >
          Registrati come proprietario
        </a>
      </div>
    );
  }

  // Private / sublet can create listing without login, but interactions require login.
  // We show a soft notice instead of blocking.

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < LISTING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    if (!session) {
      // Redirect to login for un-authenticated users trying to submit
      router.push('/login?redirect=/pubblica');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          availableFrom: formData.availableFrom || new Date().toISOString(),
          publish,
        }),
      });

      const json = await res.json();

      if (json.success) {
        trackAction('listing_published', { type: publisherType || 'unknown', publish: String(publish) });
        router.push(`/stanza/${json.data.id}`);
      } else {
        setError(json.error || "Errore durante la creazione dell'annuncio");
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasicInfo data={formData} onChange={updateFormData} />;
      case 1:
        return <StepLocation data={formData} onChange={updateFormData} />;
      case 2:
        return <StepFeatures data={formData} onChange={updateFormData} />;
      case 3:
        return <StepPreferences data={formData} onChange={updateFormData} />;
      case 4:
        return <StepMedia data={formData} onChange={updateFormData} />;
      case 5:
        return <StepReview data={formData} />;
      default:
        return null;
    }
  };

  const typeLabel = publisherType === 'company' ? 'Azienda' : publisherType === 'sublet' ? 'Subaffitto' : 'Privato';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Pubblica annuncio</h1>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
          {typeLabel}
        </span>
      </div>
      <p className="text-gray-500 mb-8">Compila tutti i campi per pubblicare il tuo annuncio</p>

      {/* Login nudge for non-authenticated private/sublet users */}
      {!session && (publisherType === 'private' || publisherType === 'sublet') && (
        <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200 text-sm text-primary-800">
          <strong>Nota:</strong> Puoi compilare l&apos;annuncio senza registrazione, ma per pubblicarlo e gestire le interazioni
          dovrai <a href="/registrati" className="underline font-semibold">creare un account</a> o{' '}
          <a href="/login" className="underline font-semibold">accedere</a>.
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {LISTING_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center">
            <button
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                idx === currentStep
                  ? 'bg-primary-600 text-white'
                  : idx < currentStep
                    ? 'bg-primary-50 text-primary-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {idx < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
              )}
              {step.label}
            </button>
            {idx < LISTING_STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < currentStep ? 'bg-primary-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{LISTING_STEPS[currentStep].title}</h2>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            if (currentStep === 0) {
              // Go back to onboarding
              setOnboardingPhase('declarations');
            } else {
              handlePrev();
            }
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Indietro
        </button>

        <div className="flex gap-3">
          {currentStep === LISTING_STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Save className="w-5 h-5" />
                Salva bozza
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Pubblica
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Avanti
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
