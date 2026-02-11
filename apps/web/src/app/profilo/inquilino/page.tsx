'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Euro,
  Calendar,
  FileText,
  Building2,
  Shield,
  Cigarette,
  PawPrint,
  Languages,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const contractTypeOptions = [
  { value: '', label: 'Seleziona...' },
  { value: 'PERMANENT', label: 'Indeterminato' },
  { value: 'TEMPORARY', label: 'Determinato' },
  { value: 'INTERNSHIP', label: 'Stage/Tirocinio' },
];

const incomeRangeOptions = [
  { value: '', label: 'Seleziona...' },
  { value: 'UNDER_1000', label: 'Meno di 1.000 €' },
  { value: 'FROM_1000_TO_1500', label: '1.000 - 1.500 €' },
  { value: 'FROM_1500_TO_2000', label: '1.500 - 2.000 €' },
  { value: 'FROM_2000_TO_3000', label: '2.000 - 3.000 €' },
  { value: 'OVER_3000', label: 'Oltre 3.000 €' },
];

const commonLanguages = [
  'Italiano',
  'Inglese',
  'Francese',
  'Spagnolo',
  'Tedesco',
  'Portoghese',
  'Cinese',
  'Arabo',
  'Russo',
  'Giapponese',
];

interface FormData {
  budgetMin: string;
  budgetMax: string;
  moveInDate: string;
  contractType: string;
  incomeRange: string;
  smoker: boolean;
  hasPets: boolean;
  hasGuarantor: boolean;
  referencesAvailable: boolean;
  languages: string[];
}

export default function ProfiloInquilinoPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    contractType: '',
    incomeRange: '',
    smoker: false,
    hasPets: false,
    hasGuarantor: false,
    referencesAvailable: false,
    languages: [],
  });

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        // TODO: Replace with session user ID (Phase 1)
        const res = await fetch('/api/profile/tenant?userId=demo');
        const json = await res.json();

        if (json.success && json.data) {
          const d = json.data;
          setForm({
            budgetMin: d.budgetMin?.toString() ?? '',
            budgetMax: d.budgetMax?.toString() ?? '',
            moveInDate: d.moveInDate ? d.moveInDate.split('T')[0] : '',
            contractType: d.contractType ?? '',
            incomeRange: d.incomeRange ?? '',
            smoker: d.smoker ?? false,
            hasPets: d.hasPets ?? false,
            hasGuarantor: d.hasGuarantor ?? false,
            referencesAvailable: d.referencesAvailable ?? false,
            languages: d.languages ?? [],
          });
        }
      } catch (err) {
        // Profile not found or not logged in - use defaults
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleToggle(field: keyof FormData) {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function toggleLanguage(lang: string) {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      // TODO: Replace with session user ID (Phase 1)
      userId: 'demo',
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      moveInDate: form.moveInDate || undefined,
      contractType: form.contractType || undefined,
      incomeRange: form.incomeRange || undefined,
      smoker: form.smoker,
      hasPets: form.hasPets,
      hasGuarantor: form.hasGuarantor,
      referencesAvailable: form.referencesAvailable,
      languages: form.languages.length > 0 ? form.languages : undefined,
    };

    try {
      const res = await fetch('/api/profile/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Profilo inquilino
        </h1>
        <p className="text-gray-500 mt-1">
          Queste informazioni verranno mostrate ai proprietari quando li
          contatti. Compila il profilo per aumentare le tue possibilità.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Budget Range */}
        <Section icon={Euro} title="Budget mensile">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Minimo (€)
              </label>
              <input
                type="number"
                value={form.budgetMin}
                onChange={(e) => handleChange('budgetMin', e.target.value)}
                placeholder="300"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Massimo (€)
              </label>
              <input
                type="number"
                value={form.budgetMax}
                onChange={(e) => handleChange('budgetMax', e.target.value)}
                placeholder="600"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </Section>

        {/* Move-in Date */}
        <Section icon={Calendar} title="Data di ingresso">
          <input
            type="date"
            value={form.moveInDate}
            onChange={(e) => handleChange('moveInDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </Section>

        {/* Contract Type */}
        <Section icon={FileText} title="Tipo di contratto">
          <select
            value={form.contractType}
            onChange={(e) => handleChange('contractType', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {contractTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Section>

        {/* Income Range */}
        <Section icon={Building2} title="Fascia di reddito">
          <select
            value={form.incomeRange}
            onChange={(e) => handleChange('incomeRange', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {incomeRangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Section>

        {/* Toggle Fields */}
        <Section icon={Shield} title="Informazioni personali">
          <div className="space-y-4">
            <ToggleRow
              icon={Cigarette}
              label="Fumatore"
              description="Indica se fumi regolarmente"
              checked={form.smoker}
              onChange={() => handleToggle('smoker')}
            />
            <ToggleRow
              icon={PawPrint}
              label="Hai animali domestici"
              description="Indica se hai animali che verranno con te"
              checked={form.hasPets}
              onChange={() => handleToggle('hasPets')}
            />
            <ToggleRow
              icon={Shield}
              label="Hai un garante"
              description="Persona che garantisce per il pagamento dell'affitto"
              checked={form.hasGuarantor}
              onChange={() => handleToggle('hasGuarantor')}
            />
            <ToggleRow
              icon={FileText}
              label="Referenze disponibili"
              description="Hai referenze da precedenti affitti o datori di lavoro"
              checked={form.referencesAvailable}
              onChange={() => handleToggle('referencesAvailable')}
            />
          </div>
        </Section>

        {/* Languages */}
        <Section icon={Languages} title="Lingue parlate">
          <div className="flex flex-wrap gap-2">
            {commonLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.languages.includes(lang)
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Salvataggio...' : 'Salva profilo'}
          </button>
          {saved && (
            <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Salvato con successo
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
        <Icon className="w-5 h-5 text-primary-600" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <div>
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
