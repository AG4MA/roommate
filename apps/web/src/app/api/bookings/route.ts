import { NextResponse } from 'next/server';
import type { ApiResponse, Booking } from '@roommate/shared';
import { createBookingSchema, calculateAge } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to build a TenantProfileCard from Prisma user+profile
function buildTenantCard(tenant: any) {
  return {
    id: tenant.id,
    name: tenant.name,
    avatar: tenant.avatar,
    age: tenant.dateOfBirth ? calculateAge(tenant.dateOfBirth) : null,
    gender: tenant.gender,
    occupation: tenant.occupation,
    verified: tenant.verified,
    budgetMin: tenant.tenantProfile?.budgetMin ?? null,
    budgetMax: tenant.tenantProfile?.budgetMax ?? null,
    moveInDate: tenant.tenantProfile?.moveInDate?.toISOString() ?? null,
    contractType: tenant.tenantProfile?.contractType ?? null,
    smoker: tenant.tenantProfile?.smoker ?? false,
    hasPets: tenant.tenantProfile?.hasPets ?? false,
    hasGuarantor: tenant.tenantProfile?.hasGuarantor ?? false,
    incomeRange: tenant.tenantProfile?.incomeRange ?? null,
    languages: tenant.tenantProfile?.languages ?? [],
    referencesAvailable: tenant.tenantProfile?.referencesAvailable ?? false,
    employmentVerified: tenant.tenantProfile?.employmentVerified ?? false,
    incomeVerified: tenant.tenantProfile?.incomeVerified ?? false,
  };
}

// Helper to build a ListingCard from Prisma listing
function buildListingCard(listing: any) {
  return {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    city: listing.city,
    neighborhood: listing.neighborhood,
    price: listing.price,
    expenses: listing.expenses,
    roomType: listing.roomType,
    roomSize: listing.roomSize,
    availableFrom: listing.availableFrom.toISOString(),
    images: listing.images.map((img: any) => ({ url: img.url })),
    features: {
      wifi: listing.features?.wifi ?? false,
      furnished: listing.features?.furnished ?? false,
      privateBath: listing.features?.privateBath ?? false,
    },
    currentRoommates: listing.roommates.length,
    maxRoommates: listing.roommates.length + 1,
    latitude: listing.latitude,
    longitude: listing.longitude,
  };
}

// Helper to build a VisitSlot from Prisma slot
function buildSlotData(slot: any) {
  return {
    id: slot.id,
    date: slot.date.toISOString().split('T')[0],
    startTime: slot.startTime,
    endTime: slot.endTime,
    type: slot.type,
    maxGuests: slot.maxGuests,
    bookedCount: slot.bookings.length,
    available: slot.bookings.length < slot.maxGuests,
  };
}

const bookingIncludes = {
  slot: { include: { bookings: true } },
  listing: {
    include: {
      images: { orderBy: { order: 'asc' as const }, take: 1 },
      features: true,
      roommates: true,
    },
  },
  tenant: {
    include: { tenantProfile: true },
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate core booking fields
    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: result.error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // TODO: Replace with session auth (Phase 1)
    const tenantId = body.tenantId as string | undefined;
    if (!tenantId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify the slot exists and is still available
    const slot = await prisma.visitSlot.findUnique({
      where: { id: result.data.slotId },
      include: { bookings: true },
    });

    if (!slot) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Slot non trovato',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (slot.bookings.length >= slot.maxGuests) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Slot non più disponibile',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Check for duplicate booking
    const existingBooking = await prisma.booking.findUnique({
      where: {
        slotId_tenantId: {
          slotId: result.data.slotId,
          tenantId,
        },
      },
    });

    if (existingBooking) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Hai già prenotato questo slot',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        slotId: result.data.slotId,
        listingId: slot.listingId,
        tenantId,
        message: result.data.message || null,
      },
      include: bookingIncludes,
    });

    const data: Booking = {
      id: booking.id,
      slot: buildSlotData(booking.slot),
      listing: buildListingCard(booking.listing),
      tenant: buildTenantCard(booking.tenant),
      status: booking.status,
      message: booking.message,
      createdAt: booking.createdAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
    };

    const response: ApiResponse<Booking> = {
      success: true,
      data,
      message: 'Prenotazione creata con successo',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Errore durante la creazione della prenotazione',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // TODO: Replace with session auth (Phase 1)
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'tenant';

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const whereClause =
      role === 'landlord'
        ? { listing: { landlordId: userId } }
        : { tenantId: userId };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: bookingIncludes,
      orderBy: { createdAt: 'desc' },
    });

    const data: Booking[] = bookings.map((b) => ({
      id: b.id,
      slot: buildSlotData(b.slot),
      listing: buildListingCard(b.listing),
      tenant: buildTenantCard(b.tenant),
      status: b.status,
      message: b.message,
      createdAt: b.createdAt.toISOString(),
      confirmedAt: b.confirmedAt?.toISOString() ?? null,
    }));

    const response: ApiResponse<Booking[]> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error fetching bookings',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH — update booking status (confirm, cancel, complete, no_show)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, status } = body as { bookingId: string; status: string };

    const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    if (!bookingId || !validStatuses.includes(status)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'bookingId e status valido richiesti' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { landlordId: true } } },
    });

    if (!booking) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }

    // Only landlord can confirm/complete/no_show; both can cancel
    const isLandlord = booking.listing.landlordId === session.user.id;
    const isTenant = booking.tenantId === session.user.id;

    if (status === 'CANCELLED' && !isLandlord && !isTenant) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    if (['CONFIRMED', 'COMPLETED', 'NO_SHOW'].includes(status) && !isLandlord) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo il proprietario può confermare/completare le prenotazioni' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    // Handle no-show: increment counter, block if ≥ 3
    if (status === 'NO_SHOW') {
      const updatedUser = await prisma.user.update({
        where: { id: booking.tenantId },
        data: { noShowCount: { increment: 1 } },
      });

      if (updatedUser.noShowCount >= 3 && !updatedUser.blockedUntil) {
        const blockedUntil = new Date();
        blockedUntil.setMonth(blockedUntil.getMonth() + 3);
        await prisma.user.update({
          where: { id: booking.tenantId },
          data: { blockedUntil },
        });
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: `Prenotazione aggiornata a ${status}`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}
