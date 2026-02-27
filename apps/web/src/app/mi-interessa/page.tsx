'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  MapPin,
  Euro,
  Loader2,
  Clock,
  Users,
  CheckCircle,
  CalendarCheck,
  XCircle,
  Eye,
} from 'lucide-react';
import type { ApiResponse } from '@roommate/shared';

interface InterestItem {
  id: string;
  status: 'ACTIVE' | 'WAITING';
  position: number;
  score: number;
  schedulingApproved: boolean;
  createdAt: string;
  group: { id: string; name: string } | null;
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
    neighborhood: string | null;
    price: number;
    expenses: number;
    roomType: string;
    roomSize: number;
    availableFrom: string | null;
    images: { url: string }[];
    status: string;
  };
}

const statusLabels: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  ACTIVE: {
    label: 'Attivo',
    classes: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  WAITING: {
    label: 'In attesa',
    classes: 'bg-amber-100 text-amber-700',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Singola',
  DOUBLE: 'Doppia',
  STUDIO: 'Monolocale',
};

export default function MiInteressaPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (authStatus === 'authenticated') {
      fetchInterests();
    }
  }, [authStatus, router]);

  const fetchInterests = async () => {
    try {
      const res = await fetch('/api/interests');
      const json: ApiResponse<InterestItem[]> = await res.json();
      if (json.success && json.data) {
        setInterests(json.data);
      } else {
        setInterests([]);
      }
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Sei sicuro di voler ritirare il tuo interesse? Non potrai re-esprimerlo per 24 ore.')) {
      return;
    }

    setWithdrawing(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setInterests((prev) => prev.filter((i) => i.listing.id !== listingId));
      } else {
        alert(json.error || 'Errore nel ritiro dell\'interesse');
      }
    } catch {
      alert('Errore di rete');
    }
    setWithdrawing(null);
  };

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
          Mi interessa
        </h1>
        <p className="text-gray-500 mt-1">
          Le stanze a cui hai espresso interesse ({interests.length}/8)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {interests.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nessun interesse espresso</p>
          <p className="text-gray-400 text-sm mt-1">
            Quando esprimi interesse per una stanza, apparirà qui
          </p>
          <Link
            href="/cerca"
            className="inline-block mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
          >
            Cerca stanze
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map((interest) => {
            const listing = interest.listing;
            const statusInfo = statusLabels[interest.status] || statusLabels.ACTIVE;
            const image = listing.images[0]?.url;

            return (
              <Link
                key={interest.id}
                href={`/stanza/${listing.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-40 h-40 shrink-0 bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {listing.title}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusInfo.classes}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {listing.address}, {listing.city}
                      </p>

                      {interest.group && (
                        <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Candidatura con: {interest.group.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-primary-600">
                          <Euro className="w-4 h-4" />
                          {listing.price}/mese
                        </span>
                        <span className="text-gray-400">
                          {roomTypeLabels[listing.roomType] || listing.roomType} · {listing.roomSize}m²
                        </span>
                      </div>

                      {interest.schedulingApproved && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Visita approvata
                        </span>
                      )}

                      {interest.status === 'WAITING' && (
                        <span className="text-xs text-gray-400">
                          Posizione: {interest.position}
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Link
                        href={`/stanza/${listing.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Dettaglio
                      </Link>
                      {interest.schedulingApproved && (
                        <Link
                          href={`/booking/${listing.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Prenota visita
                        </Link>
                      )}
                      <button
                        onClick={(e) => handleWithdraw(listing.id, e)}
                        disabled={withdrawing === listing.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-auto"
                      >
                        {withdrawing === listing.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Ritira
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
