import { NextResponse } from 'next/server';
import type { ApiResponse, VisitSlot } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slots = await prisma.visitSlot.findMany({
      where: {
        listingId: params.id,
        date: { gte: new Date() },
      },
      include: {
        bookings: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const data: VisitSlot[] = slots.map((s) => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
      type: s.type,
      maxGuests: s.maxGuests,
      bookedCount: s.bookings.length,
      available: s.bookings.length < s.maxGuests,
    }));

    const response: ApiResponse<VisitSlot[]> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching slots:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error fetching visit slots',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// Create a new visit slot (landlord only)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { landlordId: true },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.landlordId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.startTime || !body.endTime || !body.type) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields: date, startTime, endTime, type' },
        { status: 400 }
      );
    }

    const validTypes = ['SINGLE', 'OPENDAY', 'VIRTUAL'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid visit type' },
        { status: 400 }
      );
    }

    const slot = await prisma.visitSlot.create({
      data: {
        listingId: params.id,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        maxGuests: body.type === 'OPENDAY' ? (body.maxGuests || 5) : 1,
      },
    });

    const data: VisitSlot = {
      id: slot.id,
      date: slot.date.toISOString().split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      maxGuests: slot.maxGuests,
      bookedCount: 0,
      available: true,
    };

    return NextResponse.json<ApiResponse<VisitSlot>>(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating visit slot:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error creating visit slot' },
      { status: 500 }
    );
  }
}
