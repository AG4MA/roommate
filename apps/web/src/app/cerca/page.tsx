import { Suspense } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchContent } from '@/components/search/SearchContent';

export default function CercaPage() {
  return (
    <div className="search-page">
      <div className="search-filter-bar">
        <Suspense fallback={<div className="h-8" />}>
          <SearchFilters />
        </Suspense>
      </div>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">Caricamento...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
