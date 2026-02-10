import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse, ListingCard } from '@roommate/shared';

// Mock data per sviluppo - verrà sostituito con Prisma
const mockListings: ListingCard[] = [
  {
    id: '1',
    title: 'Stanza singola luminosa - Porta Venezia',
    address: 'Via Lecco 15, Milano',
    city: 'Milano',
    neighborhood: 'Porta Venezia',
    price: 550,
    expenses: 80,
    roomType: 'SINGLE',
    roomSize: 14,
    availableFrom: '2024-03-01',
    images: [{ url: '/placeholder.jpg' }],
    features: { wifi: true, furnished: true, privateBath: false },
    currentRoommates: 2,
    maxRoommates: 3,
    latitude: 45.4773,
    longitude: 9.2055,
  },
  {
    id: '2',
    title: 'Ampia stanza doppia con bagno privato',
    address: 'Via Padova 120, Milano',
    city: 'Milano',
    neighborhood: 'Loreto',
    price: 450,
    expenses: 70,
    roomType: 'DOUBLE',
    roomSize: 18,
    availableFrom: '2024-02-15',
    images: [{ url: '/placeholder.jpg' }],
    features: { wifi: true, furnished: true, privateBath: true },
    currentRoommates: 1,
    maxRoommates: 2,
    latitude: 45.4951,
    longitude: 9.2264,
  },
  {
    id: '3',
    title: 'Monolocale accogliente zona Navigli',
    address: 'Ripa di Porta Ticinese 55, Milano',
    city: 'Milano',
    neighborhood: 'Navigli',
    price: 750,
    expenses: 50,
    roomType: 'STUDIO',
    roomSize: 28,
    availableFrom: '2024-03-15',
    images: [{ url: '/placeholder.jpg' }],
    features: { wifi: true, furnished: true, privateBath: true },
    currentRoommates: 0,
    maxRoommates: 1,
    latitude: 45.4485,
    longitude: 9.1769,
  },
  {
    id: '4',
    title: 'Stanza singola in appartamento ristrutturato',
    address: 'Corso Buenos Aires 36, Milano',
    city: 'Milano',
    neighborhood: 'Buenos Aires',
    price: 600,
    expenses: 90,
    roomType: 'SINGLE',
    roomSize: 12,
    availableFrom: '2024-02-20',
    images: [{ url: '/placeholder.jpg' }],
    features: { wifi: true, furnished: true, privateBath: false },
    currentRoommates: 3,
    maxRoommates: 4,
    latitude: 45.4815,
    longitude: 9.2127,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const city = searchParams.get('city');
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const roomType = searchParams.get('roomType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Filter listings
  let filteredListings = [...mockListings];

  if (city) {
    filteredListings = filteredListings.filter(
      l => l.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (priceMin) {
    filteredListings = filteredListings.filter(
      l => l.price >= parseInt(priceMin)
    );
  }

  if (priceMax) {
    filteredListings = filteredListings.filter(
      l => l.price <= parseInt(priceMax)
    );
  }

  if (roomType) {
    filteredListings = filteredListings.filter(
      l => l.roomType === roomType
    );
  }

  // Pagination
  const total = filteredListings.length;
  const startIndex = (page - 1) * limit;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + limit);

  const response: ApiResponse<PaginatedResponse<ListingCard>> = {
    success: true,
    data: {
      items: paginatedListings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return NextResponse.json(response);
}
