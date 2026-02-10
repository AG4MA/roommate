import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Euro, Users, Wifi, Car, Calendar, 
  Bath, Bed, Square, ArrowLeft, Heart, Share2,
  CheckCircle, XCircle, Phone, MessageCircle
} from 'lucide-react';
import { BookingWidget } from '@/components/room/BookingWidget';
import { RoommateCard } from '@/components/room/RoommateCard';

// Mock data - verrà sostituito con fetch dal database
const mockRoom = {
  id: '1',
  title: 'Stanza singola luminosa con balcone - Porta Venezia',
  description: `Bellissima stanza singola in appartamento completamente ristrutturato, situato in una delle zone più vivaci e ben collegate di Milano.

La stanza è molto luminosa grazie alla finestra che affaccia sul balcone privato. È arredata con letto matrimoniale, armadio a 4 ante, scrivania e sedia ergonomica - perfetta per smart working o studio.

L'appartamento è composto da 3 stanze, 2 bagni (uno vicino alla stanza disponibile), cucina abitabile completamente attrezzata e un ampio soggiorno condiviso.

Cerchiamo una persona tranquilla, pulita e rispettosa degli spazi comuni. Siamo due ragazzi lavoratori con orari regolari.`,
  address: 'Via Lecco 15, Milano',
  city: 'Milano',
  neighborhood: 'Porta Venezia',
  price: 550,
  expenses: 80,
  deposit: 1100,
  minStay: 6,
  images: [
    '/placeholder-room-1.jpg',
    '/placeholder-room-2.jpg',
    '/placeholder-room-3.jpg',
  ],
  roomType: 'single',
  size: 14,
  totalSize: 85,
  floor: 3,
  elevator: true,
  availableFrom: '2024-03-01',
  features: {
    wifi: true,
    furnished: true,
    balcony: true,
    privateBath: false,
    aircon: true,
    heating: true,
    washingMachine: true,
    dishwasher: true,
    parking: false,
    petsAllowed: false,
    smokingAllowed: false,
  },
  rules: {
    couplesAllowed: false,
    guestsAllowed: true,
    cleaningSchedule: 'A turni settimanali',
  },
  preferences: {
    gender: 'all',
    ageMin: 23,
    ageMax: 35,
    occupation: ['working', 'student'],
  },
  currentRoommates: [
    { id: '1', name: 'Marco', age: 28, occupation: 'Software Developer', avatar: '' },
    { id: '2', name: 'Luca', age: 26, occupation: 'Marketing Manager', avatar: '' },
  ],
  landlord: {
    id: '1',
    name: 'Anna Rossi',
    responseTime: '< 1 ora',
    responseRate: 95,
    verified: true,
  },
  availableSlots: [
    { date: '2024-02-15', time: '18:00', type: 'single' },
    { date: '2024-02-16', time: '10:00', type: 'openday' },
    { date: '2024-02-16', time: '15:00', type: 'single' },
    { date: '2024-02-17', time: '11:00', type: 'openday' },
  ],
  virtualTourUrl: null,
  latitude: 45.4773,
  longitude: 9.2055,
};

export default function StanzaPage({ params }: { params: { id: string } }) {
  // In produzione, fetch room data
  const room = mockRoom;
  
  if (!room) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link 
        href="/cerca" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai risultati
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="bg-gray-200 rounded-2xl h-80 mb-6 flex items-center justify-center">
            <p className="text-gray-500">Galleria immagini</p>
          </div>

          {/* Title & Actions */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{room.title}</h1>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {room.address}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Euro className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">€{room.price}</p>
              <p className="text-xs text-gray-500">+ €{room.expenses} spese</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Square className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{room.size}m²</p>
              <p className="text-xs text-gray-500">{room.roomType === 'single' ? 'Singola' : 'Doppia'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{room.currentRoommates.length}</p>
              <p className="text-xs text-gray-500">Coinquilini</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{room.minStay}</p>
              <p className="text-xs text-gray-500">Mesi min</p>
            </div>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Descrizione</h2>
            <p className="text-gray-600 whitespace-pre-line">{room.description}</p>
          </section>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Caratteristiche</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(room.features).map(([key, value]) => (
                <div 
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {value ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Roommates */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">I tuoi futuri coinquilini</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {room.currentRoommates.map((roommate) => (
                <RoommateCard key={roommate.id} roommate={roommate} />
              ))}
            </div>
          </section>

          {/* Preferences */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chi cerchiamo</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <ul className="space-y-2 text-amber-800">
                {room.preferences.gender !== 'all' && (
                  <li>• Solo {room.preferences.gender === 'male' ? 'uomini' : 'donne'}</li>
                )}
                <li>• Età: {room.preferences.ageMin} - {room.preferences.ageMax} anni</li>
                <li>• {room.preferences.occupation.includes('working') && room.preferences.occupation.includes('student') 
                  ? 'Lavoratori o studenti' 
                  : room.preferences.occupation.includes('working') ? 'Solo lavoratori' : 'Solo studenti'}
                </li>
                {!room.rules.couplesAllowed && <li>• No coppie</li>}
              </ul>
            </div>
          </section>
        </div>

        {/* Sidebar - Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget 
              room={room}
              availableSlots={room.availableSlots}
              landlord={room.landlord}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
