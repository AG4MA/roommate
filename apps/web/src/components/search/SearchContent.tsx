'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { List, Map } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { SearchMap } from './SearchMap';
import type { ListingCard, ApiResponse, PaginatedResponse } from '@roommate/shared';

export function SearchContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const boundsRef = useRef<{ north: number; south: number; east: number; west: number } | null>(null);

  const fetchListings = useCallback(async () => {
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
      // Bounding box from map
      if (boundsRef.current) {
        params.set('north', String(boundsRef.current.north));
        params.set('south', String(boundsRef.current.south));
        params.set('east', String(boundsRef.current.east));
        params.set('west', String(boundsRef.current.west));
      }
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
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Called by SearchMap when user pans/zooms
  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      boundsRef.current = bounds;
      fetchListings();
    },
    [fetchListings],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile toggle bar */}
      <div className="lg:hidden flex items-center justify-center px-4 py-2 bg-white border-b">
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
        {/* Results List */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50 ${
          mobileView === 'map' ? 'hidden lg:block' : ''
        }`}>
          <SearchResults listings={listings} loading={loading} />
        </div>

        {/* Map */}
        <div className={`w-full lg:w-1/2 relative ${
          mobileView === 'list' ? 'hidden lg:block' : ''
        }`}>
          <SearchMap listings={listings} onBoundsChange={handleBoundsChange} />
        </div>
      </div>
    </div>
  );
}
