'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, RefreshCcw, ChevronDown } from 'lucide-react';
import { trackAction } from '@/hooks/useAnalytics';

/* ------------------------------------------------------------------ */
/* Filter pills bar – collapsed by default, horizontal scrollable     */
/* Auto-search on every change (no "Cerca" button)                     */
/* ------------------------------------------------------------------ */

interface FilterState {
  location: string;
  priceMin: string;
  priceMax: string;
  roomType: string;
  furnished: boolean;
  privateBath: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  gender: string;
}

export function SearchFilters({ onFiltersChange }: { onFiltersChange?: (params: URLSearchParams) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [filters, setFilters] = useState<FilterState>({
    location: searchParams.get('city') || '',
    priceMin: searchParams.get('minPrice') || '',
    priceMax: searchParams.get('maxPrice') || '',
    roomType: searchParams.get('roomType') || 'all',
    furnished: searchParams.get('furnished') === 'true',
    privateBath: searchParams.get('privateBath') === 'true',
    petsAllowed: searchParams.get('petsAllowed') === 'true',
    smokingAllowed: searchParams.get('smokingAllowed') === 'true',
    gender: searchParams.get('gender') || 'all',
  });

  // Build URLSearchParams from current filters
  const buildParams = useCallback((f: FilterState): URLSearchParams => {
    const params = new URLSearchParams();
    if (f.location.trim()) params.set('city', f.location.trim());
    if (f.priceMin) params.set('minPrice', f.priceMin);
    if (f.priceMax) params.set('maxPrice', f.priceMax);
    if (f.roomType !== 'all') params.set('roomType', f.roomType);
    if (f.furnished) params.set('furnished', 'true');
    if (f.privateBath) params.set('privateBath', 'true');
    if (f.petsAllowed) params.set('petsAllowed', 'true');
    if (f.smokingAllowed) params.set('smokingAllowed', 'true');
    if (f.gender !== 'all') params.set('gender', f.gender);
    return params;
  }, []);

  // Auto-search with debounce on any filter change
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = buildParams(newFilters);
        trackAction('filter_change', Object.fromEntries(params));
        router.push(`/cerca?${params.toString()}`, { scroll: false });
        onFiltersChange?.(params);
      }, 400);
    },
    [buildParams, router, onFiltersChange],
  );

  // Cleanup
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Count of active filters
  const activeCount = [
    filters.location,
    filters.priceMin,
    filters.priceMax,
    filters.roomType !== 'all' ? filters.roomType : '',
    filters.furnished ? 'f' : '',
    filters.privateBath ? 'p' : '',
    filters.petsAllowed ? 'p' : '',
    filters.smokingAllowed ? 's' : '',
    filters.gender !== 'all' ? filters.gender : '',
  ].filter(Boolean).length;

  // Active pills for summary bar
  const activePills: { label: string; key: string }[] = [];
  if (filters.location) activePills.push({ label: `📍 ${filters.location}`, key: 'location' });
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin ? `€${filters.priceMin}` : '€0';
    const max = filters.priceMax ? `€${filters.priceMax}` : '∞';
    activePills.push({ label: `${min} – ${max}`, key: 'price' });
  }
  if (filters.roomType !== 'all') {
    const roomLabels: Record<string, string> = { SINGLE: 'Singola', DOUBLE: 'Doppia', STUDIO: 'Monolocale' };
    activePills.push({ label: roomLabels[filters.roomType] || filters.roomType, key: 'roomType' });
  }
  if (filters.furnished) activePills.push({ label: 'Arredata', key: 'furnished' });
  if (filters.privateBath) activePills.push({ label: 'Bagno privato', key: 'privateBath' });
  if (filters.petsAllowed) activePills.push({ label: 'Animali', key: 'petsAllowed' });
  if (filters.smokingAllowed) activePills.push({ label: 'Fumatori', key: 'smokingAllowed' });
  if (filters.gender !== 'all') {
    const genderLabels: Record<string, string> = { male: 'Solo uomini', female: 'Solo donne' };
    activePills.push({ label: genderLabels[filters.gender] || filters.gender, key: 'gender' });
  }

  const removePill = (key: string) => {
    const next = { ...filters };
    switch (key) {
      case 'location': next.location = ''; break;
      case 'price': next.priceMin = ''; next.priceMax = ''; break;
      case 'roomType': next.roomType = 'all'; break;
      case 'furnished': next.furnished = false; break;
      case 'privateBath': next.privateBath = false; break;
      case 'petsAllowed': next.petsAllowed = false; break;
      case 'smokingAllowed': next.smokingAllowed = false; break;
      case 'gender': next.gender = 'all'; break;
    }
    applyFilters(next);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top control bar: Filtri button + scrollable active pills */}
      <div className="flex items-center gap-2">
        {/* Filtri toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            open
              ? 'border-primary-500 bg-primary-50 text-primary-600'
              : 'border-gray-200 bg-white hover:border-primary-300 text-gray-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtri
          {activeCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Scrollable active pills */}
        {activePills.length > 0 && (
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 whitespace-nowrap py-0.5">
              {activePills.map((pill) => (
                <span
                  key={pill.key}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200"
                >
                  {pill.label}
                  <button
                    onClick={(e) => { e.stopPropagation(); removePill(pill.key); }}
                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ripeti ricerca */}
        <button
          onClick={() => router.push('/cerca/wizard')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
          title="Ripeti il wizard di ricerca"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ripeti ricerca</span>
        </button>
      </div>

      {/* Expanded filters panel */}
      {open && (
        <div className="mt-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Città</label>
              <input
                type="text"
                placeholder="Es. Milano, Roma..."
                value={filters.location}
                onChange={(e) => applyFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget €/mese</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => applyFilters({ ...filters, priceMin: e.target.value })}
                  className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => applyFilters({ ...filters, priceMax: e.target.value })}
                  className="w-1/2 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Room type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo stanza</label>
              <select
                value={filters.roomType}
                onChange={(e) => applyFilters({ ...filters, roomType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="all">Tutte</option>
                <option value="SINGLE">Singola</option>
                <option value="DOUBLE">Doppia</option>
                <option value="STUDIO">Monolocale</option>
              </select>
            </div>

            {/* Gender preference */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Preferenza genere</label>
              <select
                value={filters.gender}
                onChange={(e) => applyFilters({ ...filters, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="all">Indifferente</option>
                <option value="male">Solo uomini</option>
                <option value="female">Solo donne</option>
              </select>
            </div>
          </div>

          {/* Toggle pills row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: 'furnished' as const, label: '🛋️ Arredata' },
              { key: 'privateBath' as const, label: '🚿 Bagno privato' },
              { key: 'petsAllowed' as const, label: '🐾 Animali ammessi' },
              { key: 'smokingAllowed' as const, label: '🚬 Fumatori ammessi' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => applyFilters({ ...filters, [opt.key]: !filters[opt.key] })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filters[opt.key]
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
