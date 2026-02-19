'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { List, Map, RefreshCcw } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { SearchMap } from './SearchMap';
import type { ListingCard, ApiResponse, PaginatedResponse } from '@roommate/shared';

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const city = searchParams.get('city');
        const maxPrice = searchParams.get('maxPrice');
        const minPrice = searchParams.get('minPrice');
        const roomType = searchParams.get('roomType');
        const furnished = searchParams.get('furnished');
        const privateBath = searchParams.get('privateBath');
        const petsAllowed = searchParams.get('petsAllowed');
        const smokingAllowed = searchParams.get('smokingAllowed');
        const gender = searchParams.get('gender');
        if (city) params.set('city', city);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (minPrice) params.set('minPrice', minPrice);
        if (roomType) params.set('roomType', roomType);
        if (furnished) params.set('furnished', furnished);
        if (privateBath) params.set('privateBath', privateBath);
        if (petsAllowed) params.set('petsAllowed', petsAllowed);
        if (smokingAllowed) params.set('smokingAllowed', smokingAllowed);
        if (gender) params.set('gender', gender);
        const res = await fetch(`/api/listings?${params.toString()}`);
        const json: ApiResponse<PaginatedResponse<ListingCard>> = await res.json();
        if (json.success && json.data) {
          setListings(json.data.items);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [searchParams]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile toggle bar + Ripeti ricerca */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b">
        <button
          onClick={() => router.push('/cerca/wizard')}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Ripeti ricerca
        </button>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMobileView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mobileView === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mobileView === 'map' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Map className="w-4 h-4" /> Mappa
          </button>
        </div>
      </div>

      {/* Desktop split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Results List — visible on desktop always, on mobile only when list is selected */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50 ${
          mobileView === 'map' ? 'hidden lg:block' : ''
        }`}>
          <SearchResults listings={listings} loading={loading} />
        </div>

        {/* Map — visible on desktop always, on mobile only when map is selected */}
        <div className={`w-full lg:w-1/2 relative ${
          mobileView === 'list' ? 'hidden lg:block' : ''
        }`}>
          <SearchMap listings={listings} />
        </div>
      </div>
    </div>
  );
}
