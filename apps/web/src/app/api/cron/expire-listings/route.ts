import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { notify } from '@/lib/notifications';

const LISTING_DURATION_DAYS = 30;
const WARNING_DAYS_BEFORE = 5; // 25 days = 30 - 5

interface ExpiryCheckResult {
  expired: number;
  warnings: number;
}

/**
 * POST /api/cron/expire-listings
 * 
 * Called by a cron job (e.g., Vercel Cron, GitHub Actions) to:
 * 1. Expire listings that have passed their expiresAt date
 * 2. Send warnings to listings expiring in 5 days
 * 
 * Requires CRON_SECRET header for authentication
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const warningDate = new Date(now);
    warningDate.setDate(warningDate.getDate() + WARNING_DAYS_BEFORE);

    // 1. Expire listings past their expiry date
    const expiredListings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        landlordId: true,
        landlord: { select: { email: true, name: true } },
      },
    });

    const expiredResult = await prisma.listing.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Also update associated interests
    await prisma.interest.updateMany({
      where: {
        listing: {
          status: 'EXPIRED',
        },
        status: { in: ['ACTIVE', 'WAITING'] },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Send expired notifications (email + push)
    for (const listing of expiredListings) {
      if (listing.landlordId) {
        notify({
          userId: listing.landlordId,
          type: 'LISTING_EXPIRED',
          data: { listingTitle: listing.title, listingId: listing.id },
        }).catch(err => console.error('[NOTIFY ERROR]', err));
      }
    }

    // 2. Find listings expiring soon (for notifications)
    const expiringListings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          gt: now,
          lte: warningDate,
        },
      },
      select: {
        id: true,
        title: true,
        expiresAt: true,
        landlordId: true,
        landlord: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Send expiring warning notifications (email + push)
    for (const listing of expiringListings) {
      if (listing.landlordId && listing.expiresAt) {
        const daysLeft = Math.ceil((listing.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        notify({
          userId: listing.landlordId,
          type: 'LISTING_EXPIRING',
          data: { listingTitle: listing.title, listingId: listing.id, daysLeft },
        }).catch(err => console.error('[NOTIFY ERROR]', err));
      }
    }

    const result: ExpiryCheckResult = {
      expired: expiredResult.count,
      warnings: expiringListings.length,
    };

    return NextResponse.json<ApiResponse<ExpiryCheckResult>>({
      success: true,
      data: result,
      message: `Expired ${result.expired} listings, sent ${result.warnings} warnings`,
    });
  } catch (error) {
    console.error('Error in expire-listings cron:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error processing listing expiry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-listings
 * 
 * Health check endpoint for the cron job
 */
export async function GET() {
  const now = new Date();

  // Count listings by status
  const counts = await prisma.listing.groupBy({
    by: ['status'],
    _count: true,
  });

  // Count listings expiring soon
  const warningDate = new Date(now);
  warningDate.setDate(warningDate.getDate() + WARNING_DAYS_BEFORE);

  const expiringSoon = await prisma.listing.count({
    where: {
      status: 'ACTIVE',
      expiresAt: {
        gt: now,
        lte: warningDate,
      },
    },
  });

  const data = {
    currentTime: now.toISOString(),
    listingDurationDays: LISTING_DURATION_DAYS,
    warningDaysBefore: WARNING_DAYS_BEFORE,
    statusCounts: counts.reduce(
      (acc: Record<string, number>, c: { status: string; _count: number }) => ({ ...acc, [c.status]: c._count }),
      {} as Record<string, number>
    ),
    expiringSoon,
  };

  return NextResponse.json<ApiResponse<typeof data>>({
    success: true,
    data,
  });
}
