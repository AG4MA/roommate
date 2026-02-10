'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, MessageCircle, CheckCircle } from 'lucide-react';

interface Slot {
  date: string;
  time: string;
  type: 'single' | 'openday';
}

interface Landlord {
  id: string;
  name: string;
  responseTime: string;
  responseRate: number;
  verified: boolean;
}

interface BookingWidgetProps {
  room: {
    price: number;
    expenses: number;
    deposit: number;
    virtualTourUrl: string | null;
  };
  availableSlots: Slot[];
  landlord: Landlord;
}

export function BookingWidget({ room, availableSlots, landlord }: BookingWidgetProps) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBooking = () => {
    if (selectedSlot) {
      setShowConfirmation(true);
      // In produzione, chiamerebbe l'API per creare la prenotazione
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Price Header */}
      <div className="bg-primary-600 text-white p-6">
        <p className="text-3xl font-bold">€{room.price}<span className="text-lg font-normal">/mese</span></p>
        <p className="text-primary-100 text-sm mt-1">
          + €{room.expenses} spese | Deposito €{room.deposit}
        </p>
      </div>

      <div className="p-6">
        {!showConfirmation ? (
          <>
            {/* Landlord Info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-500">
                  {landlord.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{landlord.name}</p>
                  {landlord.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Risponde in {landlord.responseTime} • {landlord.responseRate}% risposta
                </p>
              </div>
            </div>

            {/* Booking Type Selection */}
            <h3 className="font-semibold text-gray-800 mb-4">Prenota una visita</h3>
            
            {/* Available Slots */}
            <div className="space-y-2 mb-6">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedSlot === slot
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    slot.type === 'openday' ? 'bg-accent-100' : 'bg-primary-100'
                  }`}>
                    <Calendar className={`w-5 h-5 ${
                      slot.type === 'openday' ? 'text-accent-600' : 'text-primary-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">
                      {new Date(slot.date).toLocaleDateString('it-IT', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.time}
                      {slot.type === 'openday' && (
                        <span className="ml-2 px-2 py-0.5 bg-accent-100 text-accent-700 rounded-full text-xs">
                          Open Day
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedSlot === slot
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedSlot === slot && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Virtual Tour Button */}
            {room.virtualTourUrl && (
              <button className="w-full flex items-center justify-center gap-2 p-3 mb-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Video className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-800">Tour Virtuale</span>
              </button>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                selectedSlot
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedSlot ? 'Prenota Visita' : 'Seleziona uno slot'}
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
              Contatta il proprietario
            </button>
          </>
        ) : (
          /* Confirmation */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Prenotazione inviata!</h3>
            <p className="text-gray-600 mb-4">
              La tua richiesta di visita per il{' '}
              <strong>
                {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('it-IT')} alle {selectedSlot?.time}
              </strong>
              {' '}è stata inviata a {landlord.name}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Riceverai una email di conferma appena il proprietario accetterà.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-primary-600 font-medium hover:underline"
            >
              Torna all'annuncio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
