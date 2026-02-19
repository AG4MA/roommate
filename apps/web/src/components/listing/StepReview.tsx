'use client';

import type { ListingFormData } from '@/app/pubblica/page';
import {
  MapPin, Euro, Bed, Calendar, Ruler, FileText,
  Wifi, Sofa, Bath, Sun, Wind, Flame,
  WashingMachine, UtensilsCrossed, Car, TreePine, Fence,
  PawPrint, Cigarette, Heart, Users, Clock,
  Check, X as XIcon, Zap, Droplets, Building2, Sparkles
} from 'lucide-react';

interface StepReviewProps {
  data: ListingFormData;
}

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi, furnished: Sofa, privateBath: Bath, balcony: Sun, aircon: Wind,
  heating: Flame, washingMachine: WashingMachine, dishwasher: UtensilsCrossed,
  parking: Car, garden: TreePine, terrace: Fence,
};

const featureLabels: Record<string, string> = {
  wifi: 'WiFi', furnished: 'Arredata', privateBath: 'Bagno privato', balcony: 'Balcone',
  aircon: 'Aria condizionata', heating: 'Riscaldamento', washingMachine: 'Lavatrice',
  dishwasher: 'Lavastoviglie', parking: 'Parcheggio', garden: 'Giardino', terrace: 'Terrazza',
};

const genderLabels: Record<string, string> = {
  MALE: 'Uomo',
  FEMALE: 'Donna',
};

const occupationLabels: Record<string, string> = {
  ANY: 'Indifferente',
  STUDENT: 'Studente',
  WORKING: 'Lavoratore',
};

