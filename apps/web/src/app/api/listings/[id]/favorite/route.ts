import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET — check if user has favorited this listing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<{ isFavorite: boolean }>>({
        success: true,
        data: { isFavorite: false },
      });
    }

    const fav = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });

    return NextResponse.json<ApiResponse<{ isFavorite: boolean }>>({
      success: true,
      data: { isFavorite: !!fav },
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore' },
      { status: 500 }
    );
  }
}

// POST — add to favorites
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

    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: session.user.id, listingId } },
      create: { userId: session.user.id, listingId },
      update: {},
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Annuncio salvato',
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore' },
      { status: 500 }
    );
  }
}

// DELETE — remove from favorites
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

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, listingId },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Annuncio rimosso dai preferiti',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore' },
      { status: 500 }
    );
  }
}
