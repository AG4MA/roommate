import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse, ListingCard, ListingDetail } from '@roommate/shared';
import { createListingSchema } from '@roommate/shared';
import { matchListingAgainstWishes } from '@/lib/wish-matcher';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const city = searchParams.get('city');
  const priceMin = searchParams.get('priceMin') || searchParams.get('minPrice');
  const priceMax = searchParams.get('priceMax') || searchParams.get('maxPrice');
  const roomType = searchParams.get('roomType');
  const mine = searchParams.get('mine') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  // Bounding box params for map-based search
  const north = searchParams.get('north');
  const south = searchParams.get('south');
  const east = searchParams.get('east');
  const west = searchParams.get('west');

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  // If fetching landlord's own listings, show all statuses; otherwise only active
  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    where.landlordId = session.user.id;
  } else {
    where.status = 'ACTIVE';
  }

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

  // Bounding box filter (map-based search)
  if (north && south && east && west) {
    where.latitude = { gte: parseFloat(south), lte: parseFloat(north) };
    where.longitude = { gte: parseFloat(west), lte: parseFloat(east) };
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
          reviews: { where: { hidden: false }, select: { rating: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const items = listings.map((l) => {
      const visibleReviews = (l as any).reviews || [];
      const reviewCount = visibleReviews.length;
      const avgRating = reviewCount > 0
        ? Math.round((visibleReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : null;

      return {
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
        images: l.images.map((img) => ({ url: img.url, thumbnailUrl: img.thumbnailUrl })),
        features: {
          wifi: l.features?.wifi ?? false,
          furnished: l.features?.furnished ?? false,
          privateBath: l.features?.privateBath ?? false,
        },
        currentRoommates: l.roommates.length,
        maxRoommates: l.roommates.length + 1,
        latitude: l.latitude,
        longitude: l.longitude,
        avgRating,
        reviewCount,
        // Extra fields for landlord dashboard
        ...(mine ? {
          status: l.status,
          views: l.views,
          publishedAt: l.publishedAt?.toISOString() ?? null,
          expiresAt: l.expiresAt?.toISOString() ?? null,
          createdAt: l.createdAt.toISOString(),
        } : {}),
      };
    });

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = createListingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Determine if we should publish immediately or save as draft
    const shouldPublish = body.publish === true;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const listing = await prisma.listing.create({
      data: {
        landlordId: session.user.id,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        roomType: data.roomType,
        roomSize: data.roomSize,
        totalSize: data.totalSize,
        floor: data.floor,
        hasElevator: data.hasElevator,
        price: data.price,
        expenses: data.expenses,
        deposit: data.deposit,
        availableFrom: new Date(data.availableFrom),
        minStay: data.minStay,
        maxStay: data.maxStay,
        maxInterested: body.maxInterested ?? 3,
        videoUrl: body.videoUrl || null,
        status: shouldPublish ? 'ACTIVE' : 'DRAFT',
        publishedAt: shouldPublish ? now : null,
        expiresAt: shouldPublish ? expiresAt : null,
        // Create related records
        features: body.features
          ? { create: body.features }
          : undefined,
        rules: body.rules
          ? { create: body.rules }
          : undefined,
        preferences: body.preferences
          ? { create: body.preferences }
          : undefined,
        images: body.images?.length
          ? {
              create: body.images.map((img: { url: string; thumbnailUrl?: string; caption?: string }, idx: number) => ({
                url: img.url,
                thumbnailUrl: img.thumbnailUrl || null,
                order: idx,
                caption: img.caption || null,
              })),
            }
          : undefined,
        roommates: body.roommates?.length
          ? {
              create: body.roommates.map((r: { name: string; age?: number; occupation?: string; bio?: string }) => ({
                name: r.name,
                age: r.age || null,
                occupation: r.occupation || null,
                bio: r.bio || null,
              })),
            }
          : undefined,
      },
    });

    // Update landlord's total listings count
    await prisma.landlordProfile.update({
      where: { userId: session.user.id },
      data: { totalListings: { increment: 1 } },
    });

    // Trigger wish matching engine for published listings (fire-and-forget)
    if (shouldPublish) {
      matchListingAgainstWishes(listing.id).catch(err =>
        console.error('Wish matching failed:', err)
      );
    }

    return NextResponse.json<ApiResponse<{ id: string }>>(
      {
        success: true,
        data: { id: listing.id },
        message: shouldPublish
          ? 'Annuncio pubblicato con successo'
          : 'Bozza salvata con successo',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante la creazione dell'annuncio" },
      { status: 500 }
    );
  }
}
