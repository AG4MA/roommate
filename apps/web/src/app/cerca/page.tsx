import { Suspense } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchContent } from '@/components/search/SearchContent';

export default function CercaPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Filters Bar */}
      <div className="bg-white border-b p-4">
        <Suspense fallback={<div className="h-12" />}>
          <SearchFilters />
        </Suspense>
      </div>

      {/* Main Content - Split View */}
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">Caricamento...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
