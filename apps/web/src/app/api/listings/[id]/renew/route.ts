import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const LISTING_DURATION_DAYS = 30;

interface RenewResult {
  id: string;
  newExpiresAt: string;
}

/**
 * POST /api/listings/[id]/renew
 * 
 * Renew an ACTIVE or EXPIRED listing for another 30 days.
 * Only the listing owner can renew.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        landlordId: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Annuncio non trovato' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (listing.landlordId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non sei autorizzato a rinnovare questo annuncio' },
        { status: 403 }
      );
    }

    // Can only renew ACTIVE or EXPIRED listings
    if (!['ACTIVE', 'EXPIRED'].includes(listing.status)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Puoi rinnovare solo annunci attivi o scaduti' },
        { status: 400 }
      );
    }

    // Calculate new expiry date
    const now = new Date();
    const newExpiresAt = new Date(now);
    newExpiresAt.setDate(newExpiresAt.getDate() + LISTING_DURATION_DAYS);

    // Update the listing
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        expiresAt: newExpiresAt,
        publishedAt: listing.status === 'EXPIRED' ? now : undefined, // Reset publishedAt if was expired
      },
    });

    // If listing was expired, reactivate interests that were waiting
    if (listing.status === 'EXPIRED') {
      await prisma.interest.updateMany({
        where: {
          listingId: id,
          status: 'EXPIRED',
        },
        data: {
          status: 'WAITING', // Put them back on waiting list to be fairly reprocessed
        },
      });
    }

    const result: RenewResult = {
      id: updated.id,
      newExpiresAt: newExpiresAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<RenewResult>>({
      success: true,
      data: result,
      message: 'Annuncio rinnovato per altri 30 giorni',
    });
  } catch (error) {
    console.error('Error renewing listing:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante il rinnovo dell\'annuncio' },
      { status: 500 }
    );
  }
}
