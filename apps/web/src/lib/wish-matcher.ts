import { prisma } from '@roommate/database';
import { notifyWishMatched } from '@/lib/notifications';

/**
 * Wish Matching Engine
 * 
 * Checks newly published listings against all active wishes.
 * When a match is found:
 *   1. Automatically creates an Interest in WAITING status (FIFO by wish createdAt)
 *   2. Sends notification email to the wish owner
 *   3. Updates wish.lastMatchedAt
 * 
 * Matching criteria:
 *   - city (exact, case-insensitive)
 *   - price range (listing.price within wish.priceMin–priceMax)
 *   - room type (listing.roomType in wish.roomTypes)
 *   - minimum size (listing.roomSize >= wish.minSize)
 *   - features (all requested features must be present)
 *   - neighborhoods (if specified, listing.neighborhood must match one)
 */

interface MatchResult {
  wishId: string;
  userId: string;
  interestCreated: boolean;
  notified: boolean;
}

export async function matchListingAgainstWishes(listingId: string): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  // Fetch the listing with features
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      features: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  if (!listing || listing.status !== 'ACTIVE') {
    return results;
  }

  // Fetch all active wishes
  const activeWishes = await prisma.wish.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' }, // FIFO: earlier wishes get priority
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  for (const wish of activeWishes) {
    // Skip if the wish owner is the listing landlord
    if (wish.userId === listing.landlordId) continue;

    // Check match
    if (!doesListingMatchWish(listing, wish)) continue;

    const result: MatchResult = {
      wishId: wish.id,
      userId: wish.userId,
      interestCreated: false,
      notified: false,
    };

    try {
      // Check if this user already has an interest on this listing
      const existingInterest = await prisma.interest.findUnique({
        where: {
          listingId_tenantId: {
            listingId: listing.id,
            tenantId: wish.userId,
          },
        },
      });

      if (!existingInterest) {
        // Check user's active interest count (max 8)
        const activeInterestCount = await prisma.interest.count({
          where: {
            tenantId: wish.userId,
            status: { in: ['ACTIVE', 'WAITING'] },
          },
        });

        if (activeInterestCount < 8) {
          // Get next position in queue
          const maxPosition = await prisma.interest.aggregate({
            where: { listingId: listing.id },
            _max: { position: true },
          });

          const nextPosition = (maxPosition._max.position ?? 0) + 1;

          // Create interest automatically
          await prisma.interest.create({
            data: {
              listingId: listing.id,
              tenantId: wish.userId,
              status: nextPosition <= 3 ? 'ACTIVE' : 'WAITING',
              position: nextPosition,
              score: 0, // Will be calculated by the scoring engine
            },
          });

          result.interestCreated = true;
        }
      }

      // Send notification (email + push) respecting user preferences
      if (wish.emailNotify || wish.pushNotify) {
        try {
          await notifyWishMatched(
            wish.userId,
            wish.name || 'la tua ricerca',
            wish.id,
            [{
              id: listing.id,
              title: listing.title,
              price: listing.price,
              city: listing.city,
            }]
          );
          result.notified = true;
        } catch (notifyErr) {
          console.error(`Failed to send wish match notification to ${wish.userId}:`, notifyErr);
        }
      }

      // Update wish lastMatchedAt
      await prisma.wish.update({
        where: { id: wish.id },
        data: { lastMatchedAt: new Date() },
      });

      results.push(result);
    } catch (error) {
      console.error(`Error processing wish ${wish.id} for listing ${listingId}:`, error);
    }
  }

  return results;
}

function doesListingMatchWish(
  listing: {
    city: string;
    neighborhood: string | null;
    price: number;
    roomType: string;
    roomSize: number;
    features: Record<string, unknown> | null;
  },
  wish: {
    city: string | null;
    neighborhoods: string[];
    priceMin: number | null;
    priceMax: number | null;
    roomTypes: string[];
    minSize: number | null;
    features: string[];
  }
): boolean {
  // City match (required if specified)
  if (wish.city) {
    if (listing.city.toLowerCase() !== wish.city.toLowerCase()) return false;
  }

  // Neighborhood match (any of the specified neighborhoods)
  if (wish.neighborhoods.length > 0) {
    if (!listing.neighborhood) return false;
    const listingNeighborhood = listing.neighborhood.toLowerCase();
    const matchesNeighborhood = wish.neighborhoods.some(
      n => listingNeighborhood.includes(n.toLowerCase()) || n.toLowerCase().includes(listingNeighborhood)
    );
    if (!matchesNeighborhood) return false;
  }

  // Price range
  if (wish.priceMin !== null && listing.price < wish.priceMin) return false;
  if (wish.priceMax !== null && listing.price > wish.priceMax) return false;

  // Room type (any of the specified types)
  if (wish.roomTypes.length > 0) {
    if (!wish.roomTypes.includes(listing.roomType)) return false;
  }

  // Minimum size
  if (wish.minSize !== null && listing.roomSize < wish.minSize) return false;

  // Features (all requested must be present)
  if (wish.features.length > 0 && listing.features) {
    for (const feature of wish.features) {
      if (listing.features[feature] !== true) return false;
    }
  }

  return true;
}

/**
 * Batch matching: check all active wishes against all recently published listings.
 * Used by cron job as fallback to catch any listings that weren't matched in real-time.
 */
export async function batchMatchWishes(): Promise<{ matched: number; interests: number }> {
  // Find listings published in the last 24h that haven't been checked yet
  const recentListings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      publishedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    select: { id: true },
  });

  let totalMatched = 0;
  let totalInterests = 0;

  for (const listing of recentListings) {
    const results = await matchListingAgainstWishes(listing.id);
    if (results.length > 0) {
      totalMatched++;
      totalInterests += results.filter(r => r.interestCreated).length;
    }
  }

  return { matched: totalMatched, interests: totalInterests };
}
