import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Euro, Users, Calendar,
  Square, ArrowLeft, Share2,
  CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { InterestActions } from '@/components/room/InterestActions';
import { RoommateCard } from '@/components/room/RoommateCard';
import { MiniMap } from '@/components/room/MiniMap';
import { prisma } from '@roommate/database';
import { getRoomTypeLabel } from '@roommate/shared';
import type { ListingDetail } from '@roommate/shared';

// Feature labels for Italian UI
const featureLabels: Record<string, string> = {
  wifi: 'WiFi',
  furnished: 'Arredata',
  privateBath: 'Bagno privato',
  balcony: 'Balcone',
  aircon: 'Aria condizionata',
  washingMachine: 'Lavatrice',
  dishwasher: 'Lavastoviglie',
  parking: 'Parcheggio',
  bikeParking: 'Parcheggio bici',
  garden: 'Giardino',
  terrace: 'Terrazza',
};

async function getListingDetail(id: string): Promise<ListingDetail | null> {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      features: true,
      rules: true,
      preferences: true,
      roommates: true,
      landlord: {
        include: { landlordProfile: true },
      },
    },
  });

  if (!listing) return null;

  // Increment view count (fire and forget)
  prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    address: listing.address,
    city: listing.city,
    neighborhood: listing.neighborhood,
    price: listing.price,
    expenses: listing.expenses,
    deposit: listing.deposit,
    roomType: listing.roomType,
    roomSize: listing.roomSize,
    totalSize: listing.totalSize,
    floor: listing.floor,
    hasElevator: listing.hasElevator,
    availableFrom: listing.availableFrom.toISOString(),
    minStay: listing.minStay,
    maxStay: listing.maxStay,
    images: listing.images.map((img) => ({ url: img.url })),
    features: {
      wifi: listing.features?.wifi ?? false,
      furnished: listing.features?.furnished ?? false,
      privateBath: listing.features?.privateBath ?? false,
      balcony: listing.features?.balcony ?? false,
      aircon: listing.features?.aircon ?? false,
      washingMachine: listing.features?.washingMachine ?? false,
      dishwasher: listing.features?.dishwasher ?? false,
      parking: listing.features?.parking ?? false,
      bikeParking: listing.features?.bikeParking ?? false,
      garden: listing.features?.garden ?? false,
      terrace: listing.features?.terrace ?? false,
    },
    rules: {
      petsAllowed: listing.rules?.petsAllowed ?? false,
      smokingAllowed: listing.rules?.smokingAllowed ?? false,
      couplesAllowed: listing.rules?.couplesAllowed ?? false,
      guestsAllowed: listing.rules?.guestsAllowed ?? true,
      cleaningSchedule: listing.rules?.cleaningSchedule ?? null,
      quietHoursStart: listing.rules?.quietHoursStart ?? null,
      quietHoursEnd: listing.rules?.quietHoursEnd ?? null,
    },
    preferences: {
      gender: listing.preferences?.gender ?? null,
      ageMin: listing.preferences?.ageMin ?? null,
      ageMax: listing.preferences?.ageMax ?? null,
      occupation: listing.preferences?.occupation ?? [],
      languages: listing.preferences?.languages ?? [],
    },
    roommates: listing.roommates.map((r) => ({
      id: r.id,
      name: r.name,
      age: r.age,
      occupation: r.occupation,
      bio: r.bio,
      avatar: r.avatar,
    })),
    landlord: {
      id: listing.landlord!.id,
      name: listing.landlord!.name,
      avatar: listing.landlord!.avatar,
      verified: listing.landlord!.verified,
      createdAt: listing.landlord!.createdAt.toISOString(),
      responseRate: listing.landlord!.landlordProfile?.responseRate ?? 0,
      responseTime: listing.landlord!.landlordProfile?.responseTime ?? 0,
      totalListings: listing.landlord!.landlordProfile?.totalListings ?? 0,
    },
    currentRoommates: listing.roommates.length,
    maxRoommates: listing.roommates.length + 1,
    latitude: listing.latitude,
    longitude: listing.longitude,
    virtualTourUrl: listing.virtualTourUrl,
    views: listing.views,
    createdAt: listing.createdAt.toISOString(),
    publishedAt: listing.publishedAt?.toISOString() ?? null,
  };
}

export default async function StanzaPage({ params }: { params: { id: string } }) {
  const listing = await getListingDetail(params.id);

  if (!listing) {
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
          <div className="bg-gray-200 rounded-2xl h-80 mb-6 flex items-center justify-center overflow-hidden">
            {listing.images.length > 0 && listing.images[0].url !== '/placeholder.jpg' ? (
              <img
                src={listing.images[0].url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-gray-500">Galleria immagini</p>
            )}
          </div>

          {/* Title & Address + Apri mappa */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.address}
                </p>
                <MiniMap lat={listing.latitude} lng={listing.longitude} address={listing.address} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Euro className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">€{listing.price}</p>
              <p className="text-xs text-gray-500">+ €{listing.expenses} spese</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Square className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{listing.roomSize}m²</p>
              <p className="text-xs text-gray-500">{getRoomTypeLabel(listing.roomType)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{listing.currentRoommates}</p>
              <p className="text-xs text-gray-500">Coinquilini</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{listing.minStay}</p>
              <p className="text-xs text-gray-500">Mesi min</p>
            </div>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Descrizione</h2>
            <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
          </section>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Caratteristiche</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(listing.features).map(([key, value]) => (
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
                  <span className="text-sm">
                    {featureLabels[key] || key}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Roommates */}
          {listing.roommates.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">I tuoi futuri coinquilini</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {listing.roommates.map((roommate) => (
                  <RoommateCard key={roommate.id} roommate={roommate} />
                ))}
              </div>
            </section>
          )}

          {/* Rules (includes quiet hours as part of rules, not separate) */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Regole della casa</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${listing.rules.petsAllowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {listing.rules.petsAllowed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">Animali</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg ${listing.rules.smokingAllowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {listing.rules.smokingAllowed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">Fumo</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg ${listing.rules.guestsAllowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {listing.rules.guestsAllowed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">Ospiti</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg ${listing.rules.couplesAllowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {listing.rules.couplesAllowed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="text-sm">Coppie</span>
              </div>
              {listing.rules.quietHoursStart && listing.rules.quietHoursEnd && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 col-span-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Ore di silenzio: {listing.rules.quietHoursStart} - {listing.rules.quietHoursEnd}</span>
                </div>
              )}
              {listing.rules.cleaningSchedule && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-gray-600 col-span-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Pulizie: {listing.rules.cleaningSchedule}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Interest & Save Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <InterestActions listingId={listing.id} />
            </div>

            {/* Price recap card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-gray-800">€{listing.price}</span>
                <span className="text-gray-500 text-sm">/mese</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Spese incluse</span>
                  <span className="font-medium">€{listing.expenses}/mese</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposito</span>
                  <span className="font-medium">€{listing.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibile dal</span>
                  <span className="font-medium">{new Date(listing.availableFrom).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
