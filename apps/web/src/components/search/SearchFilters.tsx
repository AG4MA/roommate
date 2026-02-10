'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function SearchFilters() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    roomType: 'all',
    furnished: false,
    privateBath: false,
    petsAllowed: false,
    smokingAllowed: false,
    gender: 'all',
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Search Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Città, quartiere o indirizzo..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={filters.priceMax}
          onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Budget max</option>
          <option value="300">€300</option>
          <option value="400">€400</option>
          <option value="500">€500</option>
          <option value="600">€600</option>
          <option value="700">€700</option>
          <option value="800">€800+</option>
        </select>

        <select
          value={filters.roomType}
          onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Tipo stanza</option>
          <option value="single">Singola</option>
          <option value="double">Doppia</option>
          <option value="studio">Monolocale</option>
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showAdvanced
              ? 'border-primary-500 bg-primary-50 text-primary-600'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filtri
        </button>

        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Cerca
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Filtri avanzati</h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.furnished}
                onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Arredata</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.privateBath}
                onChange={(e) => setFilters({ ...filters, privateBath: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Bagno privato</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.petsAllowed}
                onChange={(e) => setFilters({ ...filters, petsAllowed: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Animali ammessi</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.smokingAllowed}
                onChange={(e) => setFilters({ ...filters, smokingAllowed: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Fumatori ammessi</span>
            </label>
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preferenza genere</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="all">Indifferente</option>
                <option value="male">Solo uomini</option>
                <option value="female">Solo donne</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Prezzo minimo</label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                placeholder="€ min"
                className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
