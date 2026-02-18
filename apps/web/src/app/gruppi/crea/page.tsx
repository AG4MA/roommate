'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ApiResponse, GroupSummary } from '@roommate/shared';

export default function CreaGruppoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          description: description.trim() || undefined,
          maxMembers,
        }),
      });

      const json: ApiResponse<GroupSummary> = await res.json();

      if (json.success && json.data) {
        router.push(`/gruppi/${json.data.id}`);
      } else {
        setError(json.error || 'Errore nella creazione del gruppo');
      }
    } catch {
      setError('Errore nella creazione del gruppo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/gruppi"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai gruppi
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crea un gruppo</h1>
            <p className="text-gray-500 text-sm">
              Forma il tuo gruppo di coinquilini per cercare casa insieme
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome del gruppo
              <span className="text-gray-400 font-normal ml-1">(opzionale)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Amici del Poli"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
              <span className="text-gray-400 font-normal ml-1">(opzionale)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi cosa state cercando come gruppo..."
              maxLength={300}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero massimo di membri
            </label>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxMembers(n)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    maxMembers === n
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                Crea gruppo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
