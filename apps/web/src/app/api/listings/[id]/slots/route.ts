import { NextResponse } from 'next/server';
import type { ApiResponse, VisitSlot } from '@roommate/shared';
import { prisma } from '@roommate/database';

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
