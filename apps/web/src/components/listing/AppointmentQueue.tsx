'use client';

import { useState } from 'react';
import {
  Users, Clock, CheckCircle, XCircle, MessageCircle,
  ChevronDown, ChevronUp, Eye, UserCheck, FileText, Bell
} from 'lucide-react';

// ── Appointment Queue ──
// Landlords see max 4 interested tenants at a time.
// They can accept, reject, or request more details from each.
// This prevents being inundated with messages; the system manages the queue.

interface QueuedTenant {
  id: string;
  name: string;
  avatar?: string;
  age: number;
  occupation: string;
  gender: 'M' | 'F' | 'O';
  requestedAt: string;       // ISO date
  message?: string;          // optional intro message
  matchScore: number;        // 0-100 based on listing preferences
  status: 'waiting' | 'accepted' | 'rejected' | 'info-requested';
}

interface AppointmentQueueProps {
  listingId: string;
  listingTitle: string;
  /** The batch of up to 4 tenants currently shown */
  tenants: QueuedTenant[];
  /** Total number of people in queue */
  totalInQueue: number;
  onAction: (tenantId: string, action: 'accept' | 'reject' | 'request-info') => void;
}

// Demo data for the UI
const DEMO_TENANTS: QueuedTenant[] = [
  {
    id: '1',
    name: 'Marco B.',
    age: 24,
    occupation: 'Studente',
    gender: 'M',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: 'Ciao! Sono molto interessato alla stanza, studio Ingegneria al Polimi e cerco qualcosa vicino all\'università.',
    matchScore: 92,
    status: 'waiting',
  },
  {
    id: '2',
    name: 'Giulia R.',
    age: 27,
    occupation: 'Lavoratrice',
    gender: 'F',
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    message: 'Buongiorno, lavoro come designer e cerco un appartamento tranquillo.',
    matchScore: 85,
    status: 'waiting',
  },
  {
    id: '3',
    name: 'Alessandro T.',
    age: 22,
    occupation: 'Studente',
    gender: 'M',
    requestedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    matchScore: 78,
    status: 'waiting',
  },
  {
    id: '4',
    name: 'Sara M.',
    age: 29,
    occupation: 'Lavoratrice',
    gender: 'F',
    requestedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    message: 'Cerco stanza per trasferimento lavorativo a Milano, sono molto ordinata e rispettosa.',
    matchScore: 71,
    status: 'waiting',
  },
];

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'meno di 1 ora fa';
  if (hours === 1) return '1 ora fa';
  if (hours < 24) return `${hours} ore fa`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 giorno fa' : `${days} giorni fa`;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-100 text-emerald-700'
    : score >= 60 ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-600';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}% match
    </span>
  );
}

export function AppointmentQueue({
  listingTitle,
  tenants: initialTenants,
  totalInQueue,
  onAction,
}: AppointmentQueueProps) {
  const [tenants, setTenants] = useState(initialTenants);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAction = (tenantId: string, action: 'accept' | 'reject' | 'request-info') => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'info-requested' }
          : t
      )
    );
    onAction(tenantId, action);
  };

  const waitingCount = tenants.filter((t) => t.status === 'waiting').length;
  const remainingInQueue = totalInQueue - tenants.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Coda appuntamenti</h3>
            <p className="text-xs text-gray-500">{listingTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
            {waitingCount} in attesa
          </span>
          {remainingInQueue > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
              +{remainingInQueue} in coda
            </span>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 text-xs text-primary-800 flex items-center gap-2">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>rooMate gestisce la coda per te: vedi max 4 candidati alla volta. Gestiscili per far avanzare i prossimi.</span>
      </div>

      {/* Tenant cards */}
      <div className="divide-y divide-gray-100">
        {tenants.map((tenant) => {
          const isExpanded = expandedId === tenant.id;
          const statusColor =
            tenant.status === 'accepted' ? 'text-emerald-600 bg-emerald-50'
            : tenant.status === 'rejected' ? 'text-red-500 bg-red-50'
            : tenant.status === 'info-requested' ? 'text-amber-600 bg-amber-50'
            : '';

          return (
            <div key={tenant.id} className={`${tenant.status !== 'waiting' ? 'opacity-60' : ''}`}>
              {/* Collapsed row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : tenant.id)}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-gray-500 text-sm">{tenant.name.charAt(0)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{tenant.name}</span>
                    <ScoreBadge score={tenant.matchScore} />
                    {tenant.status !== 'waiting' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {tenant.status === 'accepted' ? 'Accettato' :
                         tenant.status === 'rejected' ? 'Escluso' : 'Info richieste'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tenant.age} anni • {tenant.occupation} • <Clock className="w-3 h-3 inline" /> {timeAgo(tenant.requestedAt)}
                  </p>
                </div>

                {/* Expand icon */}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1">
                  {tenant.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">&ldquo;{tenant.message}&rdquo;</p>
                    </div>
                  )}

                  {tenant.status === 'waiting' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(tenant.id, 'accept')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Accetta visita
                      </button>
                      <button
                        onClick={() => handleAction(tenant.id, 'request-info')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Richiedi più info
                      </button>
                      <button
                        onClick={() => handleAction(tenant.id, 'reject')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Escludi
                      </button>
                    </div>
                  )}

                  {tenant.status === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Invia messaggio
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                        Vedi profilo completo
                      </button>
                    </div>
                  )}

                  {tenant.status === 'info-requested' && (
                    <p className="text-sm text-amber-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      In attesa di risposta dal candidato…
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {remainingInQueue > 0 && (
        <div className="px-5 py-3 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Gestisci i candidati attuali per sbloccare i prossimi <strong>{Math.min(4, remainingInQueue)}</strong> in coda.
          </p>
        </div>
      )}
    </div>
  );
}

/** Standalone demo with sample data */
export function AppointmentQueueDemo() {
  return (
    <AppointmentQueue
      listingId="demo"
      listingTitle="Stanza singola — Navigli"
      tenants={DEMO_TENANTS}
      totalInQueue={12}
      onAction={(id, action) => console.log('Queue action:', id, action)}
    />
  );
}
