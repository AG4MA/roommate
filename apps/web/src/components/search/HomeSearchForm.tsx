'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export function HomeSearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/cerca?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Dove vuoi cercare?"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
        />
      </div>
      <div className="flex gap-4">
        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
        >
          <option value="">Budget max</option>
          <option value="300">€300</option>
          <option value="400">€400</option>
          <option value="500">€500</option>
          <option value="600">€600</option>
          <option value="700">€700+</option>
        </select>
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          Cerca
        </button>
      </div>
    </form>
  );
}
