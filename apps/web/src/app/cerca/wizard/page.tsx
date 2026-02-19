'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, MapPin, Euro, Users, User, Home,
  Compass, Navigation, Calendar, Briefcase, Heart, Sparkles,
} from 'lucide-react';
import { useActionTimer, trackAction } from '@/hooks/useAnalytics';

// =============================================
// TYPES
// =============================================
interface WizardData {
  // --- Chi sei tu ---
  userOccupation: string;   // 'student' | 'worker' | 'freelancer' | ''
  userAge: string;
  userGender: string;       // 'male' | 'female' | 'other' | ''
  // --- Cosa cerchi ---
  city: string;
  priceMin: string;
  priceMax: string;
  roommateType: string;     // 'students' | 'workers' | 'mix' | ''
  genderPref: string;       // 'male' | 'female' | 'any'
  features: string[];
  matchLevel: 'exact' | 'flexible';
  wantsDistances: boolean;
  places: { label: string; address: string; mandatory: boolean }[];
  months: string;
  moveIn: string;
}

const INITIAL: WizardData = {
  userOccupation: '',
  userAge: '',
  userGender: '',
  city: '',
  priceMin: '',
  priceMax: '',
  roommateType: '',
  genderPref: 'any',
  features: [],
  matchLevel: 'flexible',
  wantsDistances: false,
  places: [],
  months: '',
  moveIn: '',
};

const STEPS = [
  'Chi sei',
  'Età e genere',
  'Città',
  'Budget',
  'Coinquilini',
  'Genere coinquilini',
  'Caratteristiche',
  'Match',
  'Luoghi preferiti',
  'Durata',
];

// =============================================
// CITY POPULARITY HELPERS (localStorage)
// =============================================
const CITY_CLICKS_KEY = 'roommate_city_clicks';

function getCityClicks(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CITY_CLICKS_KEY) || '{}');
  } catch { return {}; }
}

function trackCityClick(city: string) {
  const clicks = getCityClicks();
  clicks[city] = (clicks[city] || 0) + 1;
  localStorage.setItem(CITY_CLICKS_KEY, JSON.stringify(clicks));
}

const DEFAULT_CITIES = [
  'Milano', 'Roma', 'Torino', 'Bologna', 'Firenze',
  'Napoli', 'Padova', 'Genova', 'Catania', 'Bari',
  'Venezia', 'Verona', 'Palermo', 'Pisa', 'Bergamo',
];

function getSmartCities(): string[] {
  const clicks = getCityClicks();
  return [...DEFAULT_CITIES].sort((a, b) => {
    const ca = clicks[a] || 0;
    const cb = clicks[b] || 0;
    if (cb !== ca) return cb - ca;
    return DEFAULT_CITIES.indexOf(a) - DEFAULT_CITIES.indexOf(b);
  });
}

// =============================================
// FEATURES LIST
// =============================================
const FEATURES_LIST = [
  { key: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { key: 'furnished', label: 'Arredata', icon: '🛋️' },
  { key: 'privateBath', label: 'Bagno privato', icon: '🚿' },
  { key: 'balcony', label: 'Balcone', icon: '🌇' },
  { key: 'aircon', label: 'Aria condizionata', icon: '❄️' },
  { key: 'washingMachine', label: 'Lavatrice', icon: '🧺' },
  { key: 'dishwasher', label: 'Lavastoviglie', icon: '🍽️' },
  { key: 'parking', label: 'Parcheggio', icon: '🅿️' },
  { key: 'garden', label: 'Giardino', icon: '🌳' },
  { key: 'terrace', label: 'Terrazzo', icon: '☀️' },
  { key: 'petsAllowed', label: 'Animali ammessi', icon: '🐾' },
  { key: 'heating', label: 'Riscaldamento', icon: '🔥' },
];

// =============================================
// GOOGLE PLACES AUTOCOMPLETE HOOK
// =============================================
function useGooglePlacesAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  opts: { types?: string[]; componentRestrictions?: { country: string } },
  onSelect: (place: { name: string; formatted: string }) => void,
) {
  useEffect(() => {
    if (!inputRef.current) return;
    if (typeof window === 'undefined') return;
    if (!(window as any).google?.maps?.places) return;

    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: opts.types || ['(cities)'],
        componentRestrictions: opts.componentRestrictions || { country: 'it' },
        fields: ['name', 'formatted_address'],
      },
    );

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place) {
        onSelect({
          name: place.name || '',
          formatted: place.formatted_address || place.name || '',
        });
      }
    });

    return () => {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [inputRef, onSelect, opts.types, opts.componentRestrictions]);
}

