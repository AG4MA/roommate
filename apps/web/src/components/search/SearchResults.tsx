'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Euro, Users, Wifi, Car, Leaf } from 'lucide-react';

// Mock data - verrà sostituito con dati reali da API
const mockRooms = [
  {
    id: '1',
    title: 'Stanza singola luminosa - Porta Venezia',
    address: 'Via Lecco, Milano',
    price: 550,
    images: ['/placeholder-room.jpg'],
    roomType: 'single',
    size: 14,
    availableFrom: '2024-03-01',
    features: ['wifi', 'furnished', 'balcony'],
    currentRoommates: 2,
    maxRoommates: 3,
    latitude: 45.4773,
    longitude: 9.2055,
  },
  {
    id: '2',
    title: 'Ampia stanza doppia con bagno privato',
    address: 'Via Padova 120, Milano',
    price: 450,
    images: ['/placeholder-room.jpg'],
    roomType: 'double',
    size: 18,
    availableFrom: '2024-02-15',
    features: ['wifi', 'privateBath', 'furnished'],
    currentRoommates: 1,
    maxRoommates: 2,
    latitude: 45.4951,
    longitude: 9.2264,
  },
  {
    id: '3',
    title: 'Monolocale accogliente zona Navigli',
    address: 'Ripa di Porta Ticinese, Milano',
    price: 750,
    images: ['/placeholder-room.jpg'],
    roomType: 'studio',
    size: 28,
    availableFrom: '2024-03-15',
    features: ['wifi', 'furnished', 'parking', 'balcony'],
    currentRoommates: 0,
    maxRoommates: 1,
    latitude: 45.4485,
    longitude: 9.1769,
  },
  {
    id: '4',
    title: 'Stanza singola in appartamento ristrutturato',
    address: 'Corso Buenos Aires, Milano',
    price: 600,
    images: ['/placeholder-room.jpg'],
    roomType: 'single',
    size: 12,
    availableFrom: '2024-02-20',
    features: ['wifi', 'furnished', 'aircon'],
    currentRoommates: 3,
    maxRoommates: 4,
    latitude: 45.4815,
    longitude: 9.2127,
  },
];

export function SearchResults() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {mockRooms.length} stanze trovate
        </h2>
        <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>Ordina per: Più recenti</option>
          <option>Prezzo: dal più basso</option>
          <option>Prezzo: dal più alto</option>
          <option>Disponibilità: più vicina</option>
        </select>
      </div>

      <div className="space-y-4">
        {mockRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: typeof mockRooms[0] }) {
  return (
    <Link href={`/stanza/${room.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
        {/* Image */}
        <div className="w-48 h-40 relative shrink-0 bg-gray-200">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <MapPin className="w-8 h-8" />
          </div>
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
              {room.roomType === 'single' ? 'Singola' : room.roomType === 'double' ? 'Doppia' : 'Monolocale'}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              {room.size}m²
            </span>
            {room.features.includes('wifi') && (
              <span className="px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-600 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> WiFi
              </span>
            )}
            {room.features.includes('parking') && (
              <span className="px-2 py-1 bg-green-50 rounded-full text-xs text-green-600 flex items-center gap-1">
                <Car className="w-3 h-3" /> Parcheggio
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
