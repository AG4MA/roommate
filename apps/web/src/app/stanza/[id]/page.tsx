import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Euro, Users, Calendar,
  Square, ArrowLeft, Heart, Share2,
  CheckCircle, XCircle,
} from 'lucide-react';
import { BookingWidget } from '@/components/room/BookingWidget';
import { RoommateCard } from '@/components/room/RoommateCard';
import { prisma } from '@roommate/database';
import { getRoomTypeLabel } from '@roommate/shared';
import type { ListingDetail, VisitSlot } from '@roommate/shared';

// Feature labels for Italian UI
const featureLabels: Record<string, string> = {
  wifi: 'WiFi',
  furnished: 'Arredata',
  privateBath: 'Bagno privato',
  balcony: 'Balcone',
  aircon: 'Aria condizionata',
  heating: 'Riscaldamento',
  washingMachine: 'Lavatrice',
  dishwasher: 'Lavastoviglie',
  parking: 'Parcheggio',
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
      heating: listing.features?.heating ?? true,
      washingMachine: listing.features?.washingMachine ?? false,
      dishwasher: listing.features?.dishwasher ?? false,
      parking: listing.features?.parking ?? false,
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
      id: listing.landlord.id,
      name: listing.landlord.name,
      avatar: listing.landlord.avatar,
      verified: listing.landlord.verified,
      createdAt: listing.landlord.createdAt.toISOString(),
      responseRate: listing.landlord.landlordProfile?.responseRate ?? 0,
      responseTime: listing.landlord.landlordProfile?.responseTime ?? 0,
      totalListings: listing.landlord.landlordProfile?.totalListings ?? 0,
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

async function getListingSlots(listingId: string): Promise<VisitSlot[]> {
  const slots = await prisma.visitSlot.findMany({
    where: {
      listingId,
      date: { gte: new Date() },
    },
    include: { bookings: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return slots.map((s) => ({
    id: s.id,
    date: s.date.toISOString().split('T')[0],
    startTime: s.startTime,
    endTime: s.endTime,
    type: s.type,
    maxGuests: s.maxGuests,
    bookedCount: s.bookings.length,
    available: s.bookings.length < s.maxGuests,
  }));
}

export default async function StanzaPage({ params }: { params: { id: string } }) {
  const [listing, slots] = await Promise.all([
    getListingDetail(params.id),
    getListingSlots(params.id),
  ]);

  if (!listing) {
    notFound();
  }

  // Format response time for display
  const responseTimeLabel =
    listing.landlord.responseTime < 60
      ? `< 1 ora`
      : listing.landlord.responseTime < 1440
        ? `${Math.round(listing.landlord.responseTime / 60)} ore`
        : `${Math.round(listing.landlord.responseTime / 1440)} giorni`;

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

          {/* Title & Actions */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {listing.address}
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

          {/* Preferences */}
          {(listing.preferences.gender || listing.preferences.ageMin || listing.preferences.occupation.length > 0) && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Chi cerchiamo</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <ul className="space-y-2 text-amber-800">
                  {listing.preferences.gender && (
                    <li>
                      {listing.preferences.gender === 'MALE' ? 'Solo uomini' :
                       listing.preferences.gender === 'FEMALE' ? 'Solo donne' : ''}
                    </li>
                  )}
                  {listing.preferences.ageMin && listing.preferences.ageMax && (
                    <li>Età: {listing.preferences.ageMin} - {listing.preferences.ageMax} anni</li>
                  )}
                  {listing.preferences.occupation.length > 0 && (
                    <li>
                      {listing.preferences.occupation.length === 1
                        ? `Solo ${listing.preferences.occupation[0].toLowerCase()}`
                        : `${listing.preferences.occupation.join(', ')}`}
                    </li>
                  )}
                  {!listing.rules.couplesAllowed && <li>No coppie</li>}
                </ul>
              </div>
            </section>
          )}

          {/* Rules */}
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
            </div>
            {listing.rules.quietHoursStart && listing.rules.quietHoursEnd && (
              <p className="text-sm text-gray-600 mt-3">
                Ore di silenzio: {listing.rules.quietHoursStart} - {listing.rules.quietHoursEnd}
              </p>
            )}
            {listing.rules.cleaningSchedule && (
              <p className="text-sm text-gray-600 mt-1">
                Pulizie: {listing.rules.cleaningSchedule}
              </p>
            )}
          </section>
        </div>

        {/* Sidebar - Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget
              room={{
                price: listing.price,
                expenses: listing.expenses,
                deposit: listing.deposit,
                virtualTourUrl: listing.virtualTourUrl,
              }}
              availableSlots={slots.map((s) => ({
                date: s.date,
                time: s.startTime,
                type: s.type === 'SINGLE' ? 'single' : 'openday',
              }))}
              landlord={{
                id: listing.landlord.id,
                name: listing.landlord.name,
                responseTime: responseTimeLabel,
                responseRate: listing.landlord.responseRate,
                verified: listing.landlord.verified,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
