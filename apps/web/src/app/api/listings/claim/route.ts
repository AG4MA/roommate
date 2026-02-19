import { NextResponse } from 'next/server';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { ApiResponse } from '@roommate/shared';

/**
 * POST /api/listings/claim
 * Claim an anonymous listing by providing the 6-digit code.
 * The logged-in user becomes the owner (landlordId) and the listing
 * becomes permanent (no expiry, isAnonymous = false).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Devi essere registrato per rivendicare un annuncio' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Codice non valido. Deve essere di 6 cifre.' },
        { status: 400 },
      );
    }

    // Find listing by code
    const listing = await prisma.listing.findFirst({
      where: {
        editCode: code,
        isAnonymous: true,
      },
    });

    if (!listing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Nessun annuncio trovato con questo codice.' },
        { status: 404 },
      );
    }

    // Transfer ownership
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        landlordId: session.user.id,
        isAnonymous: false,
        editToken: null,
        editCode: null,
        expiresAt: null, // permanent now
      },
    });

    // Ensure the user has a landlord profile
    const hasProfile = await prisma.landlordProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!hasProfile) {
      await prisma.landlordProfile.create({
        data: { userId: session.user.id, totalListings: 1 },
      });
    } else {
      await prisma.landlordProfile.update({
        where: { userId: session.user.id },
        data: { totalListings: { increment: 1 } },
      });
    }

    return NextResponse.json<ApiResponse<{ id: string }>>(
      {
        success: true,
        data: { id: listing.id },
        message: "L'annuncio è ora collegato al tuo account!",
      },
    );
  } catch (error) {
    console.error('Error claiming listing:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante la rivendicazione' },
      { status: 500 },
    );
  }
}
