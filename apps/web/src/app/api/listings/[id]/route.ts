import { NextResponse } from 'next/server';
import type { ApiResponse, ListingDetail } from '@roommate/shared';
import { prisma } from '@roommate/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
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

    if (!listing) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Listing not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    const detail: ListingDetail = {
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

    const response: ApiResponse<ListingDetail> = {
      success: true,
      data: detail,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching listing:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error fetching listing',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
