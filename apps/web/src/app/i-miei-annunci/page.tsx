'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Eye, MapPin, Euro, Calendar, Loader2,
  MoreVertical, Pencil, Trash2, Pause, Play, AlertCircle,
  X, Lightbulb, BookOpen, Video, ArrowRight, Users
} from 'lucide-react';
import { AppointmentQueue } from '@/components/listing/AppointmentQueue';

interface MyListing {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: string;
  views: number;
  roomType: string;
  availableFrom: string;
  publishedAt: string | null;
  expiresAt: string | null;
  images: { url: string }[];
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Bozza', color: 'bg-gray-100 text-gray-600' },
  ACTIVE: { label: 'Attivo', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'In pausa', color: 'bg-yellow-100 text-yellow-700' },
  RENTED: { label: 'Affittato', color: 'bg-blue-100 text-blue-700' },
  ARCHIVED: { label: 'Archiviato', color: 'bg-gray-100 text-gray-500' },
  EXPIRED: { label: 'Scaduto', color: 'bg-red-100 text-red-600' },
  QUEUE_FULL: { label: 'Coda piena', color: 'bg-amber-100 text-amber-700' },
};

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Singola',
  DOUBLE: 'Doppia',
  STUDIO: 'Monolocale',
  ENTIRE_PLACE: 'Intero',
};

// ── First-time onboarding helper ──

function OnboardingHelper({ onDismiss }: { onDismiss: () => void }) {
  const tips = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Crea il tuo primo annuncio',
      desc: 'Pubblica una stanza in pochi minuti. Ti guidiamo passo passo.',
      cta: { label: 'Pubblica ora', href: '/pubblica' },
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Leggi le FAQ',
      desc: 'Domande frequenti su prezzi, visibilità e gestione degli annunci.',
      cta: { label: 'Vai alle FAQ', href: '#' },
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video tutorial',
      desc: 'Guarda come i migliori proprietari ottimizzano i loro annunci.',
      cta: { label: 'Guarda i video', href: '#' },
    },
  ];

  return (
    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 relative">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Chiudi guida"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-lg font-bold text-gray-800 mb-1">Benvenuto nella tua dashboard!</h2>
      <p className="text-sm text-gray-600 mb-5">
        Ecco alcuni suggerimenti per iniziare al meglio su rooMate.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
              {tip.icon}
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{tip.title}</h3>
            <p className="text-xs text-gray-500 mb-3 flex-1">{tip.desc}</p>
            <Link
              href={tip.cta.href}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              {tip.cta.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for first-time visitors
    try {
      const dismissed = localStorage.getItem('roommate_dashboard_onboarding_dismissed');
      if (!dismissed) {
        setShowOnboarding(true);
      }
    } catch { /* ignore */ }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem('roommate_dashboard_onboarding_dismissed', '1');
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session.user.role !== 'landlord') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      fetchListings();
    }
  }, [status, session, router]);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings?mine=true');
      const json = await res.json();
      if (json.success) {
        setListings(json.data.items || json.data || []);
      } else {
        setError(json.error || 'Errore durante il caricamento');
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    setMenuOpen(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      // Silently fail for status updates
    }
  };

  const handleDelete = async (listingId: string) => {
    setMenuOpen(null);
    if (!confirm('Sei sicuro di voler eliminare questo annuncio? L\'azione è irreversibile.')) {
      return;
    }

    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
      }
    } catch {
      // Silently fail
    }
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">I miei annunci</h1>
          <p className="text-gray-500 mt-1">{listings.length} annunci totali</p>
        </div>
        <Link
          href="/pubblica"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuovo annuncio
        </Link>
      </div>

      {/* First-time onboarding helper */}
      {showOnboarding && <OnboardingHelper onDismiss={dismissOnboarding} />}

      {error && (
        <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Listing cards */}
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Nessun annuncio</h2>
          <p className="text-gray-500 mb-6">Pubblica il tuo primo annuncio per trovare il coinquilino ideale.</p>
          <Link
            href="/pubblica"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Pubblica annuncio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const daysUntilExpiry = getDaysUntilExpiry(listing.expiresAt);
            const expiryWarning = daysUntilExpiry !== null && daysUntilExpiry <= 5 && daysUntilExpiry > 0;
            const statusInfo = statusLabels[listing.status] || statusLabels.DRAFT;

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-48 h-36 shrink-0 bg-gray-100">
                    {listing.images.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {roomTypeLabels[listing.roomType] || listing.roomType}
                          </span>
                          {expiryWarning && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              Scade tra {daysUntilExpiry} giorni
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/stanza/${listing.id}`}
                          className="text-lg font-semibold text-gray-800 hover:text-primary-600 truncate block"
                        >
                          {listing.title || 'Senza titolo'}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {listing.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="w-3.5 h-3.5" />
                            {listing.price}/mese
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {listing.views} visite
                          </span>
                          {listing.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(listing.publishedAt).toLocaleDateString('it-IT')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions menu */}
                      <div className="relative ml-4">
                        <button
                          onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {menuOpen === listing.id && (
                          <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                            <Link
                              href={`/stanza/${listing.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              Visualizza
                            </Link>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                // TODO: implement edit page
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Pencil className="w-4 h-4" />
                              Modifica
                            </button>
                            {listing.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusChange(listing.id, 'PAUSED')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                              >
                                <Pause className="w-4 h-4" />
                                Metti in pausa
                              </button>
                            )}
                            {listing.status === 'PAUSED' && (
                              <button
                                onClick={() => handleStatusChange(listing.id, 'ACTIVE')}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                              >
                                <Play className="w-4 h-4" />
                                Riattiva
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" />
                              Elimina
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Queue per listing */}
      {listings.filter(l => ['ACTIVE', 'QUEUE_FULL'].includes(l.status)).length > 0 && (
        <section className="mt-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Candidati in coda</h2>
              <p className="text-sm text-gray-500">Max 3 interessati per annuncio. Gestiscili per far avanzare la coda.</p>
            </div>
          </div>
          {listings
            .filter(l => ['ACTIVE', 'QUEUE_FULL'].includes(l.status))
            .map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {listing.images[0] ? (
                      <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-4 h-4 m-2 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm">{listing.title || 'Senza titolo'}</p>
                    <p className="text-xs text-gray-500">{listing.city} · €{listing.price}/mese</p>
                  </div>
                </div>
                <AppointmentQueue listingId={listing.id} onStatusChange={fetchListings} />
              </div>
            ))
          }
        </section>
      )}
    </div>
  );
}
