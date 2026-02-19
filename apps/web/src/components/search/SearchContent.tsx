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
      const keys = ['city', 'maxPrice', 'minPrice', 'roomType', 'furnished', 'privateBath', 'petsAllowed', 'smokingAllowed', 'gender'];
      keys.forEach((k) => { const v = searchParams.get(k); if (v) params.set(k, v); });
      if (boundsRef.current) {
        params.set('north', String(boundsRef.current.north));
        params.set('south', String(boundsRef.current.south));
        params.set('east', String(boundsRef.current.east));
        params.set('west', String(boundsRef.current.west));
      }
      const res = await fetch(`/api/listings?${params.toString()}`);
      const json: ApiResponse<PaginatedResponse<ListingCard>> = await res.json();
      if (json.success && json.data) setListings(json.data.items);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      boundsRef.current = bounds;
      fetchListings();
    },
    [fetchListings],
  );

  return (
    <div className="search-content">
      {/* Mobile toggle */}
      <div className="search-mobile-toggle lg:hidden">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMobileView('list')}
            className={`search-mobile-btn ${mobileView === 'list' ? 'search-mobile-btn--active' : 'search-mobile-btn--inactive'}`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`search-mobile-btn ${mobileView === 'map' ? 'search-mobile-btn--active' : 'search-mobile-btn--inactive'}`}
          >
            <Map className="w-4 h-4" /> Mappa
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="search-split">
        <div className={`search-list-pane ${mobileView === 'map' ? 'hidden lg:block' : ''}`}>
          <SearchResults listings={listings} loading={loading} />
        </div>
        <div className={`search-map-pane ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
          <SearchMap listings={listings} onBoundsChange={handleBoundsChange} />
        </div>
      </div>
    </div>
  );
}