const contractTypeLabels: Record<string, string> = {
  transitorio: 'Transitorio',
  studenti: 'Studenti',
  '4+4': '4+4 (Canone libero)',
  '3+2': '3+2 (Canone concordato)',
  uso_foresteria: 'Uso foresteria',
  comodato: 'Comodato d\'uso',
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
            <span className="text-sm font-medium text-gray-800">Stanza singola</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dimensione stanza</span>
            <span className="text-sm font-medium text-gray-800">
              {data.roomSize ? `${data.roomSize} m\u00B2` : <span className="text-red-500">Mancante</span>}
            </span>
          </div>
          {data.totalSize && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Appartamento totale</span>
              <span className="text-sm font-medium text-gray-800">{data.totalSize} m&sup2;</span>
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
          {data.totalRooms && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Stanze totali</span>
              <span className="text-sm font-medium text-gray-800">{data.totalRooms}</span>
            </div>
          )}
          {data.bathrooms && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Bagni</span>
              <span className="text-sm font-medium text-gray-800">{data.bathrooms}</span>
            </div>
          )}
          {data.specialAreas.length > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Aree comuni</span>
              <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
                {data.specialAreas.join(', ')}
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
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.price ? `\u20AC${data.price}` : '\u2014'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Affitto/mese</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.expenses ? `\u20AC${data.expenses}` : '\u2014'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Spese</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {data.deposit ? `\u20AC${data.deposit}` : '\u2014'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Deposito</p>
          </div>
        </div>

        {data.pricing.allInclusive ? (
          <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Tutto incluso &mdash; spese comprese nell&apos;affitto</span>
          </div>
        ) : (
          (data.pricing.electricityGas || data.pricing.water || data.pricing.heatingCost || data.pricing.condominiumFees) ? (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dettaglio spese stimate</p>
              {data.pricing.electricityGas ? (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500"><Zap className="w-3 h-3" /> Luce/Gas</span>
                  <span className="font-medium text-gray-800">&euro;{data.pricing.electricityGas}/mese</span>
                </div>
              ) : null}
              {data.pricing.water ? (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500"><Droplets className="w-3 h-3" /> Acqua</span>
                  <span className="font-medium text-gray-800">&euro;{data.pricing.water}/mese</span>
                </div>
              ) : null}
              {data.pricing.heatingCost ? (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500"><Flame className="w-3 h-3" /> Riscaldamento</span>
                  <span className="font-medium text-gray-800">&euro;{data.pricing.heatingCost}/mese</span>
                </div>
              ) : null}
              {data.pricing.condominiumFees ? (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500"><Building2 className="w-3 h-3" /> Condominio</span>
                  <span className="font-medium text-gray-800">&euro;{data.pricing.condominiumFees}/mese</span>
                </div>
              ) : null}
            </div>
          ) : null
        )}

        {data.pricing.expenseNotes && (
          <p className="text-sm text-gray-500 mt-2 italic">{data.pricing.expenseNotes}</p>
        )}

        {data.pricing.cleaningIncluded && (
          <div className="bg-gray-50 rounded-xl p-3 mt-2 text-sm text-gray-600">
            <span className="font-medium">Pulizia inclusa</span>
            {data.pricing.cleaningFrequency && (
              <span> &mdash; {data.pricing.cleaningFrequency === 'weekly' ? 'settimanale' : data.pricing.cleaningFrequency === 'biweekly' ? 'ogni 2 sett.' : 'mensile'}</span>
            )}
            {data.pricing.cleaningArea && (
              <span> ({data.pricing.cleaningArea === 'common' ? 'aree comuni' : 'tutto'})</span>
            )}
          </div>
        )}
      </section>

      {/* Contract */}
      {(data.contract.type || data.contract.startDate) && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Contratto
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {data.contract.type && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tipo</span>
                <span className="text-sm font-medium text-gray-800">
                  {contractTypeLabels[data.contract.type] || data.contract.type}
                </span>
              </div>
            )}
            {data.contract.startDate && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Inizio</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(data.contract.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {data.contract.endDate && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Fine</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(data.contract.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {data.contract.minDuration && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Durata minima</span>
                <span className="text-sm font-medium text-gray-800">{data.contract.minDuration} mesi</span>
              </div>
            )}
            {data.contract.maxDuration && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Durata massima</span>
                <span className="text-sm font-medium text-gray-800">{data.contract.maxDuration} mesi</span>
              </div>
            )}
            {data.contract.renewalPossible !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Rinnovabile</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.contract.renewalPossible ? 'S\u00EC' : 'No'}
                </span>
              </div>
            )}
            {data.contract.renewalConditions && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Condizioni rinnovo</span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
                  {data.contract.renewalConditions}
                </span>
              </div>
            )}
            {data.contract.residenceAllowed !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Residenza</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.contract.residenceAllowed ? 'Possibile' : 'Non possibile'}
                </span>
              </div>
            )}
            {data.contract.domicileAllowed !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Domicilio</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.contract.domicileAllowed ? 'Possibile' : 'Non possibile'}
                </span>
              </div>
            )}
            {data.contract.outOfTownOnly && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Solo fuori sede</span>
                <span className="text-sm font-medium text-gray-800">S&igrave;</span>
              </div>
            )}
          </div>
        </section>
      )}

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
            <span className="text-sm text-gray-500">Citt&agrave;</span>
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
          {data.rules.quietHoursEnabled && data.rules.quietHoursStart && data.rules.quietHoursEnd && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Ore di silenzio
              </span>
              <span className="text-sm font-medium text-gray-800">
                {data.rules.quietHoursStart} &ndash; {data.rules.quietHoursEnd}
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
          Disponibilit&agrave;
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
      {(data.preferences.gender || data.preferences.ageMin || data.preferences.occupation.length > 0) && (
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
                  {genderLabels[data.preferences.gender] || data.preferences.gender}
                </span>
              </div>
            )}
            {(data.preferences.ageMin || data.preferences.ageMax) && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Et&agrave;</span>
                <span className="text-sm font-medium text-gray-800">
                  {data.preferences.ageMin || '18'} &ndash; {data.preferences.ageMax || '99'} anni
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
          </div>
        </section>
      )}

      {/* Contact preference */}
      {data.contactPreference && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Contatto preferito</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-sm font-medium text-gray-800">
              {data.contactPreference === 'email' ? 'Email' : data.contactPreference === 'phone' ? 'Telefono' : 'App rooMate'}
            </span>
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
            <p className="text-sm text-red-500 mt-1 font-medium">
              Nessuna foto caricata &mdash; obbligatorio caricare almeno una foto per pubblicare.
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
                    {rm.gender ? ` \u2014 ${genderLabels[rm.gender] || rm.gender}` : ''}
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
