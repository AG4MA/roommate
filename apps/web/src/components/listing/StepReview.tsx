'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import {
  MapPin, Euro, Bed, Calendar, Ruler,
  Wifi, Sofa, Bath, Sun, Wind, Flame,
  WashingMachine, UtensilsCrossed, Car, TreePine, Fence,
  PawPrint, Cigarette, Heart, Users, Clock,
  Check, X as XIcon
} from 'lucide-react';

interface StepReviewProps {
  data: ListingFormData;
}

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Singola',
  DOUBLE: 'Doppia',
  STUDIO: 'Monolocale',
  ENTIRE_PLACE: 'Intero appartamento',
};

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  furnished: Sofa,
  privateBath: Bath,
  balcony: Sun,
  aircon: Wind,
  heating: Flame,
  washingMachine: WashingMachine,
  dishwasher: UtensilsCrossed,
  parking: Car,
  garden: TreePine,
  terrace: Fence,
};

const featureLabels: Record<string, string> = {
  wifi: 'WiFi',
  furnished: 'Arredata',
  privateBath: 'Bagno privato',
  balcony: 'Balcone',
  aircon: 'Aria condizionata',
  heating: 'Riscaldamento',
  washingMachine: 'Lavatrice',
  dishwasher: 'Lavastoviglie',
  parking: 'Parcheggio',
  garden: 'Giardino',
  terrace: 'Terrazza',
};

const genderLabels: Record<string, string> = {
  MALE: 'Uomo',
  FEMALE: 'Donna',
  OTHER: 'Altro',
};

const occupationLabels: Record<string, string> = {
  STUDENT: 'Studente',
  WORKING: 'Lavoratore',
  FREELANCER: 'Freelancer',
};

export function StepReview({ data }: StepReviewProps) {
  const enabledFeatures = Object.entries(data.features).filter(([, v]) => v);

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Controlla tutti i dettagli prima di pubblicare. Potrai modificarli anche dopo.
      </div>

      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Bed className="w-5 h-5 text-primary-600" />
          Informazioni base
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Titolo</span>
            <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
              {data.title || <span className="text-red-500">Mancante</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Tipo</span>
            <span className="text-sm font-medium text-gray-800">{roomTypeLabels[data.roomType]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dimensione stanza</span>
            <span className="text-sm font-medium text-gray-800">
              {data.roomSize ? `${data.roomSize} m²` : <span className="text-red-500">Mancante</span>}
            </span>
          </div>
          {data.totalSize && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Appartamento totale</span>
              <span className="text-sm font-medium text-gray-800">{data.totalSize} m²</span>
            </div>
          )}
          {data.floor !== null && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Piano</span>
              <span className="text-sm font-medium text-gray-800">
                {data.floor}{data.hasElevator ? ' (con ascensore)' : ''}
              </span>
            </div>
          )}
          {data.description && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500 block mb-1">Descrizione</span>
              <p className="text-sm text-gray-700 whitespace-pre-line">{data.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Euro className="w-5 h-5 text-primary-600" />
          Prezzi
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.price ? `€${data.price}` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Affitto/mese</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.expenses ? `€${data.expenses}` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Spese</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.deposit ? `€${data.deposit}` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Deposito</p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Posizione
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Indirizzo</span>
            <span className="text-sm font-medium text-gray-800 text-right">
              {data.address || <span className="text-red-500">Mancante</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Città</span>
            <span className="text-sm font-medium text-gray-800">{data.city}</span>
          </div>
          {data.neighborhood && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Quartiere</span>
              <span className="text-sm font-medium text-gray-800">{data.neighborhood}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Coordinate</span>
            <span className="text-sm font-medium text-gray-800">
              {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Caratteristiche</h3>
        {enabledFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {enabledFeatures.map(([key]) => {
              const Icon = featureIcons[key];
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {featureLabels[key] || key}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nessuna caratteristica selezionata</p>
        )}
      </section>

      {/* Rules */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Regole</h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          {[
            { key: 'petsAllowed', label: 'Animali ammessi', icon: PawPrint },
            { key: 'smokingAllowed', label: 'Fumo permesso', icon: Cigarette },
            { key: 'couplesAllowed', label: 'Coppie ammesse', icon: Heart },
            { key: 'guestsAllowed', label: 'Ospiti ammessi', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {data.rules[key as keyof typeof data.rules] ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <XIcon className="w-4 h-4 text-red-400" />
              )}
            </div>
          ))}
          {data.rules.quietHoursStart && data.rules.quietHoursEnd && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Ore di silenzio
              </span>
              <span className="text-sm font-medium text-gray-800">
                {data.rules.quietHoursStart} – {data.rules.quietHoursEnd}
              </span>
            </div>
          )}
          {data.rules.cleaningSchedule && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Pulizie</span>
              <span className="text-sm font-medium text-gray-800">{data.rules.cleaningSchedule}</span>
            </div>
          )}
        </div>
      </section>

      {/* Availability */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Disponibilità
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Disponibile dal</span>
            <span className="text-sm font-medium text-gray-800">
              {data.availableFrom
                ? new Date(data.availableFrom).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : <span className="text-red-500">Mancante</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Permanenza minima</span>
            <span className="text-sm font-medium text-gray-800">{data.minStay} mesi</span>
          </div>
          {data.maxStay && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Permanenza massima</span>
              <span className="text-sm font-medium text-gray-800">{data.maxStay} mesi</span>
            </div>
          )}
        </div>
      </section>

      {/* Preferences */}
      {(data.preferences.gender || data.preferences.ageMin || data.preferences.occupation.length > 0 || data.preferences.languages.length > 0) && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary-600" />
            Preferenze inquilino
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {data.preferences.gender && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Genere</span>
                <span className="text-sm font-medium text-gray-800">
                  {genderLabels[data.preferences.gender]}
                </span>
              </div>
            )}
            {(data.preferences.ageMin || data.preferences.ageMax) && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Età</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.preferences.ageMin || '18'} – {data.preferences.ageMax || '99'} anni
                </span>
              </div>
            )}
            {data.preferences.occupation.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Occupazione</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.preferences.occupation.map((o) => occupationLabels[o] || o).join(', ')}
                </span>
              </div>
            )}
            {data.preferences.languages.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Lingue</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.preferences.languages.join(', ')}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Media */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Media</h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            {data.images.length} {data.images.length === 1 ? 'foto caricata' : 'foto caricate'}
            {data.videoUrl && ' + video tour'}
          </p>
          {data.images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {data.images.slice(0, 5).map((img, idx) => (
                <div key={idx} className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {data.images.length > 5 && (
                <div className="w-20 h-16 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-sm text-gray-500 font-medium">+{data.images.length - 5}</span>
                </div>
              )}
            </div>
          )}
          {data.images.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">
              Consigliamo di caricare almeno 3 foto per attirare più interessati.
            </p>
          )}
        </div>
      </section>

      {/* Roommates */}
      {data.roommates.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Coinquilini attuali</h3>
          <div className="space-y-2">
            {data.roommates.map((rm, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-sm">
                    {rm.name ? rm.name[0].toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {rm.name || 'Senza nome'}
                    {rm.age ? `, ${rm.age} anni` : ''}
                  </p>
                  {rm.occupation && (
                    <p className="text-xs text-gray-500">{rm.occupation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
