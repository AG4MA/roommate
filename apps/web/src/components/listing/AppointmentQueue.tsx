'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserCircle, X, MessageCircle, CalendarCheck, CalendarDays,
  ShieldCheck, FileText, Briefcase, GraduationCap, Users as UsersIcon,
  CreditCard, ChevronDown, ChevronUp, Loader2,
  CheckCircle, Clock,
} from 'lucide-react';

const CERT_LABELS: Record<string, { label: string; icon: typeof Briefcase }> = {
  EMPLOYMENT_CONTRACT: { label: 'Contratto di lavoro', icon: Briefcase },
  INCOME_PROOF: { label: 'Prova reddito', icon: FileText },
  STUDENT_ENROLLMENT: { label: 'Iscrizione universitaria', icon: GraduationCap },
  GUARANTOR: { label: 'Garante', icon: UsersIcon },
  ID_DOCUMENT: { label: 'Documento d\'identità', icon: CreditCard },
};

const CERT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'In attesa',
  SUBMITTED: 'Inviata',
  VERIFIED: 'Verificata',
  REJECTED: 'Rifiutata',
};

interface QueueMember {
  interestId: string;
  position: number;
  score: number;
  schedulingApproved: boolean;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    avatar: string | null;
    age: number | null;
    gender: string | null;
    occupation: string | null;
    verified: boolean;
    bio: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    contractType: string | null;
    smoker: boolean;
    hasPets: boolean;
    hasGuarantor: boolean;
    incomeRange: string | null;
    languages: string[];
    referencesAvailable: boolean;
    employmentVerified: boolean;
    incomeVerified: boolean;
    noShowCount: number;
  };
  certifications: {
    id: string;
    type: string;
    status: string;
    documentUrl: string | null;
    note: string | null;
    createdAt: string;
  }[];
}

interface AppointmentQueueProps {
  listingId: string;
  onStatusChange?: () => void;
}

