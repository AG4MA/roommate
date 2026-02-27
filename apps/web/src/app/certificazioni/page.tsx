'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, FileText, Upload, CheckCircle, XCircle, Clock,
  Loader2, AlertCircle, Briefcase, Euro, GraduationCap,
  UserCheck, CreditCard, ArrowLeft, Eye, BadgeCheck,
} from 'lucide-react';

interface Certification {
  id: string;
  interestId: string;
  type: string;
  status: string;
  documentUrl: string | null;
  note: string | null;
  listing: { id: string; title: string } | null;
  tenant?: { id: string; name: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

interface ProfileCompletion {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  verifications: {
    emailVerified: boolean;
    idVerified: boolean;
    employmentVerified: boolean;
    incomeVerified: boolean;
  };
  badges: string[];
}

const CERT_TYPES: Record<string, { label: string; icon: any; description: string }> = {
  EMPLOYMENT_CONTRACT: {
    label: 'Contratto di lavoro',
    icon: Briefcase,
    description: 'Copia del contratto di lavoro in corso',
  },
  INCOME_PROOF: {
    label: 'Prova di reddito',
    icon: Euro,
    description: 'Ultima busta paga o dichiarazione dei redditi',
  },
  STUDENT_ENROLLMENT: {
    label: 'Iscrizione universitaria',
    icon: GraduationCap,
    description: 'Certificato di iscrizione o libretto universitario',
  },
  GUARANTOR: {
    label: 'Garante',
    icon: UserCheck,
    description: 'Documentazione del garante',
  },
  ID_DOCUMENT: {
    label: 'Documento d\'identità',
    icon: CreditCard,
    description: 'Carta d\'identità, passaporto o patente',
  },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Richiesto', color: 'text-amber-600 bg-amber-50', icon: Clock },
  SUBMITTED: { label: 'Inviato', color: 'text-blue-600 bg-blue-50', icon: Upload },
  VERIFIED: { label: 'Verificato', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  REJECTED: { label: 'Rifiutato', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function CertificazioniPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);
  const [reviewingCertId, setReviewingCertId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [certRes, compRes] = await Promise.all([
        fetch(`/api/certifications?role=${role}`),
        role === 'tenant' ? fetch('/api/profile/completion') : null,
      ]);

      const certData = await certRes.json();
      if (certData.success) {
        setCertifications(certData.data);
      }

      if (compRes) {
        const compData = await compRes.json();
        if (compData.success) {
          setCompletion(compData.data);
        }
      }
    } catch {
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  const handleFileUpload = async (certId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setError('Il file non può superare i 10MB');
        return;
      }

      setUploadingCertId(certId);
      setError('');
      setSuccess('');

      try {
        // Upload the file
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.error || 'Errore nel caricamento del file');
          return;
        }

        // Submit the certification
        const submitRes = await fetch('/api/certifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit',
            certificationId: certId,
            documentUrl: uploadData.url,
          }),
        });

        const submitData = await submitRes.json();

        if (submitData.success) {
          setSuccess('Documento caricato con successo');
          fetchData();
        } else {
          setError(submitData.error || 'Errore nell\'invio');
        }
      } catch {
        setError('Errore di connessione');
      } finally {
        setUploadingCertId(null);
      }
    };
    input.click();
  };

  const handleReview = async (certId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          certificationId: certId,
          status: newStatus,
          note: reviewNote || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(
          newStatus === 'VERIFIED'
            ? 'Certificazione approvata'
            : 'Certificazione rifiutata'
        );
        setReviewingCertId(null);
        setReviewNote('');
        fetchData();
      } else {
        setError(data.error || 'Errore nella revisione');
      }
    } catch {
      setError('Errore di connessione');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profilo/inquilino" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Torna al profilo
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-600" />
          Certificazioni e verifiche
        </h1>
        <p className="text-gray-500 mt-1">Gestisci i tuoi documenti e verifiche profilo</p>
      </div>

      {/* Role Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setRole('tenant')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            role === 'tenant'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Come inquilino
        </button>
        <button
          onClick={() => setRole('landlord')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            role === 'landlord'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Come proprietario
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Profile Completion (tenant only) */}
      {role === 'tenant' && completion && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-primary-600" />
            Completamento profilo
          </h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Completamento</span>
              <span className="font-semibold text-primary-600">{completion.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completion.percentage >= 80
                    ? 'bg-green-500'
                    : completion.percentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
          </div>

          {/* Verification Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <VerificationBadge
              label="Email"
              verified={completion.verifications.emailVerified}
            />
            <VerificationBadge
              label="Identità"
              verified={completion.verifications.idVerified}
            />
            <VerificationBadge
              label="Impiego"
              verified={completion.verifications.employmentVerified}
            />
            <VerificationBadge
              label="Reddito"
              verified={completion.verifications.incomeVerified}
            />
          </div>

          {/* Missing Fields */}
          {completion.missingFields.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Campi mancanti:</p>
              <div className="flex flex-wrap gap-2">
                {completion.missingFields.map((field) => (
                  <span
                    key={field}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          {role === 'tenant' ? 'Le mie certificazioni' : 'Certificazioni ricevute'}
        </h2>

        {certifications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {role === 'tenant'
                ? 'Nessuna certificazione richiesta. I proprietari possono richiederti documenti quando mostri interesse per una stanza.'
                : 'Nessuna certificazione richiesta. Puoi richiedere documenti ai candidati dalla coda di interesse dei tuoi annunci.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => {
              const typeInfo = CERT_TYPES[cert.type] || {
                label: cert.type,
                icon: FileText,
                description: '',
              };
              const statusInfo = STATUS_LABELS[cert.status] || {
                label: cert.status,
                color: 'text-gray-600 bg-gray-50',
                icon: Clock,
              };
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={cert.id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                        <TypeIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{typeInfo.label}</h3>
                        <p className="text-sm text-gray-500">{typeInfo.description}</p>
                        {cert.listing && (
                          <p className="text-xs text-gray-400 mt-1">
                            Annuncio: {cert.listing.title}
                          </p>
                        )}
                        {cert.tenant && role === 'landlord' && (
                          <p className="text-xs text-gray-400 mt-1">
                            Candidato: {cert.tenant.name}
                          </p>
                        )}
                        {cert.note && (
                          <p className="text-xs text-amber-600 mt-1">
                            Nota: {cert.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {/* Tenant actions */}
                    {role === 'tenant' && cert.status === 'PENDING' && (
                      <button
                        onClick={() => handleFileUpload(cert.id)}
                        disabled={uploadingCertId === cert.id}
                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {uploadingCertId === cert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Carica documento
                      </button>
                    )}

                    {role === 'tenant' && cert.status === 'REJECTED' && (
                      <button
                        onClick={() => handleFileUpload(cert.id)}
                        disabled={uploadingCertId === cert.id}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {uploadingCertId === cert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Ricarica documento
                      </button>
                    )}

                    {/* View document */}
                    {cert.documentUrl && (
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Vedi documento
                      </a>
                    )}

                    {/* Landlord actions */}
                    {role === 'landlord' && cert.status === 'SUBMITTED' && (
                      <>
                        {reviewingCertId === cert.id ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              placeholder="Nota opzionale..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReview(cert.id, 'VERIFIED')}
                                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approva
                              </button>
                              <button
                                onClick={() => handleReview(cert.id, 'REJECTED')}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Rifiuta
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingCertId(null);
                                  setReviewNote('');
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingCertId(cert.id)}
                            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Revisiona
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationBadge({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl border ${
        verified
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      {verified ? (
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
      )}
      <span
        className={`text-sm font-medium ${
          verified ? 'text-green-700' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
