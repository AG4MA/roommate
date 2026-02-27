import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

// POST — flag a review (any authenticated user) or hide/unhide (landlord of listing)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId, action, reason } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ success: false, error: 'reviewId e action richiesti' }, { status: 400 });
    }

    const review = await (prisma as any).review.findUnique({
      where: { id: reviewId },
      include: {
        listing: { select: { landlordId: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: 'Recensione non trovata' }, { status: 404 });
    }

    switch (action) {
      case 'flag': {
        // Any authenticated user can flag
        if (review.authorId === session.user.id) {
          return NextResponse.json({ success: false, error: 'Non puoi segnalare la tua recensione' }, { status: 400 });
        }

        if (review.flagged) {
          return NextResponse.json({ success: false, error: 'Recensione già segnalata' }, { status: 409 });
        }

        await (prisma as any).review.update({
          where: { id: reviewId },
          data: {
            flagged: true,
            flagReason: reason?.trim() || 'Segnalazione utente',
            flaggedBy: session.user.id,
          },
        });

        return NextResponse.json({ success: true, message: 'Recensione segnalata' });
      }

      case 'hide': {
        // Only landlord of the listing can hide
        if (review.listing.landlordId !== session.user.id) {
          return NextResponse.json({ success: false, error: 'Solo il proprietario può nascondere le recensioni' }, { status: 403 });
        }

        await (prisma as any).review.update({
          where: { id: reviewId },
          data: { hidden: true },
        });

        return NextResponse.json({ success: true, message: 'Recensione nascosta' });
      }

      case 'unhide': {
        // Only landlord of the listing can unhide
        if (review.listing.landlordId !== session.user.id) {
          return NextResponse.json({ success: false, error: 'Solo il proprietario può mostrare le recensioni' }, { status: 403 });
        }

        await (prisma as any).review.update({
          where: { id: reviewId },
          data: { hidden: false },
        });

        return NextResponse.json({ success: true, message: 'Recensione ripristinata' });
      }

      case 'unflag': {
        // Landlord can unflag
        if (review.listing.landlordId !== session.user.id) {
          return NextResponse.json({ success: false, error: 'Solo il proprietario può rimuovere la segnalazione' }, { status: 403 });
        }

        await (prisma as any).review.update({
          where: { id: reviewId },
          data: { flagged: false, flagReason: null, flaggedBy: null },
        });

        return NextResponse.json({ success: true, message: 'Segnalazione rimossa' });
      }

      default:
        return NextResponse.json({ success: false, error: 'Azione non valida. Usa: flag, hide, unhide, unflag' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ success: false, error: 'Errore nella moderazione' }, { status: 500 });
  }
}
