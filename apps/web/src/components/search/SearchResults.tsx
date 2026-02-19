'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Users, Wifi, Sparkles } from 'lucide-react';
import type { ListingCard } from '@roommate/shared';
import { getRoomTypeLabel } from '@roommate/shared';

interface SearchResultsProps {
  listings: ListingCard[];
  loading?: boolean;
}

// ── Smart match scoring ──
// Computes a 0-100 match % for each listing based on user wizard preferences
// stored in the URL search params.

function computeMatchScore(
  room: ListingCard,
  params: URLSearchParams
): number {
  let total = 0;
  let matched = 0;

  // Price range match
  const maxPrice = params.get('maxPrice');
  if (maxPrice) {
    total += 25;
    const max = Number(maxPrice);
    if (room.price <= max) matched += 25;
    else if (room.price <= max * 1.15) matched += 12; // within 15%
  }

  // City match
  const city = params.get('city');
  if (city) {
    total += 20;
    if (room.city.toLowerCase() === city.toLowerCase()) matched += 20;
  }

  // Room type match
  const roomType = params.get('roomType');
  if (roomType) {
    total += 15;
    if (room.roomType === roomType) matched += 15;
  }

  // Gender preference match
  const gender = params.get('gender');
  if (gender && gender !== 'ANY') {
    total += 10;
    // If listing has no gender preference or matches, it's a match
    if (!room.preferences?.gender || room.preferences.gender === gender) matched += 10;
  }

  // Features match (wifi, furnished, privateBath)
  const furnished = params.get('furnished');
  if (furnished === 'true') {
    total += 10;
    if (room.features.furnished) matched += 10;
  }
  const privateBath = params.get('privateBath');
  if (privateBath === 'true') {
    total += 10;
    if (room.features.privateBath) matched += 10;
  }
  const petsAllowed = params.get('petsAllowed');
  if (petsAllowed === 'true') {
    total += 5;
    if (room.rules?.petsAllowed) matched += 5;
  }
  const smokingAllowed = params.get('smokingAllowed');
  if (smokingAllowed === 'true') {
    total += 5;
    if (room.rules?.smokingAllowed) matched += 5;
  }

  // If no filters applied, return -1 to indicate "no scoring"
  if (total === 0) return -1;

  return Math.round((matched / total) * 100);
}

function MatchBadge({ score }: { score: number }) {
  if (score < 0) return null;

  const color =
    score >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : score >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Sparkles className="w-3 h-3" />
      {score}% match
    </span>
  );
}

export function SearchResults({ listings, loading }: SearchResultsProps) {
  const searchParams = useSearchParams();

  // Compute match scores for each listing
  const scored = listings.map((room) => ({
    room,
    score: computeMatchScore(room, searchParams),
  }));

  // Sort by score descending (unscored at the end)
  const sorted = scored.sort((a, b) => {
    if (a.score < 0 && b.score < 0) return 0;
    if (a.score < 0) return 1;
    if (b.score < 0) return -1;
    return b.score - a.score;
  });

  const hasScores = scored.some((s) => s.score >= 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden flex animate-pulse">
            <div className="w-48 h-40 bg-gray-200" />
            <div className="flex-1 p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {listings.length} stanze trovate
        </h2>
        <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>Ordina per: Più recenti</option>
          <option>Prezzo: dal più basso</option>
          <option>Prezzo: dal più alto</option>
          <option>Disponibilità: più vicina</option>
        </select>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nessuna stanza trovata</p>
          <p className="text-gray-400 text-sm mt-1">Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hasScores && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Risultati ordinati per compatibilità con le tue preferenze
            </p>
          )}
          {sorted.map(({ room, score }) => (
            <RoomCard key={room.id} room={room} matchScore={score} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, matchScore }: { room: ListingCard; matchScore: number }) {
  return (
    <Link href={`/stanza/${room.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
        {/* Image */}
        <div className="w-48 h-40 relative shrink-0 bg-gray-200">
          {room.images.length > 0 && room.images[0].url !== '/placeholder.jpg' ? (
            <img
              src={room.images[0].url}
              alt={room.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <MapPin className="w-8 h-8" />
            </div>
          )}
          {/* Match badge overlaid on image */}
          {matchScore >= 0 && (
            <div className="absolute top-2 left-2">
              <MatchBadge score={matchScore} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{room.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {room.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">€{room.price}</p>
              <p className="text-xs text-gray-500">/mese</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              {getRoomTypeLabel(room.roomType)}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              {room.roomSize}m²
            </span>
            {room.features.wifi && (
              <span className="px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-600 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> WiFi
              </span>
            )}
          </div>

          <div className="mt-3 flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {room.currentRoommates}/{room.maxRoommates} coinquilini
            </span>
            <span className="text-green-600 font-medium">
              Disponibile dal {new Date(room.availableFrom).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
