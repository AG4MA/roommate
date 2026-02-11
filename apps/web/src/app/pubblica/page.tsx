'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Save, Send, Loader2, CheckCircle } from 'lucide-react';

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

const STEPS = [
  { title: 'Informazioni base', label: 'Info' },
  { title: 'Posizione', label: 'Posizione' },
  { title: 'Caratteristiche e regole', label: 'Dettagli' },
  { title: 'Chi cerchi', label: 'Preferenze' },
  { title: 'Foto e video', label: 'Media' },
  { title: 'Riepilogo', label: 'Pubblica' },
];

export default function PubblicaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== 'landlord') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Accesso riservato</h1>
        <p className="text-gray-500">
          Solo i proprietari possono pubblicare annunci.{' '}
          <a href="/registrati" className="text-primary-600 hover:underline">Registrati come proprietario</a>
        </p>
      </div>
    );
  }

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Pubblica annuncio</h1>
      <p className="text-gray-500 mb-8">Compila tutti i campi per pubblicare il tuo annuncio</p>

      {/* Step Indicator */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {STEPS.map((step, idx) => (
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
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < currentStep ? 'bg-primary-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{STEPS[currentStep].title}</h2>

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
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Indietro
        </button>

        <div className="flex gap-3">
          {currentStep === STEPS.length - 1 ? (
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
