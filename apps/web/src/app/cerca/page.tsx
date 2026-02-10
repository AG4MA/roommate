import { Suspense } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchMap } from '@/components/search/SearchMap';

export default function CercaPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Filters Bar */}
      <div className="bg-white border-b p-4">
        <SearchFilters />
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Results List */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50">
          <Suspense fallback={<div className="text-center py-8">Caricamento...</div>}>
            <SearchResults />
          </Suspense>
        </div>

        {/* Map */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <Suspense fallback={<div className="h-full bg-gray-200 animate-pulse" />}>
            <SearchMap />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
