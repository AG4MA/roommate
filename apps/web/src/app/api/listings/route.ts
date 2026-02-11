import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse, ListingCard } from '@roommate/shared';
import { prisma } from '@roommate/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const city = searchParams.get('city');
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const roomType = searchParams.get('roomType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Build Prisma where clause
  const where: Record<string, unknown> = {
    status: 'ACTIVE',
  };

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) (where.price as Record<string, number>).gte = parseInt(priceMin);
    if (priceMax) (where.price as Record<string, number>).lte = parseInt(priceMax);
  }

  if (roomType) {
    where.roomType = roomType;
  }

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          images: { orderBy: { order: 'asc' }, take: 3 },
          features: true,
          roommates: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const items: ListingCard[] = listings.map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      city: l.city,
      neighborhood: l.neighborhood,
      price: l.price,
      expenses: l.expenses,
      roomType: l.roomType,
      roomSize: l.roomSize,
      availableFrom: l.availableFrom.toISOString(),
      images: l.images.map((img) => ({ url: img.url })),
      features: {
        wifi: l.features?.wifi ?? false,
        furnished: l.features?.furnished ?? false,
        privateBath: l.features?.privateBath ?? false,
      },
      currentRoommates: l.roommates.length,
      maxRoommates: l.roommates.length + 1, // Listing is for one more person
      latitude: l.latitude,
      longitude: l.longitude,
    }));

    const response: ApiResponse<PaginatedResponse<ListingCard>> = {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching listings:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error fetching listings',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
