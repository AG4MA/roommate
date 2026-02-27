'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  MessageCircle,
  Heart,
  CalendarCheck,
  CalendarX,
  Search,
  Clock,
  Users,
  AlertTriangle,
  Loader2,
  Save,
  CheckCircle,
  Moon,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationPrefs {
  emailEnabled: boolean;
  pushEnabled: boolean;
  newMessage: boolean;
  interestReceived: boolean;
  interestApproved: boolean;
  bookingConfirmed: boolean;
  bookingCancelled: boolean;
  wishMatched: boolean;
  listingExpiring: boolean;
  listingExpired: boolean;
  groupInvite: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  hasPushSubscription: boolean;
  pushSubscriptionCount: number;
}

const NOTIFICATION_TYPES = [
  {
    key: 'newMessage',
    label: 'Nuovi messaggi',
    description: 'Quando ricevi un messaggio in chat',
    icon: MessageCircle,
    color: 'text-blue-500',
  },
  {
    key: 'interestReceived',
    label: 'Interesse ricevuto',
    description: 'Quando un inquilino esprime interesse per il tuo annuncio',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    key: 'interestApproved',
    label: 'Interesse approvato',
    description: 'Quando il proprietario approva il tuo interesse',
    icon: CheckCircle,
    color: 'text-green-500',
  },
  {
    key: 'bookingConfirmed',
    label: 'Visita confermata',
    description: 'Quando una prenotazione di visita viene confermata',
    icon: CalendarCheck,
    color: 'text-emerald-500',
  },
  {
    key: 'bookingCancelled',
    label: 'Visita cancellata',
    description: 'Quando una prenotazione viene cancellata',
    icon: CalendarX,
    color: 'text-orange-500',
  },
  {
    key: 'wishMatched',
    label: 'Match desiderata',
    description: 'Quando un annuncio corrisponde alle tue ricerche salvate',
    icon: Search,
    color: 'text-purple-500',
  },
  {
    key: 'listingExpiring',
    label: 'Annuncio in scadenza',
    description: 'Promemoria quando il tuo annuncio sta per scadere',
    icon: Clock,
    color: 'text-yellow-500',
  },
  {
    key: 'listingExpired',
    label: 'Annuncio scaduto',
    description: 'Quando il tuo annuncio è stato rimosso dalla ricerca',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
  {
    key: 'groupInvite',
    label: 'Invito gruppo',
    description: 'Quando vieni invitato a un gruppo di coinquilini',
    icon: Users,
    color: 'text-indigo-500',
  },
] as const;

export default function NotifichePage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushRequesting, setPushRequesting] = useState(false);
  const [pushError, setPushError] = useState('');
  const [pushSupported, setPushSupported] = useState(false);

  // Check push support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
    }
  }, []);

  // Load preferences
  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setPrefs(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Save preferences (debounced auto-save)
  const savePrefs = useCallback(async (newPrefs: Partial<NotificationPrefs>) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  // Toggle handler
  const handleToggle = (key: string, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    savePrefs({ [key]: value });
  };

  // Request push permission & subscribe
  const handleEnablePush = async () => {
    setPushRequesting(true);
    setPushError('');

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushError('Permesso notifiche negato. Abilita le notifiche nelle impostazioni del browser.');
        setPushRequesting(false);
        return;
      }

      // Get VAPID public key
      const vapidRes = await fetch('/api/push/subscribe');
      const vapidJson = await vapidRes.json();
      const vapidPublicKey = vapidJson.data?.publicKey;

      if (!vapidPublicKey) {
        setPushError('Chiave VAPID non configurata. Contatta il supporto.');
        setPushRequesting(false);
        return;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Send subscription to server
      const subJson = subscription.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          },
          platform: 'web',
        }),
      });

      const result = await res.json();
      if (result.success) {
        setPrefs(prev => prev ? { ...prev, hasPushSubscription: true, pushSubscriptionCount: (prev.pushSubscriptionCount || 0) + 1 } : prev);
      } else {
        setPushError('Errore nella registrazione push');
      }
    } catch (error: any) {
      console.error('[PUSH ENABLE ERROR]', error);
      setPushError(error.message || 'Errore nell\'attivazione delle notifiche push');
    } finally {
      setPushRequesting(false);
    }
  };

  // Disable push
  const handleDisablePush = async () => {
    setPushRequesting(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Unsubscribe from browser
          await subscription.unsubscribe();
          // Remove from server
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
      }
      setPrefs(prev => prev ? { ...prev, hasPushSubscription: false, pushSubscriptionCount: Math.max(0, (prev.pushSubscriptionCount || 1) - 1) } : prev);
    } catch (error) {
      console.error('[PUSH DISABLE ERROR]', error);
    } finally {
      setPushRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Effettua il login per gestire le notifiche</p>
          <Link href="/login" className="text-primary-600 hover:underline mt-2 inline-block">
            Accedi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-600" />
              Notifiche
            </h1>
            <p className="text-gray-500 mt-1">Gestisci come e quando ricevere le notifiche</p>
          </div>
          {saving && (
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...
            </span>
          )}
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Salvato
            </span>
          )}
        </div>

        {/* Canali */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Canali di notifica</h2>

          {/* Email */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">Ricevi notifiche via email</p>
              </div>
            </div>
            <ToggleSwitch
              checked={prefs.emailEnabled}
              onChange={(v) => handleToggle('emailEnabled', v)}
            />
          </div>

          {/* Push */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push browser</p>
                <p className="text-sm text-gray-500">
                  {prefs.hasPushSubscription
                    ? `Attivo su ${prefs.pushSubscriptionCount} ${prefs.pushSubscriptionCount === 1 ? 'dispositivo' : 'dispositivi'}`
                    : 'Notifiche push nel browser'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={prefs.pushEnabled}
                onChange={(v) => handleToggle('pushEnabled', v)}
              />
            </div>
          </div>

          {/* Push subscription button */}
          {pushSupported && prefs.pushEnabled && (
            <div className="mt-3 pt-3 border-t">
              {prefs.hasPushSubscription ? (
                <button
                  onClick={handleDisablePush}
                  disabled={pushRequesting}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  {pushRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
                  Disattiva push su questo browser
                </button>
              ) : (
                <button
                  onClick={handleEnablePush}
                  disabled={pushRequesting}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  {pushRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  Attiva push su questo browser
                </button>
              )}
              {pushError && (
                <p className="text-sm text-red-500 mt-2">{pushError}</p>
              )}
            </div>
          )}

          {!pushSupported && (
            <p className="text-sm text-gray-400 mt-3 pt-3 border-t">
              Le notifiche push non sono supportate dal tuo browser.
            </p>
          )}
        </section>

        {/* Per-type preferences */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipi di notifica</h2>
          <p className="text-sm text-gray-500 mb-4">
            Scegli quali notifiche ricevere. Questo vale sia per email che per push.
          </p>

          <div className="divide-y">
            {NOTIFICATION_TYPES.map(({ key, label, description, icon: Icon, color }) => (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={prefs[key as keyof NotificationPrefs] as boolean}
                  onChange={(v) => handleToggle(key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Ore silenziose</h2>
            </div>
            <ToggleSwitch
              checked={prefs.quietHoursEnabled}
              onChange={(v) => handleToggle('quietHoursEnabled', v)}
            />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Silenzia le notifiche push durante determinate ore. Le email verranno comunque inviate.
          </p>

          {prefs.quietHoursEnabled && (
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Dalle</label>
                <input
                  type="time"
                  value={prefs.quietHoursStart || '22:00'}
                  onChange={(e) => {
                    const updated = { ...prefs, quietHoursStart: e.target.value };
                    setPrefs(updated);
                    savePrefs({ quietHoursStart: e.target.value });
                  }}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Alle</label>
                <input
                  type="time"
                  value={prefs.quietHoursEnd || '08:00'}
                  onChange={(e) => {
                    const updated = { ...prefs, quietHoursEnd: e.target.value };
                    setPrefs(updated);
                    savePrefs({ quietHoursEnd: e.target.value });
                  }}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link href="/profilo/inquilino" className="text-primary-600 hover:underline text-sm">
            ← Torna al profilo
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== Toggle Switch Component ====================

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ==================== Utility: VAPID key conversion ====================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
