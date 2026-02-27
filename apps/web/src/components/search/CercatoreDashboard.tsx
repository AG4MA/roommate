'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Heart,
  CalendarCheck,
  Clock,
  CheckCircle,
  Euro,
  MapPin,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';
import type { ApiResponse } from '@roommate/shared';

interface DashboardInterest {
  id: string;
  status: 'ACTIVE' | 'WAITING';
  position: number;
  schedulingApproved: boolean;
  listing: {
    id: string;
    title: string;
    city: string;
    price: number;
    roomType: string;
    thumbnailUrl: string | null;
    status: string;
  };
}

interface DashboardBooking {
  id: string;
  status: string;
  message: string | null;
  listing: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
}

interface CercatoreDashboard {
  interests: {
    items: DashboardInterest[];
    activeCount: number;
    waitingCount: number;
    totalCount: number;
    maxAllowed: number;
  };
  appointments: {
    items: DashboardBooking[];
    pendingCount: number;
    confirmedCount: number;
  };
}

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Singola',
  DOUBLE: 'Doppia',
  STUDIO: 'Monolocale',
};

const slotTypeLabels: Record<string, string> = {
  SINGLE: 'Visita singola',
  OPENDAY: 'Open day',
  VIRTUAL: 'Visita virtuale',
};

export function CercatoreDashboard() {
  const { data: session, status: authStatus } = useSession();
  const [dashboard, setDashboard] = useState<CercatoreDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/interests/dashboard');
        const json: ApiResponse<CercatoreDashboard> = await res.json();
        if (json.success && json.data) {
          setDashboard(json.data);
        }
      } catch {
        // Silently fail — dashboard is supplementary
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [authStatus]);

  // Don't render if not logged in or no data
  if (authStatus !== 'authenticated' || loading) return null;
  if (!dashboard) return null;

  const { interests, appointments } = dashboard;
  const hasContent = interests.totalCount > 0 || appointments.items.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Header with collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-700">La tua dashboard</h2>
            <div className="flex items-center gap-3 text-xs">
              {interests.totalCount > 0 && (
                <span className="flex items-center gap-1 text-primary-600 font-medium">
                  <Heart className="w-3.5 h-3.5" />
                  {interests.totalCount}/{interests.maxAllowed} interessi
                </span>
              )}
              {appointments.items.length > 0 && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  {appointments.items.length} appuntament{appointments.items.length === 1 ? 'o' : 'i'}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {collapsed ? 'Espandi ▼' : 'Riduci ▲'}
          </span>
        </button>

        {!collapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Interests Section */}
            {interests.totalCount > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-primary-500" />
                    I tuoi interessi ({interests.totalCount}/{interests.maxAllowed})
                  </h3>
                  <Link
                    href="/mi-interessa"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    Vedi tutti <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {interests.items.slice(0, 3).map((interest) => (
                    <Link
                      key={interest.id}
                      href={`/stanza/${interest.listing.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                        {interest.listing.thumbnailUrl ? (
                          <img
                            src={interest.listing.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                          {interest.listing.title}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Euro className="w-3 h-3" />
                          {interest.listing.price}/mese · {roomTypeLabels[interest.listing.roomType] || interest.listing.roomType}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        {interest.status === 'ACTIVE' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Attivo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" />
                            #{interest.position}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}

                  {interests.totalCount > 3 && (
                    <Link
                      href="/mi-interessa"
                      className="block text-center text-xs text-gray-400 hover:text-primary-600 py-1"
                    >
                      +{interests.totalCount - 3} altr{interests.totalCount - 3 === 1 ? 'o' : 'i'}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Appointments Section */}
            {appointments.items.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-blue-500" />
                    I tuoi appuntamenti
                    {appointments.confirmedCount > 0 && (
                      <span className="text-xs font-normal text-green-600">
                        ({appointments.confirmedCount} confermat{appointments.confirmedCount === 1 ? 'o' : 'i'})
                      </span>
                    )}
                  </h3>
                  <Link
                    href="/appuntamenti"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    Vedi tutti <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {appointments.items.slice(0, 3).map((booking) => {
                    const dateObj = new Date(booking.slot.date + 'T00:00:00');
                    const dayStr = dateObj.toLocaleDateString('it-IT', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    });

                    return (
                      <Link
                        key={booking.id}
                        href={`/stanza/${booking.listing.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        {/* Date badge */}
                        <div className="w-10 h-10 rounded-lg bg-blue-50 shrink-0 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-blue-700 leading-none">
                            {dateObj.getDate()}
                          </span>
                          <span className="text-[10px] text-blue-500 uppercase leading-none mt-0.5">
                            {dateObj.toLocaleDateString('it-IT', { month: 'short' })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                            {booking.listing.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.slot.startTime} · {slotTypeLabels[booking.slot.type] || booking.slot.type}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="shrink-0">
                          {booking.status === 'CONFIRMED' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              Confermato
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <Clock className="w-3 h-3" />
                              In attesa
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}

                  {appointments.items.length > 3 && (
                    <Link
                      href="/appuntamenti"
                      className="block text-center text-xs text-gray-400 hover:text-primary-600 py-1"
                    >
                      +{appointments.items.length - 3} altr{appointments.items.length - 3 === 1 ? 'o' : 'i'}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
