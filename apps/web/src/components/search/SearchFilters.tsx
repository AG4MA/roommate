'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Euro, Home, Sofa, Bath, Dog, Cigarette, Users, X, RotateCcw } from 'lucide-react';
import { trackAction } from '@/hooks/useAnalytics';

/* ------------------------------------------------------------------ */
/* Inline filter pills  single horizontal scrollable row.            */
/* Click a pill to open a mini-dropdown. Auto-search on every change. */
/* CSS classes live in search.css                                      */
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  // Auto-search with debounce
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

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const toggle = (key: string) => setOpenDropdown(openDropdown === key ? null : key);

  const clearFilter = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const hasAnyFilter =
    filters.location || filters.priceMin || filters.priceMax ||
    filters.roomType !== 'all' || filters.furnished || filters.privateBath ||
    filters.petsAllowed || filters.smokingAllowed || filters.gender !== 'all';

  const resetAll = () => {
    const empty: FilterState = {
      location: '', priceMin: '', priceMax: '', roomType: 'all',
      furnished: false, privateBath: false, petsAllowed: false, smokingAllowed: false, gender: 'all',
    };
    applyFilters(empty);
    setOpenDropdown(null);
  };

  /* ---- Pill helpers ---- */

  const pillClass = (active: boolean) =>
    `filter-pill ${active ? 'filter-pill--active' : ''}`;

  const roomLabels: Record<string, string> = { SINGLE: 'Singola', DOUBLE: 'Doppia', STUDIO: 'Monolocale', all: 'Tutte' };
  const genderLabels: Record<string, string> = { male: 'Solo uomini', female: 'Solo donne', all: 'Tutti' };

  return (
    <div ref={barRef} className="filter-bar">

      {/* ---- City ---- */}
      <div className="relative shrink-0">
        <button className={pillClass(!!filters.location)} onClick={() => toggle('location')}>
          <MapPin className="w-4 h-4" />
          {filters.location || 'Città'}
          {filters.location && (
            <span className="filter-pill__clear" onClick={(e) => clearFilter('location', e)}><X className="w-3 h-3" /></span>
          )}
        </button>
        {openDropdown === 'location' && (
          <div className="filter-dropdown">
            <span className="filter-dropdown__label">Città</span>
            <input
              autoFocus
              type="text"
              placeholder="Es. Milano, Roma..."
              value={filters.location}
              onChange={(e) => applyFilters({ ...filters, location: e.target.value })}
              className="filter-dropdown__input"
            />
          </div>
        )}
      </div>

      {/* ---- Price ---- */}
      <div className="relative shrink-0">
        <button className={pillClass(!!(filters.priceMin || filters.priceMax))} onClick={() => toggle('price')}>
          <Euro className="w-4 h-4" />
          {filters.priceMin || filters.priceMax
            ? `€${filters.priceMin || '0'}  €${filters.priceMax || ''}`
            : 'Budget'}
          {(filters.priceMin || filters.priceMax) && (
            <span className="filter-pill__clear" onClick={(e) => clearFilter('price', e)}><X className="w-3 h-3" /></span>
          )}
        </button>
        {openDropdown === 'price' && (
          <div className="filter-dropdown" style={{ minWidth: 240 }}>
            <span className="filter-dropdown__label">Budget €/mese</span>
            <div className="filter-dropdown__row">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => applyFilters({ ...filters, priceMin: e.target.value })}
                className="filter-dropdown__input"
              />
              <span className="text-gray-400"></span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => applyFilters({ ...filters, priceMax: e.target.value })}
                className="filter-dropdown__input"
              />
            </div>
          </div>
        )}
      </div>

      {/* ---- Room type ---- */}
      <div className="relative shrink-0">
        <button className={pillClass(filters.roomType !== 'all')} onClick={() => toggle('roomType')}>
          <Home className="w-4 h-4" />
          {roomLabels[filters.roomType]}
          {filters.roomType !== 'all' && (
            <span className="filter-pill__clear" onClick={(e) => clearFilter('roomType', e)}><X className="w-3 h-3" /></span>
          )}
        </button>
        {openDropdown === 'roomType' && (
          <div className="filter-dropdown">
            <span className="filter-dropdown__label">Tipo stanza</span>
            {['all', 'SINGLE', 'DOUBLE', 'STUDIO'].map((val) => (
              <button
                key={val}
                onClick={() => { applyFilters({ ...filters, roomType: val }); setOpenDropdown(null); }}
                className={`filter-dropdown__option ${filters.roomType === val ? 'filter-dropdown__option--active' : ''}`}
              >
                {roomLabels[val]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Gender ---- */}
      <div className="relative shrink-0">
        <button className={pillClass(filters.gender !== 'all')} onClick={() => toggle('gender')}>
          <Users className="w-4 h-4" />
          {genderLabels[filters.gender]}
          {filters.gender !== 'all' && (
            <span className="filter-pill__clear" onClick={(e) => clearFilter('gender', e)}><X className="w-3 h-3" /></span>
          )}
        </button>
        {openDropdown === 'gender' && (
          <div className="filter-dropdown">
            <span className="filter-dropdown__label">Preferenza genere</span>
            {['all', 'male', 'female'].map((val) => (
              <button
                key={val}
                onClick={() => { applyFilters({ ...filters, gender: val }); setOpenDropdown(null); }}
                className={`filter-dropdown__option ${filters.gender === val ? 'filter-dropdown__option--active' : ''}`}
              >
                {genderLabels[val]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Toggle pills (one-click on/off) ---- */}
      <button
        className={pillClass(filters.furnished)}
        onClick={() => applyFilters({ ...filters, furnished: !filters.furnished })}
      >
        <Sofa className="w-4 h-4" />Arredata
      </button>

      <button
        className={pillClass(filters.privateBath)}
        onClick={() => applyFilters({ ...filters, privateBath: !filters.privateBath })}
      >
        <Bath className="w-4 h-4" />Bagno privato
      </button>

      <button
        className={pillClass(filters.petsAllowed)}
        onClick={() => applyFilters({ ...filters, petsAllowed: !filters.petsAllowed })}
      >
        <Dog className="w-4 h-4" />Animali
      </button>

      <button
        className={pillClass(filters.smokingAllowed)}
        onClick={() => applyFilters({ ...filters, smokingAllowed: !filters.smokingAllowed })}
      >
        <Cigarette className="w-4 h-4" />Fumatori
      </button>

      {/* ---- Reset ---- */}
      {hasAnyFilter && (
        <button className="filter-pill filter-pill--reset" onClick={resetAll}>
          <RotateCcw className="w-3.5 h-3.5" />Reset
        </button>
      )}
    </div>
  );
}