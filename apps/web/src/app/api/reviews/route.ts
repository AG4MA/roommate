import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

// GET — reviews for a listing (public) or "my reviews" if mine=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');
  const mine = searchParams.get('mine') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (mine) {
      // User's own reviews
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
      }

      const [reviews, total] = await Promise.all([
        (prisma as any).review.findMany({
          where: { authorId: session.user.id },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            listing: {
              select: { id: true, title: true, city: true, neighborhood: true, images: { take: 1, orderBy: { order: 'asc' } } },
            },
          },
        }),
        (prisma as any).review.count({ where: { authorId: session.user.id } }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          items: (reviews as any[]).map((r: any) => ({
            id: r.id,
            listingId: r.listingId,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            listing: {
              id: r.listing.id,
              title: r.listing.title,
              city: r.listing.city,
              neighborhood: r.listing.neighborhood,
              image: r.listing.images[0]?.url || null,
            },
          })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Public reviews for a listing
    if (!listingId) {
      return NextResponse.json({ success: false, error: 'listingId richiesto' }, { status: 400 });
    }

    const [reviews, total, aggregate] = await Promise.all([
      (prisma as any).review.findMany({
        where: { listingId, hidden: false },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true, verified: true },
          },
        },
      }),
      (prisma as any).review.count({ where: { listingId, hidden: false } }),
      (prisma as any).review.aggregate({
        where: { listingId, hidden: false },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Distribution of ratings 1-5
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (reviews as any[]).forEach((r: any) => {
      if (distribution[r.rating] !== undefined) distribution[r.rating]++;
    });

    return NextResponse.json({
      success: true,
      data: {
        items: (reviews as any[]).map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          flagged: r.flagged,
          createdAt: r.createdAt,
          author: {
            id: r.author.id,
            name: r.author.name,
            avatar: r.author.avatar,
            verified: r.author.verified,
          },
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        avgRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null,
        reviewCount: aggregate._count.rating,
        distribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'Errore nel recupero recensioni' }, { status: 500 });
  }
}

// POST — create a review (only after COMPLETED booking)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId richiesto' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ success: false, error: 'rating deve essere un intero da 1 a 5' }, { status: 400 });
    }

    // Verify booking exists and is COMPLETED and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { id: true, landlordId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Prenotazione non trovata' }, { status: 404 });
    }

    if (booking.tenantId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Non puoi recensire questa prenotazione' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Puoi recensire solo dopo una visita completata' }, { status: 400 });
    }

    // Check if review already exists for this booking
    const existingByBooking = await (prisma as any).review.findUnique({
      where: { bookingId },
    });
    if (existingByBooking) {
      return NextResponse.json({ success: false, error: 'Hai già scritto una recensione per questa visita' }, { status: 409 });
    }

    // Check if review already exists for this listing by this author
    const existingByListing = await (prisma as any).review.findUnique({
      where: { listingId_authorId: { listingId: booking.listingId, authorId: session.user.id } },
    });
    if (existingByListing) {
      return NextResponse.json({ success: false, error: 'Hai già recensito questo annuncio' }, { status: 409 });
    }

    // Can't review own listing
    if (booking.listing.landlordId === session.user.id) {
      return NextResponse.json({ success: false, error: 'Non puoi recensire il tuo stesso annuncio' }, { status: 400 });
    }

    const review = await (prisma as any).review.create({
      data: {
        listingId: booking.listingId,
        authorId: session.user.id,
        bookingId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, error: 'Errore nella creazione della recensione' }, { status: 500 });
  }
}

// PUT — update own review
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'reviewId richiesto' }, { status: 400 });
    }

    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json({ success: false, error: 'rating deve essere un intero da 1 a 5' }, { status: 400 });
    }

    const review = await (prisma as any).review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ success: false, error: 'Recensione non trovata' }, { status: 404 });
    }

    if (review.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Non puoi modificare questa recensione' }, { status: 403 });
    }

    const updated = await (prisma as any).review.update({
      where: { id: reviewId },
      data: {
        ...(rating ? { rating } : {}),
        ...(comment !== undefined ? { comment: comment?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: 'Errore nell\'aggiornamento della recensione' }, { status: 500 });
  }
}

// DELETE — delete own review
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('reviewId');

  if (!reviewId) {
    return NextResponse.json({ success: false, error: 'reviewId richiesto' }, { status: 400 });
  }

  try {
    const review = await (prisma as any).review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ success: false, error: 'Recensione non trovata' }, { status: 404 });
    }

    if (review.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Non puoi eliminare questa recensione' }, { status: 403 });
    }

    await (prisma as any).review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true, message: 'Recensione eliminata' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Errore nell\'eliminazione della recensione' }, { status: 500 });
  }
}
