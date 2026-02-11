'use client';

import { useEffect, useState } from 'react';
import { SearchResults } from './SearchResults';
import { SearchMap } from './SearchMap';
import type { ListingCard, ApiResponse, PaginatedResponse } from '@roommate/shared';

export function SearchContent() {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/listings?city=Milano');
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
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Results List */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50">
        <SearchResults listings={listings} loading={loading} />
      </div>

      {/* Map */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <SearchMap listings={listings} />
      </div>
    </div>
  );
}
