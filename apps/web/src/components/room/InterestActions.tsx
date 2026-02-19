'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, HandHeart, Loader2, Check, Clock, AlertTriangle, Users } from 'lucide-react';

interface InterestActionsProps {
  listingId: string;
}

interface InterestStatus {
  canExpress: boolean;
  queueFull: boolean;
  activeCount: number;
  waitingCount: number;
  maxActive: number;
  userInterest: {
    status: string;
    position: number;
    score: number;
  } | null;
  cooldownUntil?: string | null;
  totalUserInterests?: number;
  maxUserInterests?: number;
}

export function InterestActions({ listingId }: InterestActionsProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<InterestStatus | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`);
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [listingId]);

  const checkFavorite = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/listings/${listingId}/favorite`);
      const data = await res.json();
      if (data.success) setIsSaved(data.data?.isFavorite ?? false);
    } catch { /* ignore */ }
  }, [listingId, session?.user?.id]);

  useEffect(() => {
    fetchStatus();
    checkFavorite();
  }, [fetchStatus, checkFavorite]);

  // Cooldown timer
  useEffect(() => {
    if (!status?.cooldownUntil) {
      setCooldownRemaining(null);
      return;
    }
    const updateCooldown = () => {
      const until = new Date(status.cooldownUntil!).getTime();
      const now = Date.now();
      const diff = until - now;
      if (diff <= 0) {
        setCooldownRemaining(null);
        fetchStatus(); // refresh to clear cooldown
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setCooldownRemaining(`${hours}h ${mins}m`);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 60000);
    return () => clearInterval(interval);
  }, [status?.cooldownUntil, fetchStatus]);

  const handleInterest = async () => {
    if (!session?.user?.id) {
      window.location.href = '/login?redirect=' + encodeURIComponent(`/stanza/${listingId}`);
      return;
    }

    setActing('interest');
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchStatus();
      } else {
        alert(data.error || 'Errore');
      }
    } catch {
      alert('Errore di rete');
    }
    setActing(null);
  };

  const handleWithdraw = async () => {
    if (!confirm('Vuoi ritirare il tuo interesse?\n\nAttenzione: dopo il ritiro dovrai attendere 24 ore prima di poter esprimere nuovamente interesse per questo annuncio.')) return;
    setActing('withdraw');
    try {
      const res = await fetch(`/api/listings/${listingId}/interest`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchStatus();
      }
    } catch {
      alert('Errore di rete');
    }
    setActing(null);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      window.location.href = '/login?redirect=' + encodeURIComponent(`/stanza/${listingId}`);
      return;
    }

    setActing('save');
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await fetch(`/api/listings/${listingId}/favorite`, { method });
      const data = await res.json();
      if (data.success) {
        setIsSaved(!isSaved);
      }
    } catch {
      alert('Errore di rete');
    }
    setActing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const isLandlord = session?.user?.role === 'landlord';
  const userInterest = status?.userInterest;
  const queueFull = status?.queueFull ?? false;
  const activeCount = status?.activeCount ?? 0;
  const hasCooldown = !!cooldownRemaining;
  const totalUserInterests = status?.totalUserInterests ?? 0;
  const maxUserInterests = status?.maxUserInterests ?? 8;
  const atInterestLimit = totalUserInterests >= maxUserInterests && !userInterest;

  return (
    <div className="space-y-3">
      {/* Queue status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {Array.from({ length: status?.maxActive ?? 3 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < activeCount ? 'bg-primary-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-gray-500">
          {activeCount}/{status?.maxActive ?? 3} interessati
        </span>
        {queueFull && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            Coda piena
          </span>
        )}
      </div>

      {/* Interest state */}
      {!isLandlord && (
        <>
          {userInterest ? (
            <div className="space-y-2">
              {userInterest.status === 'ACTIVE' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Sei in coda (posizione {userInterest.position})</p>
                    <p className="text-xs text-green-600">Il proprietario può ora contattarti</p>
                  </div>
                </div>
              )}
              {userInterest.status === 'WAITING' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">In lista d'attesa</p>
                    <p className="text-xs text-amber-600">Sarai promosso quando si libera un posto</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleWithdraw}
                disabled={acting === 'withdraw'}
                className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {acting === 'withdraw' ? 'Ritirando...' : 'Ritira interesse'}
              </button>
            </div>
          ) : (
            <>
              {/* Cooldown message */}
              {hasCooldown && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Cooldown attivo</p>
                    <p className="text-xs text-orange-600">
                      Potrai esprimere nuovo interesse tra {cooldownRemaining}
                    </p>
                  </div>
                </div>
              )}

              {/* Interest limit message */}
              {atInterestLimit && !hasCooldown && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Limite interessi raggiunto</p>
                    <p className="text-xs text-amber-600">
                      Hai già {totalUserInterests} interessi attivi (max {maxUserInterests}). Ritira un interesse prima di esprimerne uno nuovo.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleInterest}
                disabled={acting === 'interest' || (queueFull && !status?.canExpress) || hasCooldown || atInterestLimit}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
                  queueFull || hasCooldown || atInterestLimit
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {acting === 'interest' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <HandHeart className="w-5 h-5" />
                )}
                {hasCooldown ? `Cooldown — ${cooldownRemaining}` : queueFull ? 'Coda piena — non disponibile' : atInterestLimit ? 'Limite interessi raggiunto' : 'Mi interessa'}
              </button>
            </>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={acting === 'save'}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors font-medium ${
              isSaved
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {acting === 'save' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            )}
            {isSaved ? 'Annuncio salvato' : 'Salva annuncio'}
          </button>

          {/* Warning if queue full and saved */}
          {isSaved && queueFull && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Coda piena — ti avviseremo quando torna disponibile
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