export function AppointmentQueue({ listingId, onStatusChange }: AppointmentQueueProps) {
  const [queue, setQueue] = useState<QueueMember[]>([]);
  const [listingStatus, setListingStatus] = useState<string>('');
  const [maxActive, setMaxActive] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showOpenDay, setShowOpenDay] = useState(false);
  const [openDayDate, setOpenDayDate] = useState('');
  const [openDayStart, setOpenDayStart] = useState('10:00');
  const [openDayEnd, setOpenDayEnd] = useState('12:00');

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/queue`);
      const data = await res.json();
      if (data.success) {
        setQueue(data.data.queue);
        setListingStatus(data.data.listingStatus);
        setMaxActive(data.data.maxActive ?? 3);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [listingId]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const doAction = async (url: string, opts: RequestInit) => {
    try {
      const res = await fetch(url, opts);
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
        onStatusChange?.();
        return true;
      } else {
        alert(data.error || 'Errore');
        return false;
      }
    } catch {
      alert('Errore di rete');
      return false;
    }
  };

  const handleRemove = async (tenantId: string, name: string) => {
    if (!confirm(`Rimuovere ${name} dalla coda?`)) return;
    setActing(`remove-${tenantId}`);
    await doAction(
      `/api/listings/${listingId}/queue?tenantId=${tenantId}`,
      { method: 'DELETE' }
    );
    setActing(null);
  };

  const handleApproveScheduling = async (tenantId: string) => {
    setActing(`schedule-${tenantId}`);
    await doAction(
      `/api/listings/${listingId}/queue`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_scheduling', tenantId }),
      }
    );
    setActing(null);
  };

  const handleRequestCertification = async (tenantId: string, type: string) => {
    setActing(`cert-${tenantId}-${type}`);
    await doAction(
      `/api/listings/${listingId}/queue`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_certification', tenantId, certificationType: type }),
      }
    );
    setActing(null);
  };

  const handleCreateOpenDay = async () => {
    if (!openDayDate) { alert('Seleziona una data'); return; }
    setActing('openday');
    const ok = await doAction(
      `/api/listings/${listingId}/queue`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_openday',
          date: openDayDate,
          startTime: openDayStart,
          endTime: openDayEnd,
        }),
      }
    );
    if (ok) setShowOpenDay(false);
    setActing(null);
  };

  const occupationLabel = (occ: string | null) => {
    const map: Record<string, string> = {
      STUDENT: 'Studente', WORKING: 'Lavoratore', FREELANCER: 'Freelancer',
      UNEMPLOYED: 'Disoccupato', RETIRED: 'Pensionato',
    };
    return occ ? map[occ] || occ : '—';
  };

  const contractLabel = (ct: string | null) => {
    const map: Record<string, string> = {
      PERMANENT: 'Indeterminato', TEMPORARY: 'Determinato', INTERNSHIP: 'Stage',
    };
    return ct ? map[ct] || ct : '—';
  };

  // Which certifications can be requested but haven't been yet
  const availableCerts = (member: QueueMember) => {
    const existing = new Set(member.certifications.map(c => c.type));
    const possible: string[] = [];
    if (member.tenant.occupation === 'WORKING' || member.tenant.occupation === 'FREELANCER') {
      if (!existing.has('EMPLOYMENT_CONTRACT')) possible.push('EMPLOYMENT_CONTRACT');
      if (!existing.has('INCOME_PROOF')) possible.push('INCOME_PROOF');
    }
    if (member.tenant.occupation === 'STUDENT') {
      if (!existing.has('STUDENT_ENROLLMENT')) possible.push('STUDENT_ENROLLMENT');
    }
    if (member.tenant.hasGuarantor && !existing.has('GUARANTOR')) possible.push('GUARANTOR');
    if (!existing.has('ID_DOCUMENT')) possible.push('ID_DOCUMENT');
    return possible;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UsersIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">Nessun interessato</p>
        <p className="text-sm mt-1">Quando qualcuno cliccherà &quot;Mi interessa&quot; lo vedrai qui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">Coda interessati</h3>
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
            {queue.length}/{maxActive}
          </span>
          {listingStatus === 'QUEUE_FULL' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Coda piena
            </span>
          )}
        </div>
        <button
          onClick={() => setShowOpenDay(!showOpenDay)}
          className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
        >
          <CalendarDays className="w-4 h-4" />
          Open Day
        </button>
      </div>

      {/* Open Day Creator */}
      {showOpenDay && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sky-800 text-sm">Proponi un Open Day</h4>
          <p className="text-xs text-sky-600">Tutti gli interessati nella coda riceveranno l&apos;invito</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={openDayDate}
              onChange={(e) => setOpenDayDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="col-span-1 text-sm border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={openDayStart}
              onChange={(e) => setOpenDayStart(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={openDayEnd}
              onChange={(e) => setOpenDayEnd(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateOpenDay}
              disabled={acting === 'openday'}
              className="flex-1 text-sm bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {acting === 'openday' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              Crea Open Day
            </button>
            <button
              onClick={() => setShowOpenDay(false)}
              className="text-sm text-gray-600 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Queue Members */}
      {queue.map((member) => {
        const isExpanded = expanded === member.interestId;
        const certs = availableCerts(member);

        return (
          <div key={member.interestId} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Card Header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(isExpanded ? null : member.interestId)}
            >
              <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                {member.tenant.avatar ? (
                  <img src={member.tenant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserCircle className="w-6 h-6 text-sky-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800 truncate">{member.tenant.name}</p>
                  {member.tenant.verified && <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  {member.tenant.noShowCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded" title={`${member.tenant.noShowCount} mancate presenze`}>
                      {member.tenant.noShowCount} no-show
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {member.tenant.age ? `${member.tenant.age} anni` : ''}{' '}
                  · {occupationLabel(member.tenant.occupation)}
                  {member.tenant.contractType && ` (${contractLabel(member.tenant.contractType)})`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                  {member.score}% match
                </span>
                {member.schedulingApproved && (
                  <CalendarCheck className="w-4 h-4 text-green-500" />
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                {/* Tenant Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {member.tenant.budgetMin != null && member.tenant.budgetMax != null && (
                    <div>
                      <span className="text-gray-400">Budget:</span>{' '}
                      <span className="text-gray-700">€{member.tenant.budgetMin}–{member.tenant.budgetMax}</span>
                    </div>
                  )}
                  {member.tenant.incomeRange && (
                    <div>
                      <span className="text-gray-400">Reddito:</span>{' '}
                      <span className="text-gray-700">{member.tenant.incomeRange.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Fumatore:</span>{' '}
                    <span className="text-gray-700">{member.tenant.smoker ? 'Sì' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Animali:</span>{' '}
                    <span className="text-gray-700">{member.tenant.hasPets ? 'Sì' : 'No'}</span>
                  </div>
                  {member.tenant.languages.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Lingue:</span>{' '}
                      <span className="text-gray-700">{member.tenant.languages.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Garante:</span>{' '}
                    <span className="text-gray-700">{member.tenant.hasGuarantor ? 'Sì' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Referenze:</span>{' '}
                    <span className="text-gray-700">{member.tenant.referencesAvailable ? 'Disponibili' : 'No'}</span>
                  </div>
                </div>

                {member.tenant.bio && (
                  <p className="text-sm text-gray-600 italic">&quot;{member.tenant.bio}&quot;</p>
                )}

                {/* Existing Certifications */}
                {member.certifications.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Certificazioni</h4>
                    {member.certifications.map((cert) => {
                      const info = CERT_LABELS[cert.type] || { label: cert.type, icon: FileText };
                      const Icon = info.icon;
                      return (
                        <div key={cert.id} className="flex items-center gap-2 text-sm">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">{info.label}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            cert.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            cert.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                            cert.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {CERT_STATUS_LABEL[cert.status] || cert.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  {/* Approve scheduling */}
                  {!member.schedulingApproved && (
                    <button
                      onClick={() => handleApproveScheduling(member.tenant.id)}
                      disabled={acting === `schedule-${member.tenant.id}`}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === `schedule-${member.tenant.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                      OK Visita
                    </button>
                  )}
                  {member.schedulingApproved && (
                    <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Visita approvata
                    </span>
                  )}

                  {/* Request certifications */}
                  {certs.map((type) => {
                    const info = CERT_LABELS[type];
                    const Icon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => handleRequestCertification(member.tenant.id, type)}
                        disabled={acting === `cert-${member.tenant.id}-${type}`}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      >
                        {acting === `cert-${member.tenant.id}-${type}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        Certifica {info.label}
                      </button>
                    );
                  })}

                  {/* Contact */}
                  <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-sky-300 text-sky-700 rounded-lg hover:bg-sky-50">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Contatta
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(member.tenant.id, member.tenant.name)}
                    disabled={acting === `remove-${member.tenant.id}`}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 ml-auto"
                  >
                    {acting === `remove-${member.tenant.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Rimuovi
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
