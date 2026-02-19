'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, Mail, Lock, User, Loader2, AlertCircle, Search, Building2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

type UserRole = 'tenant' | 'landlord';

const ROLE_OPTIONS: { value: UserRole; icon: React.ReactNode; label: string; desc: string }[] = [
  { value: 'tenant', icon: <Search className="w-6 h-6" />, label: 'Inquilino', desc: 'Cerco una stanza' },
  { value: 'landlord', icon: <Building2 className="w-6 h-6" />, label: 'Proprietario', desc: 'Affitto una stanza' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/cerca';
  const preselectedRole = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    preselectedRole === 'landlord' ? 'landlord' : preselectedRole === 'tenant' ? 'tenant' : null
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType: selectedRole }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Errore durante la registrazione');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
      } else {
        const dest = selectedRole === 'landlord' && !redirectTo.includes('/pubblica') ? '/pubblica' : redirectTo;
        router.push(dest);
        router.refresh();
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-800">
              roo<span className="text-primary-600">Mate</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Crea il tuo account</h1>
          <p className="text-gray-500 mt-1">Seleziona il tuo ruolo e registrati</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLE_OPTIONS.map((opt) => {
            const active = selectedRole === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRole(opt.value)}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center ${
                  active
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : selectedRole
                      ? 'border-gray-100 bg-gray-50 opacity-60 hover:opacity-90'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'}`}>
                  {opt.icon}
                </div>
                <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
                {active && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary-600" />}
              </button>
            );
          })}
        </div>

        {/* Form — appears once role is selected */}
        {selectedRole && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {error && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome"
                    required
                    minLength={2}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@esempio.it"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 8 caratteri"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrazione in corso...
                </>
              ) : (
                `Registrati come ${selectedRole === 'landlord' ? 'proprietario' : 'inquilino'}`
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500">
          Hai già un account?{' '}
          <Link href="/login" className="text-primary-600 hover:underline font-medium">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
