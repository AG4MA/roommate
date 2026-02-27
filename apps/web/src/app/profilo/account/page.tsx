'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Link2, Unlink, Loader2, AlertCircle, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

interface LinkedAccount {
  id: string;
  provider: string;
  linkedAt: string;
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchLinkedAccounts();
    }
  }, [status, router]);

  const fetchLinkedAccounts = async () => {
    try {
      const res = await fetch('/api/auth/linked-accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts);
        setHasPassword(data.hasPassword);
      }
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: string) => {
    setError('');
    setSuccess('');
    setUnlinking(provider);

    try {
      const res = await fetch('/api/auth/linked-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();

      if (data.success) {
        setAccounts(accounts.filter(a => a.provider !== provider));
        setSuccess(`Account ${getProviderName(provider)} scollegato con successo`);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setUnlinking(null);
    }
  };

  const handleLinkAccount = (provider: string) => {
    signIn(provider, { callbackUrl: '/profilo/account' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(hasPassword ? 'Password modificata con successo' : 'Password impostata con successo');
        setHasPassword(true);
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Errore durante la modifica');
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const isGoogleLinked = accounts.some(a => a.provider === 'google');
  const isAppleLinked = accounts.some(a => a.provider === 'apple');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profilo/inquilino" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Torna al profilo
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-600" />
          Impostazioni account
        </h1>
        <p className="text-gray-500 mt-1">Gestisci metodi di accesso e account collegati</p>
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

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary-600" />
          Password
        </h2>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">
                {hasPassword ? 'Password impostata' : 'Nessuna password impostata'}
              </p>
              <p className="text-sm text-gray-500">
                {hasPassword
                  ? 'Puoi modificare la tua password in qualsiasi momento'
                  : 'Imposta una password per accedere anche con email e password'}
              </p>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium text-sm transition-colors"
            >
              {hasPassword ? 'Modifica' : 'Imposta'}
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {hasPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimo 8 caratteri"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conferma password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {hasPassword ? 'Modifica password' : 'Imposta password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Annulla
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Linked Accounts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-primary-600" />
          Account collegati
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Collega i tuoi account social per un accesso più veloce. Se hai già un account con la stessa email, verrà collegato automaticamente.
        </p>

        <div className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Google</p>
                <p className="text-sm text-gray-500">
                  {isGoogleLinked ? 'Collegato' : 'Non collegato'}
                </p>
              </div>
            </div>
            {isGoogleLinked ? (
              <button
                onClick={() => handleUnlink('google')}
                disabled={unlinking === 'google'}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {unlinking === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Scollega
              </button>
            ) : (
              <button
                onClick={() => handleLinkAccount('google')}
                className="px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Collega
              </button>
            )}
          </div>

          {/* Apple */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Apple</p>
                <p className="text-sm text-gray-500">
                  {isAppleLinked ? 'Collegato' : 'Non collegato'}
                </p>
              </div>
            </div>
            {isAppleLinked ? (
              <button
                onClick={() => handleUnlink('apple')}
                disabled={unlinking === 'apple'}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {unlinking === 'apple' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Scollega
              </button>
            ) : (
              <button
                onClick={() => handleLinkAccount('apple')}
                className="px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Collega
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Se il tuo account Google o Apple usa la stessa email del tuo account rooMate, verrà collegato automaticamente al primo accesso.
          </p>
        </div>
      </div>
    </div>
  );
}

function getProviderName(provider: string): string {
  switch (provider) {
    case 'google': return 'Google';
    case 'apple': return 'Apple';
    default: return provider;
  }
}
