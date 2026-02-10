import { NextResponse } from 'next/server';
import type { ApiResponse, ListingDetail } from '@roommate/shared';

// Mock data dettagliato
const mockListingDetail: ListingDetail = {
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
  roomType: 'SINGLE',
  roomSize: 14,
  totalSize: 85,
  floor: 3,
  hasElevator: true,
  availableFrom: '2024-03-01',
  minStay: 6,
  maxStay: null,
  images: [
    { url: '/placeholder-1.jpg' },
    { url: '/placeholder-2.jpg' },
    { url: '/placeholder-3.jpg' },
  ],
  features: {
    wifi: true,
    furnished: true,
    privateBath: false,
    balcony: true,
    aircon: true,
    heating: true,
    washingMachine: true,
    dishwasher: true,
    parking: false,
    garden: false,
    terrace: false,
  },
  rules: {
    petsAllowed: false,
    smokingAllowed: false,
    couplesAllowed: false,
    guestsAllowed: true,
    cleaningSchedule: 'A turni settimanali',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  preferences: {
    gender: null,
    ageMin: 23,
    ageMax: 35,
    occupation: ['WORKING', 'STUDENT'],
    languages: ['italiano', 'inglese'],
  },
  roommates: [
    { id: '1', name: 'Marco', age: 28, occupation: 'Software Developer', bio: null, avatar: null },
    { id: '2', name: 'Luca', age: 26, occupation: 'Marketing Manager', bio: null, avatar: null },
  ],
  landlord: {
    id: '1',
    name: 'Anna Rossi',
    avatar: null,
    verified: true,
    createdAt: '2023-01-15',
    responseRate: 95,
    responseTime: 45,
    totalListings: 3,
  },
  currentRoommates: 2,
  maxRoommates: 3,
  latitude: 45.4773,
  longitude: 9.2055,
  virtualTourUrl: null,
  views: 234,
  createdAt: '2024-01-20',
  publishedAt: '2024-01-20',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In produzione, fetch dal database con Prisma
  // const listing = await prisma.listing.findUnique({ where: { id: params.id }, ... });

  if (params.id !== '1') {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Annuncio non trovato',
    };
    return NextResponse.json(response, { status: 404 });
  }

  const response: ApiResponse<ListingDetail> = {
    success: true,
    data: mockListingDetail,
  };

  return NextResponse.json(response);
}
