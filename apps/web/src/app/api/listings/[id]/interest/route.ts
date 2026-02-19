import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const DEFAULT_MAX_INTERESTS = 3;

interface InterestData {
  id: string;
  status: string;
  position: number;
  score: number;
  createdAt: string;
}

// Calculate engagement score based on user profile completeness and activity
async function calculateEngagementScore(tenantId: string): Promise<number> {
  let score = 0;

  const user = await prisma.user.findUnique({
    where: { id: tenantId },
    include: {
      tenantProfile: true,
      bookings: { where: { status: 'COMPLETED' }, take: 5 },
      messages: { take: 10 },
    },
  });

  if (!user) return score;

  // Profile completion (+2)
  const profile = user.tenantProfile;
  if (profile) {
    if (profile.budgetMin && profile.budgetMax) score += 1;
    if (profile.contractType) score += 1;
    if (profile.languages.length > 0) score += 0.5;
    if (profile.hasGuarantor) score += 0.5;
  }

  // Name and bio (+1)
  if (user.name && user.bio) score += 1;

  // Verified profile (+2)
  if (user.verified) score += 2;

  // Prior bookings completed (+5 max)
  score += Math.min(user.bookings.length, 5);

  // Message activity (+3 max)
  score += Math.min(user.messages.length * 0.3, 3);

  return Math.round(score);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role === 'landlord') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'I proprietari non possono esprimere interesse' },
        { status: 403 }
      );
    }

    // Check if listing exists and is active or queue_full (for waiting list)
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, landlordId: true, maxInterested: true },
    });

    if (!listing || !['ACTIVE', 'QUEUE_FULL'].includes(listing.status)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Annuncio non trovato o non disponibile' },
        { status: 404 }
      );
    }

    // Check if user is blocked due to no-shows
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { noShowCount: true, blockedUntil: true },
    });

    if (user?.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      const until = new Date(user.blockedUntil).toLocaleDateString('it-IT');
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Account bloccato fino al ${until} per mancate presenze` },
        { status: 403 }
      );
    }

    // Prevent landlord from expressing interest in own listing
    if (listing.landlordId === session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non puoi esprimere interesse per il tuo annuncio' },
        { status: 403 }
      );
    }

    // Parse optional groupId from body
    let groupId: string | undefined;
    try {
      const body = await request.json();
      groupId = body?.groupId;
    } catch {
      // No body or invalid JSON — solo interest
    }

    // Group application validation
    if (groupId) {
      const callerMembership = await prisma.groupMembership.findUnique({
        where: { groupId_userId: { groupId, userId: session.user.id } },
      });

      if (!callerMembership || callerMembership.status !== 'ACCEPTED') {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Devi essere un membro attivo del gruppo' },
          { status: 403 }
        );
      }

      const acceptedCount = await prisma.groupMembership.count({
        where: { groupId, status: 'ACCEPTED' },
      });

      if (acceptedCount < 2) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Il gruppo deve avere almeno 2 membri per candidarsi' },
          { status: 400 }
        );
      }

      // Check no duplicate group interest for this listing
      const existingGroupInterest = await prisma.interest.findFirst({
        where: { listingId, groupId, status: { in: ['ACTIVE', 'WAITING'] } },
      });

      if (existingGroupInterest) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Il gruppo ha già espresso interesse per questo annuncio' },
          { status: 409 }
        );
      }
    }

    // Check if user already expressed interest (solo)
    const existingInterest = await prisma.interest.findUnique({
      where: {
        listingId_tenantId: {
          listingId,
          tenantId: session.user.id,
        },
      },
    });

    if (existingInterest) {
      // If withdrawn with cooldown still active, block re-express
      if (existingInterest.status === 'WITHDRAWN' && existingInterest.removedAt) {
        const cooldownUntil = new Date(existingInterest.removedAt.getTime() + 24 * 60 * 60 * 1000);
        if (cooldownUntil > new Date()) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Devi attendere 24 ore dal ritiro prima di poter esprimere nuovo interesse' },
            { status: 429 }
          );
        }
        // Cooldown expired — delete old record so we can create a fresh one
        await prisma.interest.delete({ where: { id: existingInterest.id } });
      } else {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Hai già espresso interesse per questo annuncio' },
          { status: 409 }
        );
      }
    }

    // Count active interests
    const activeCount = await prisma.interest.count({
      where: {
        listingId,
        status: 'ACTIVE',
      },
    });

    const maxActive = listing.maxInterested ?? DEFAULT_MAX_INTERESTS;

    // Calculate engagement score
    const score = await calculateEngagementScore(session.user.id);

    // Determine position and status
    const isWaiting = activeCount >= maxActive;
    const position = isWaiting
      ? activeCount + 1
      : activeCount + 1;

    const interest = await prisma.interest.create({
      data: {
        listingId,
        tenantId: session.user.id,
        groupId: groupId || null,
        status: isWaiting ? 'WAITING' : 'ACTIVE',
        position,
        score,
      },
    });

    // When queue reaches maxActive, set listing to QUEUE_FULL
    if (!isWaiting) {
      const newActiveCount = activeCount + 1;
      if (newActiveCount >= maxActive) {
        await prisma.listing.update({
          where: { id: listingId },
          data: { status: 'QUEUE_FULL' },
        });
      }
    }

    const data: InterestData = {
      id: interest.id,
      status: interest.status,
      position: interest.position,
      score: interest.score,
      createdAt: interest.createdAt.toISOString(),
    };

    const message = isWaiting
      ? `Sei in lista d'attesa (posizione ${position - maxActive})`
      : groupId
      ? 'Interesse del gruppo registrato con successo'
      : 'Interesse registrato con successo';

    return NextResponse.json<ApiResponse<InterestData>>({
      success: true,
      data,
      message,
    });
  } catch (error) {
    console.error('Error creating interest:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante la registrazione dell\'interesse' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find and delete the interest
    const interest = await prisma.interest.findUnique({
      where: {
        listingId_tenantId: {
          listingId,
          tenantId: session.user.id,
        },
      },
    });

    if (!interest) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Interesse non trovato' },
        { status: 404 }
      );
    }

    // Fetch listing to get maxInterested
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { maxInterested: true },
    });
    const maxActive = listing?.maxInterested ?? DEFAULT_MAX_INTERESTS;

    await prisma.interest.update({
      where: { id: interest.id },
      data: { status: 'WITHDRAWN', removedAt: new Date() },
    });

    // Promote next waiting user if we were in active slots
    if (interest.status === 'ACTIVE') {
      const nextWaiting = await prisma.interest.findFirst({
        where: {
          listingId,
          status: 'WAITING',
        },
        orderBy: [
          { score: 'desc' },
          { createdAt: 'asc' },
        ],
      });

      if (nextWaiting) {
        await prisma.interest.update({
          where: { id: nextWaiting.id },
          data: {
            status: 'ACTIVE',
            position: interest.position,
          },
        });
      }

      // Check if listing should go back to ACTIVE
      const remainingActive = await prisma.interest.count({
        where: { listingId, status: 'ACTIVE' },
      });

      if (remainingActive < maxActive) {
        await prisma.listing.update({
          where: { id: listingId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Interesse ritirato',
    });
  } catch (error) {
    console.error('Error withdrawing interest:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante il ritiro dell\'interesse' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    // Get listing with owner check
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { landlordId: true, maxInterested: true },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Annuncio non trovato' },
        { status: 404 }
      );
    }

    // If user is logged in, check their interest status
    const userInterest = session?.user?.id
      ? await prisma.interest.findUnique({
          where: {
            listingId_tenantId: {
              listingId,
              tenantId: session.user.id,
            },
          },
        })
      : null;

    // Check cooldown from withdrawn interest
    let cooldownUntil: string | null = null;
    if (userInterest?.status === 'WITHDRAWN' && userInterest.removedAt) {
      const until = new Date(userInterest.removedAt.getTime() + 24 * 60 * 60 * 1000);
      if (until > new Date()) {
        cooldownUntil = until.toISOString();
      }
    }

    // Also check across all listings for total user interest count
    let totalUserInterests = 0;
    const maxUserInterests = 8;
    if (session?.user?.id) {
      totalUserInterests = await prisma.interest.count({
        where: {
          tenantId: session.user.id,
          status: { in: ['ACTIVE', 'WAITING'] },
        },
      });
    }

    // Count interests
    const counts = await prisma.interest.groupBy({
      by: ['status'],
      where: { listingId },
      _count: true,
    });

    const activeCount = counts.find((c: { status: string; _count: number }) => c.status === 'ACTIVE')?._count ?? 0;
    const waitingCount = counts.find((c: { status: string; _count: number }) => c.status === 'WAITING')?._count ?? 0;

    const maxActive = listing.maxInterested ?? DEFAULT_MAX_INTERESTS;

    // For withdrawn interests under cooldown, don't show them as "userInterest"
    const visibleUserInterest = userInterest && ['ACTIVE', 'WAITING'].includes(userInterest.status)
      ? userInterest
      : null;

    const data = {
      canExpress: !visibleUserInterest && activeCount < maxActive && !cooldownUntil,
      queueFull: activeCount >= maxActive,
      activeCount,
      waitingCount,
      maxActive,
      userInterest: visibleUserInterest
        ? {
            status: visibleUserInterest.status,
            position: visibleUserInterest.position,
            score: visibleUserInterest.score,
          }
        : null,
      cooldownUntil,
      totalUserInterests,
      maxUserInterests,
    };

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching interest status:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento dello stato interesse' },
      { status: 500 }
    );
  }
}
