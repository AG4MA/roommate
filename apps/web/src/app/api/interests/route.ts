import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET — fetch all listings the current user has expressed interest in
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const interests = await prisma.interest.findMany({
      where: {
        tenantId: session.user.id,
        status: { in: ['ACTIVE', 'WAITING'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            features: true,
            roommates: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = interests.map((interest) => {
      const listing = interest.listing;
      return {
        id: interest.id,
        status: interest.status,
        position: interest.position,
        score: interest.score,
        schedulingApproved: interest.schedulingApproved,
        createdAt: interest.createdAt.toISOString(),
        group: interest.group
          ? { id: interest.group.id, name: interest.group.name }
          : null,
        listing: {
          id: listing.id,
          title: listing.title,
          address: listing.address,
          city: listing.city,
          neighborhood: listing.neighborhood,
          price: listing.price,
          expenses: listing.expenses,
          roomType: listing.roomType,
          roomSize: listing.roomSize,
          availableFrom: listing.availableFrom?.toISOString() ?? null,
          images: listing.images.map((img: any) => ({ url: img.url })),
          status: listing.status,
        },
      };
    });

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento degli interessi' },
      { status: 500 }
    );
  }
}
