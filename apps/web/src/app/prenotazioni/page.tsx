'use client';

import { useEffect, useState } from 'react';
import { TenantProfileCard } from '@/components/room/TenantProfileCard';
import {
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import type { Booking, ApiResponse } from '@roommate/shared';

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'In attesa', classes: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confermata', classes: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annullata', classes: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completata', classes: 'bg-blue-100 text-blue-700' },
  NO_SHOW: { label: 'Non presentato', classes: 'bg-gray-100 text-gray-700' },
};

const slotTypeLabels: Record<string, string> = {
  SINGLE: 'Visita singola',
  OPENDAY: 'Open day',
  VIRTUAL: 'Visita virtuale',
};

export default function PrenotazioniPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        // TODO: Replace with session user ID (Phase 1)
        // For now, try to fetch all bookings for the first landlord found
        const res = await fetch('/api/bookings?userId=demo&role=landlord');
        const json: ApiResponse<Booking[]> = await res.json();

        if (json.success && json.data) {
          setBookings(json.data);
        } else {
          // If no auth, show empty state
          setBookings([]);
        }
      } catch (err) {
        setError('Errore nel caricamento delle prenotazioni');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Richieste di prenotazione
        </h1>
        <p className="text-gray-500 mt-1">
          Gestisci le richieste di visita per i tuoi annunci
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nessuna prenotazione</p>
          <p className="text-gray-400 text-sm mt-1">
            Le richieste di visita appariranno qui
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Booking Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {booking.listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.listing.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.slot.date).toLocaleDateString(
                            'it-IT',
                            { weekday: 'short', day: 'numeric', month: 'short' }
                          )}{' '}
                          alle {booking.slot.startTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {slotTypeLabels[booking.slot.type] || booking.slot.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {booking.message && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {booking.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tenant Profile Card */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Profilo inquilino
                  </h4>
                  <TenantProfileCard tenant={booking.tenant} />
                </div>

                {/* Action Buttons */}
                {booking.status === 'PENDING' && (
                  <div className="px-6 pb-6 flex gap-3">
                    <button className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle className="w-5 h-5" />
                      Accetta
                    </button>
                    <button className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-center gap-2 transition-colors">
                      <XCircle className="w-5 h-5" />
                      Rifiuta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
