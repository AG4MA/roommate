import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchContent } from '@/components/search/SearchContent';

export default function CercaPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Filters Bar */}
      <div className="bg-white border-b p-4">
        <SearchFilters />
      </div>

      {/* Main Content - Split View */}
      <SearchContent />
    </div>
  );
}
