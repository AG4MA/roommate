'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User, Phone, Mail, Building2, FileText,
  MessageCircle, Loader2, Save, CheckCircle, AlertCircle
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  phone: string;
  bio: string;
  companyName: string;
  description: string;
  contactPreference: 'IN_APP' | 'PHONE' | 'EMAIL';
  phonePublic: boolean;
  emailPublic: boolean;
}

export default function LandlordProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    bio: '',
    companyName: '',
    description: '',
    contactPreference: 'IN_APP',
    phonePublic: false,
    emailPublic: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      // Set name from session
      setFormData((prev) => ({ ...prev, name: session.user.name || '' }));

      // Fetch landlord profile
      fetch('/api/profile/landlord')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setFormData((prev) => ({
              ...prev,
              companyName: json.data.companyName || '',
              description: json.data.description || '',
              contactPreference: json.data.contactPreference || 'IN_APP',
              phonePublic: json.data.phonePublic || false,
              emailPublic: json.data.emailPublic || false,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/profile/landlord', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(json.error || 'Errore durante il salvataggio');
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const contactOptions = [
    { value: 'IN_APP', label: 'In-app', desc: 'I cercatori ti contattano via chat', icon: MessageCircle },
    { value: 'PHONE', label: 'Telefono', desc: 'Mostrato agli interessati', icon: Phone },
    { value: 'EMAIL', label: 'Email', desc: 'Mostrata agli interessati', icon: Mail },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Profilo proprietario</h1>
      <p className="text-gray-500 mb-8">Gestisci le tue informazioni e le preferenze di contatto</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Profilo aggiornato con successo
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        {/* Personal info */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Informazioni personali
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+39 333 1234567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Presentati brevemente..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Business info */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Informazioni azienda
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome azienda</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Opzionale — per agenzie immobiliari"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrivi la tua attività..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Contact preferences */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Preferenze di contatto
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {contactOptions.map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, contactPreference: value })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-center ${
                  formData.contactPreference === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium text-sm">{label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.phonePublic}
                onChange={(e) => setFormData({ ...formData, phonePublic: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 text-sm">Mostra il numero di telefono sul profilo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailPublic}
                onChange={(e) => setFormData({ ...formData, emailPublic: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 text-sm">Mostra l'email sul profilo</span>
            </label>
          </div>
        </section>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salva profilo
        </button>
      </div>
    </div>
  );
}
