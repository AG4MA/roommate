'use client';

import { useRouter } from 'next/navigation';
import { Search, Building2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          roo<span className="text-primary-600">Mate</span>
        </h1>
        <p className="text-lg text-gray-500">Cosa vuoi fare?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Cerca Stanza */}
        <button
          onClick={() => router.push('/cerca/wizard')}
          className="group relative bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-primary-200 cursor-pointer text-center"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center transition-colors">
              <Search className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cerca Stanza</h2>
              <p className="text-gray-500 text-sm">Trova la stanza perfetta per te</p>
            </div>
          </div>
        </button>

        {/* Affitta Stanza */}
        <button
          onClick={() => router.push('/pubblica')}
          className="group relative bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-accent-200 cursor-pointer text-center"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-accent-50 group-hover:bg-accent-100 rounded-2xl flex items-center justify-center transition-colors">
              <Building2 className="w-10 h-10 text-accent-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Affitta Stanza</h2>
              <p className="text-gray-500 text-sm">Pubblica il tuo annuncio</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
