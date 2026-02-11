'use client';

import Link from 'next/link';
import { MapPin, Users, Wifi } from 'lucide-react';
import type { ListingCard } from '@roommate/shared';
import { getRoomTypeLabel } from '@roommate/shared';

interface SearchResultsProps {
  listings: ListingCard[];
  loading?: boolean;
}

export function SearchResults({ listings, loading }: SearchResultsProps) {
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
          {listings.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room }: { room: ListingCard }) {
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
