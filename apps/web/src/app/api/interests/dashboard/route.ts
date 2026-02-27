import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface DashboardInterest {
  id: string;
  status: 'ACTIVE' | 'WAITING';
  position: number;
  schedulingApproved: boolean;
  listing: {
    id: string;
    title: string;
    city: string;
    price: number;
    roomType: string;
    thumbnailUrl: string | null;
    status: string;
  };
}

interface DashboardBooking {
  id: string;
  status: string;
  message: string | null;
  listing: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
}

interface CercatoreDashboard {
  interests: {
    items: DashboardInterest[];
    activeCount: number;
    waitingCount: number;
    totalCount: number;
    maxAllowed: number;
  };
  appointments: {
    items: DashboardBooking[];
    pendingCount: number;
    confirmedCount: number;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch interests (active + waiting) with listing summary
    const interests = await (prisma.interest as any).findMany({
      where: {
        tenantId: userId,
        status: { in: ['ACTIVE', 'WAITING'] },
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { position: 'asc' },
      ],
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            roomType: true,
            status: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1,
              select: { thumbnailUrl: true, url: true },
            },
          },
        },
      },
    }) as any[];

    const activeCount = interests.filter((i: any) => i.status === 'ACTIVE').length;
    const waitingCount = interests.filter((i: any) => i.status === 'WAITING').length;

    const interestItems: DashboardInterest[] = interests.map((i: any) => ({
      id: i.id,
      status: i.status as 'ACTIVE' | 'WAITING',
      position: i.position,
      schedulingApproved: i.schedulingApproved,
      listing: {
        id: i.listing.id,
        title: i.listing.title,
        city: i.listing.city,
        price: i.listing.price,
        roomType: i.listing.roomType,
        thumbnailUrl: i.listing.images[0]?.thumbnailUrl ?? i.listing.images[0]?.url ?? null,
        status: i.listing.status,
      },
    }));

    // Fetch upcoming bookings (PENDING or CONFIRMED, future slots only)
    const now = new Date();
    const bookings = await prisma.booking.findMany({
      where: {
        tenantId: userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        slot: {
          date: { gte: now },
        },
      },
      orderBy: {
        slot: { date: 'asc' },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            address: true,
          },
        },
        slot: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            type: true,
          },
        },
      },
    });

    const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
    const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

    const bookingItems: DashboardBooking[] = bookings.map((b) => ({
      id: b.id,
      status: b.status,
      message: b.message,
      listing: {
        id: b.listing.id,
        title: b.listing.title,
        city: b.listing.city,
        address: b.listing.address,
      },
      slot: {
        date: b.slot.date.toISOString().split('T')[0],
        startTime: b.slot.startTime,
        endTime: b.slot.endTime,
        type: b.slot.type,
      },
    }));

    const dashboard: CercatoreDashboard = {
      interests: {
        items: interestItems,
        activeCount,
        waitingCount,
        totalCount: activeCount + waitingCount,
        maxAllowed: 8,
      },
      appointments: {
        items: bookingItems,
        pendingCount,
        confirmedCount,
      },
    };

    return NextResponse.json<ApiResponse<CercatoreDashboard>>({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Error fetching cercatore dashboard:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento della dashboard' },
      { status: 500 }
    );
  }
}