// =============================================
// WIZARD PAGE
// =============================================
export default function SearchWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const stepTimer = useActionTimer();

  // Track time spent on each wizard step
  useEffect(() => {
    stepTimer.start();
    return () => { stepTimer.stop(`wizard_step_${step}`, { stepName: STEPS[step] }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const update = useCallback(
    (partial: Partial<WizardData>) => setData((d) => ({ ...d, ...partial })),
    [],
  );

  // Load Google Maps script once
  useEffect(() => {
    if ((window as any).google?.maps?.places) {
      setMapsLoaded(true);
      return;
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=it`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  const canNext = (): boolean => {
    switch (step) {
      case 0: return data.userOccupation !== '';
      case 1: return true; // age/gender optional
      case 2: return data.city.trim().length > 0;
      case 3: return true;
      case 4: return data.roommateType !== '';
      case 5: return true;
      case 6: return true;
      case 7: return true;
      case 8: return true;
      case 9: return true;
      default: return true;
    }
  };

  const handleFinish = () => {
    // Track city click
    if (data.city) trackCityClick(data.city);
    trackAction('wizard_completed', { city: data.city, occupation: data.userOccupation });

    const params = new URLSearchParams();
    // User profile
    if (data.userOccupation) params.set('userOccupation', data.userOccupation);
    if (data.userAge) params.set('userAge', data.userAge);
    if (data.userGender) params.set('userGender', data.userGender);
    // Search criteria — solo stanze singole
    params.set('roomType', 'SINGLE');
    if (data.city) params.set('city', data.city);
    if (data.priceMin) params.set('minPrice', data.priceMin);
    if (data.priceMax) params.set('maxPrice', data.priceMax);
    if (data.roommateType) params.set('roommateType', data.roommateType);
    if (data.genderPref !== 'any') params.set('gender', data.genderPref);
    data.features.forEach((f) => params.append('feature', f));
    params.set('matchLevel', data.matchLevel);
    if (data.places.length > 0) params.set('places', JSON.stringify(data.places));
    if (data.months) params.set('months', data.months);
    if (data.moveIn) params.set('moveIn', data.moveIn);
    router.push(`/cerca?${params.toString()}`);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
    else router.push('/');
  };

  const renderStep = () => {
    const props: StepProps = { data, update, onNext: next, mapsLoaded };
    switch (step) {
      case 0: return <StepOccupation {...props} />;
      case 1: return <StepAgeGender {...props} />;
      case 2: return <StepCity {...props} />;
      case 3: return <StepBudget {...props} />;
      case 4: return <StepRoommateType {...props} />;
      case 5: return <StepGenderPref {...props} />;
      case 6: return <StepFeatures {...props} />;
      case 7: return <StepMatch {...props} />;
      case 8: return <StepPlaces {...props} />;
      case 9: return <StepDuration {...props} />;
      default: return null;
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // Divider label
  const sectionLabel = step <= 1 ? 'Parlaci di te' : 'Cosa cerchi';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div
          className="bg-primary-600 h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section + step indicator */}
      <div className="text-center pt-5 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          {sectionLabel}
        </span>
        <div className="text-sm text-gray-400 mt-0.5">
          {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-xl">{renderStep()}</div>
      </div>

      {/* Bottom nav — only back button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 z-50">
        <div className="max-w-xl mx-auto">
          <button
            onClick={prev}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {step === 0 ? 'Home' : 'Indietro'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// STEP COMPONENTS
// =============================================
interface StepProps {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext?: () => void;
  mapsLoaded?: boolean;
}

// ---------- Step 0: Occupation (Chi sei) — auto-advance ----------
function StepOccupation({ data, update, onNext }: StepProps) {
  const OPTIONS = [
    { value: 'student', label: 'Studente', desc: 'Frequento l\'università', icon: '🎓' },
    { value: 'worker', label: 'Lavoratore', desc: 'Lavoro full-time o part-time', icon: '💼' },
    { value: 'freelancer', label: 'Freelancer', desc: 'Lavoro in proprio', icon: '💻' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Briefcase className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Tu cosa fai?</h2>
        <p className="text-gray-500 mt-1">Ci aiuterà a trovarti le stanze più adatte</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              update({ userOccupation: opt.value });
              setTimeout(() => onNext?.(), 250);
            }}
            className={`flex items-center gap-4 py-5 px-6 rounded-xl border-2 text-left transition-all ${
              data.userOccupation === opt.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <div>
              <div className="font-semibold text-gray-800">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 1: Age & Gender ----------
function StepAgeGender({ data, update, onNext }: StepProps) {
  const GENDERS = [
    { value: 'male', label: 'Uomo', icon: '👨' },
    { value: 'female', label: 'Donna', icon: '👩' },
    { value: 'other', label: 'Altro', icon: '🧑' },
  ];

  const AGE_RANGES = [
    { value: '18-22', label: '18-22' },
    { value: '23-27', label: '23-27' },
    { value: '28-35', label: '28-35' },
    { value: '36+', label: '36+' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Heart className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Dicci qualcosa di te</h2>
        <p className="text-gray-500 mt-1">Opzionale, ma migliora i suggerimenti</p>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Genere</label>
        <div className="grid grid-cols-3 gap-3">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => update({ userGender: data.userGender === g.value ? '' : g.value })}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                data.userGender === g.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-sm font-medium text-gray-700">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Fascia d'età</label>
        <div className="grid grid-cols-4 gap-3">
          {AGE_RANGES.map((a) => (
            <button
              key={a.value}
              onClick={() => update({ userAge: data.userAge === a.value ? '' : a.value })}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                data.userAge === a.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNext?.()}
        className="mx-auto flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
      >
        Continua <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- Step 2: City with Google Places ----------
function StepCity({ data, update, onNext, mapsLoaded }: StepProps) {
  const [smartCities, setSmartCities] = useState<string[]>(DEFAULT_CITIES);
  const [custom, setCustom] = useState(data.city !== '' && !DEFAULT_CITIES.includes(data.city));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSmartCities(getSmartCities());
  }, []);

  const handlePlaceSelect = useCallback(
    (place: { name: string }) => {
      update({ city: place.name });
      setCustom(true);
    },
    [update],
  );

  useGooglePlacesAutocomplete(
    inputRef,
    { types: ['(cities)'], componentRestrictions: { country: 'it' } },
    handlePlaceSelect,
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <MapPin className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">In quale città cerchi?</h2>
        <p className="text-gray-500 mt-1">
          {mapsLoaded ? 'Inizia a digitare per autocomplete' : 'Scegli tra le più cercate o scrivi la tua'}
        </p>
      </div>

      {/* Google Places input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Scrivi una città..."
          value={custom ? data.city : ''}
          onFocus={() => setCustom(true)}
          onChange={(e) => {
            setCustom(true);
            update({ city: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && data.city.trim() && onNext) onNext();
          }}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-800 transition-colors"
        />
      </div>

      {/* Popular cities grid - sorted by clicks */}
      <div>
        <p className="text-xs text-gray-400 mb-2 text-center">o scegli tra le più cercate</p>
        <div className="grid grid-cols-3 gap-3">
          {smartCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                update({ city });
                setCustom(false);
                setTimeout(() => onNext?.(), 250);
              }}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                data.city === city && !custom
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Step 3: Budget ----------
function StepBudget({ data, update, onNext }: StepProps) {
  const PRESETS = [
    { label: '< €300', min: '', max: '300' },
    { label: '€300 – €500', min: '300', max: '500' },
    { label: '€500 – €700', min: '500', max: '700' },
    { label: '€700 – €1000', min: '700', max: '1000' },
    { label: '€1000+', min: '1000', max: '' },
  ];

  const isPresetSelected = (p: typeof PRESETS[0]) =>
    data.priceMin === p.min && data.priceMax === p.max;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Euro className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Qual è il tuo budget?</h2>
        <p className="text-gray-500 mt-1">Affitto mensile (spese escluse)</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              update({ priceMin: p.min, priceMax: p.max });
              setTimeout(() => onNext?.(), 250);
            }}
            className={`py-4 px-6 rounded-xl border-2 text-left font-medium transition-all ${
              isPresetSelected(p)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Min €</label>
          <input
            type="number"
            placeholder="0"
            value={data.priceMin}
            onChange={(e) => update({ priceMin: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-800"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max €</label>
          <input
            type="number"
            placeholder="Nessun limite"
            value={data.priceMax}
            onChange={(e) => update({ priceMax: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-800"
          />
        </div>
      </div>

      <button
        onClick={() => onNext?.()}
        className="mx-auto flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
      >
        Continua <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- Step 4: Roommate Type — auto-advance ----------
function StepRoommateType({ data, update, onNext }: StepProps) {
  const OPTIONS = [
    { value: 'students', label: 'Studenti', desc: 'Preferisco coinquilini universitari', icon: '🎓' },
    { value: 'workers', label: 'Lavoratori', desc: 'Preferisco coinquilini lavoratori', icon: '💼' },
    { value: 'mix', label: 'Mix / Indifferente', desc: 'Va bene sia studenti che lavoratori', icon: '🤝' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Users className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Tipo di coinquilini</h2>
        <p className="text-gray-500 mt-1">Con chi preferiresti vivere?</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              update({ roommateType: opt.value });
              setTimeout(() => onNext?.(), 250);
            }}
            className={`flex items-center gap-4 py-5 px-6 rounded-xl border-2 text-left transition-all ${
              data.roommateType === opt.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <div>
              <div className="font-semibold text-gray-800">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 5: Gender Preference — auto-advance ----------
function StepGenderPref({ data, update, onNext }: StepProps) {
  const OPTIONS = [
    { value: 'any', label: 'Indifferente', icon: '👥' },
    { value: 'male', label: 'Solo uomini', icon: '👨' },
    { value: 'female', label: 'Solo donne', icon: '👩' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <User className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Preferenza coinquilini</h2>
        <p className="text-gray-500 mt-1">Con chi vorresti condividere casa?</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              update({ genderPref: opt.value });
              setTimeout(() => onNext?.(), 250);
            }}
            className={`flex items-center gap-4 py-5 px-6 rounded-xl border-2 text-left transition-all ${
              data.genderPref === opt.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <span className="font-semibold text-gray-800">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 6: Features ----------
function StepFeatures({ data, update, onNext }: StepProps) {
  const toggle = (key: string) => {
    const next = data.features.includes(key)
      ? data.features.filter((f) => f !== key)
      : [...data.features, key];
    update({ features: next });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Home className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Cosa deve avere la casa?</h2>
        <p className="text-gray-500 mt-1">Seleziona tutto ciò che è importante</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FEATURES_LIST.map((f) => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            className={`flex items-center gap-3 py-4 px-4 rounded-xl border-2 text-left transition-all ${
              data.features.includes(f.key)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-medium text-gray-700">{f.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => onNext?.()}
        className="mx-auto flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
      >
        Continua <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- Step 7: Match Level — auto-advance ----------
function StepMatch({ data, update, onNext }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Sparkles className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Quanto vuoi essere preciso?</h2>
        <p className="text-gray-500 mt-1">Decidi quanti risultati vuoi vedere</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => {
            update({ matchLevel: 'exact' });
            setTimeout(() => onNext?.(), 250);
          }}
          className={`py-6 px-6 rounded-xl border-2 text-left transition-all ${
            data.matchLevel === 'exact'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-gray-800 text-lg">🎯 Solo match perfetti</div>
          <div className="text-sm text-gray-500 mt-1">
            Mostra solo annunci che corrispondono a tutti i tuoi criteri
          </div>
        </button>

        <button
          onClick={() => {
            update({ matchLevel: 'flexible' });
            setTimeout(() => onNext?.(), 250);
          }}
          className={`py-6 px-6 rounded-xl border-2 text-left transition-all ${
            data.matchLevel === 'flexible'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-gray-800 text-lg">🌈 Anche risultati simili</div>
          <div className="text-sm text-gray-500 mt-1">
            Match perfetti in <span className="text-green-600 font-semibold">verde</span>, simili in <span className="text-amber-500 font-semibold">arancione</span> sulla mappa
          </div>
        </button>
      </div>
    </div>
  );
}

// ---------- Step 8: POI — sneaky ask with mandatory toggle ----------
function StepPlaces({ data, update, onNext, mapsLoaded }: StepProps) {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const addressRef = useRef<HTMLInputElement>(null);

  const handlePlaceSelect = useCallback(
    (place: { formatted: string }) => {
      setAddress(place.formatted);
    },
    [],
  );

  useGooglePlacesAutocomplete(
    addressRef,
    { types: ['establishment', 'geocode'], componentRestrictions: { country: 'it' } },
    handlePlaceSelect,
  );

  const addPlace = (isMandatory: boolean) => {
    if (!label.trim() || !address.trim()) return;
    update({
      wantsDistances: true,
      places: [...data.places, { label: label.trim(), address: address.trim(), mandatory: isMandatory }],
    });
    setLabel('');
    setAddress('');
  };

  const toggleMandatory = (idx: number) => {
    const next = data.places.map((p, i) => (i === idx ? { ...p, mandatory: !p.mandatory } : p));
    update({ places: next });
  };

  const removePlace = (idx: number) => {
    const next = data.places.filter((_, i) => i !== idx);
    update({ places: next, wantsDistances: next.length > 0 });
  };

  // If user hasn't opted-in yet, show the "hook" card
  if (!data.wantsDistances && data.places.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-4">
            <Navigation className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Definisci i tuoi luoghi di interesse</h2>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Così possiamo calcolare le distanze da ogni stanza e trovare il <span className="font-semibold text-primary-600">miglior match</span> per te.
          </p>
        </div>

        {/* Example illustration */}
        <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 p-5 overflow-hidden">
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* House icon in center */}
            <rect x="130" y="70" width="60" height="50" rx="6" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2"/>
            <path d="M125 75 L160 50 L195 75" stroke="#0ea5e9" strokeWidth="2" fill="#e0f2fe"/>
            <text x="160" y="102" textAnchor="middle" fontSize="14" fill="#0369a1">🏠</text>

            {/* University — top left */}
            <circle cx="55" cy="40" r="20" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5"/>
            <text x="55" y="46" textAnchor="middle" fontSize="14">🎓</text>
            <line x1="75" y1="48" x2="130" y2="78" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,3"/>
            <text x="95" y="56" textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">12 min</text>

            {/* Work — top right */}
            <circle cx="265" cy="35" r="20" fill="#fefce8" stroke="#eab308" strokeWidth="1.5"/>
            <text x="265" y="41" textAnchor="middle" fontSize="14">💼</text>
            <line x1="245" y1="43" x2="190" y2="78" stroke="#eab308" strokeWidth="2" strokeDasharray="5,3"/>
            <text x="225" y="54" textAnchor="middle" fontSize="9" fill="#ca8a04" fontWeight="600">25 min</text>

            {/* Gym — bottom left */}
            <circle cx="40" cy="165" r="20" fill="#fdf2f8" stroke="#ec4899" strokeWidth="1.5"/>
            <text x="40" y="171" textAnchor="middle" fontSize="14">🏋️</text>
            <line x1="60" y1="157" x2="135" y2="120" stroke="#ec4899" strokeWidth="2" strokeDasharray="5,3"/>
            <text x="88" y="146" textAnchor="middle" fontSize="9" fill="#db2777" fontWeight="600">8 min</text>

            {/* Supermarket — bottom right */}
            <circle cx="280" cy="160" r="20" fill="#faf5ff" stroke="#a855f7" strokeWidth="1.5"/>
            <text x="280" y="166" textAnchor="middle" fontSize="14">🛒</text>
            <line x1="260" y1="152" x2="190" y2="118" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,3"/>
            <text x="232" y="142" textAnchor="middle" fontSize="9" fill="#9333ea" fontWeight="600">5 min</text>
          </svg>
          <p className="text-xs text-gray-400 text-center mt-2">Esempio: distanze calcolate dalla stanza ai tuoi luoghi</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-2">
          <button
            onClick={() => update({ wantsDistances: true })}
            className="py-5 px-6 rounded-xl border-2 border-primary-500 bg-primary-50 text-left transition-all hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-800">Sì, voglio il perfect match!</div>
                <div className="text-sm text-gray-500">Aggiungo i miei punti di interesse</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              update({ wantsDistances: false });
              onNext?.();
            }}
            className="py-4 px-6 rounded-xl border-2 border-gray-200 bg-white text-left transition-all hover:border-gray-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏭️</span>
              <div>
                <div className="font-medium text-gray-600">No grazie, salto</div>
                <div className="text-xs text-gray-400">Potrai sempre aggiungerli dopo</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const QUICK = [
    { label: 'Università', icon: '🎓' },
    { label: 'Lavoro', icon: '💼' },
    { label: 'Palestra', icon: '🏋️' },
    { label: 'Supermercato', icon: '🛒' },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-3">
          <Navigation className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">I tuoi punti d'interesse</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Aggiungi dove vai di solito — per ogni luogo puoi dire se la distanza è <strong>fondamentale</strong> o solo <strong>informativa</strong>
        </p>
      </div>

      {/* Quick label picker */}
      {data.places.length < 2 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK.filter((q) => !data.places.some((p) => p.label === q.label)).map((q) => (
            <button
              key={q.label}
              onClick={() => setLabel(q.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all ${
                label === q.label
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{q.icon}</span> {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-200">
        <input
          type="text"
          placeholder="Che cos'è? (es: Università, Ufficio...)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-800 text-sm"
        />
        <input
          ref={addressRef}
          type="text"
          placeholder={mapsLoaded ? 'Cerca indirizzo o nome...' : 'Indirizzo o nome del luogo'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addPlace(true); }}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-gray-800 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addPlace(true)}
            disabled={!label.trim() || !address.trim()}
            className="py-3 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            🎯 Fondamentale
          </button>
          <button
            onClick={() => addPlace(false)}
            disabled={!label.trim() || !address.trim()}
            className="py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium disabled:bg-gray-100 disabled:text-gray-300 border border-gray-200 transition-colors hover:bg-gray-200"
          >
            ℹ️ Solo informativo
          </button>
        </div>
      </div>

      {/* Added places */}
      {data.places.length > 0 && (
        <div className="space-y-2">
          {data.places.map((p, i) => (
            <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
              p.mandatory ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{p.label}</span>
                  <button
                    onClick={() => toggleMandatory(i)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                      p.mandatory
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p.mandatory ? '🎯 Fondamentale' : 'ℹ️ Informativo'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 truncate">{p.address}</div>
              </div>
              <button onClick={() => removePlace(i)} className="ml-2 text-gray-400 hover:text-red-500 text-xl leading-none">×</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onNext?.()}
        className="mx-auto flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
      >
        Continua <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-xs text-gray-400 text-center">
        <strong>Fondamentale</strong> = la distanza conta per il match &nbsp;·&nbsp; <strong>Informativo</strong> = solo per tua info
      </p>
    </div>
  );
}

// ---------- Step 9: Duration (last) ----------
function StepDuration({ data, update, onNext }: StepProps) {
  const MONTH_OPTIONS = ['3', '6', '9', '12', '18', '24'];

  const getMonthOptions = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
          <Calendar className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Per quanto tempo?</h2>
        <p className="text-gray-500 mt-1">Durata del soggiorno e data di ingresso</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Durata minima (mesi)</label>
        <div className="grid grid-cols-3 gap-3">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => update({ months: data.months === m ? '' : m })}
              className={`py-3 rounded-xl border-2 font-medium transition-all ${
                data.months === m
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {m} mesi
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quando entreresti?</label>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
          {getMonthOptions().map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ moveIn: data.moveIn === opt.value ? '' : opt.value })}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                data.moveIn === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNext?.()}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <Navigation className="w-5 h-5" />
        Cerca sulla mappa
      </button>

      <p className="text-xs text-gray-400 text-center">Entrambi opzionali</p>
    </div>
  );
}
