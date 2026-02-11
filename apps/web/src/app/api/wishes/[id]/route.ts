import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface WishData {
  id: string;
  name: string | null;
  city: string | null;
  neighborhoods: string[];
  priceMin: number | null;
  priceMax: number | null;
  roomTypes: string[];
  minSize: number | null;
  features: string[];
  emailNotify: boolean;
  pushNotify: boolean;
  active: boolean;
  lastMatchedAt: string | null;
  createdAt: string;
}

function mapWishToData(wish: any): WishData {
  return {
    id: wish.id,
    name: wish.name,
    city: wish.city,
    neighborhoods: wish.neighborhoods,
    priceMin: wish.priceMin,
    priceMax: wish.priceMax,
    roomTypes: wish.roomTypes,
    minSize: wish.minSize,
    features: wish.features,
    emailNotify: wish.emailNotify,
    pushNotify: wish.pushNotify,
    active: wish.active,
    lastMatchedAt: wish.lastMatchedAt?.toISOString() ?? null,
    createdAt: wish.createdAt.toISOString(),
  };
}

export async function GET(
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

    const wish = await prisma.wish.findUnique({
      where: { id },
    });

    if (!wish || wish.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Ricerca non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<WishData>>({
      success: true,
      data: mapWishToData(wish),
    });
  } catch (error) {
    console.error('Error fetching wish:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento della ricerca' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const existingWish = await prisma.wish.findUnique({
      where: { id },
    });

    if (!existingWish || existingWish.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Ricerca non trovata' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const wish = await prisma.wish.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        city: body.city !== undefined ? body.city : undefined,
        neighborhoods: body.neighborhoods !== undefined ? body.neighborhoods : undefined,
        priceMin: body.priceMin !== undefined ? (body.priceMin ? Number(body.priceMin) : null) : undefined,
        priceMax: body.priceMax !== undefined ? (body.priceMax ? Number(body.priceMax) : null) : undefined,
        roomTypes: body.roomTypes !== undefined ? body.roomTypes : undefined,
        minSize: body.minSize !== undefined ? (body.minSize ? Number(body.minSize) : null) : undefined,
        features: body.features !== undefined ? body.features : undefined,
        emailNotify: body.emailNotify !== undefined ? body.emailNotify : undefined,
        pushNotify: body.pushNotify !== undefined ? body.pushNotify : undefined,
        active: body.active !== undefined ? body.active : undefined,
      },
    });

    return NextResponse.json<ApiResponse<WishData>>({
      success: true,
      data: mapWishToData(wish),
      message: 'Ricerca aggiornata con successo',
    });
  } catch (error) {
    console.error('Error updating wish:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante l'aggiornamento della ricerca" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existingWish = await prisma.wish.findUnique({
      where: { id },
    });

    if (!existingWish || existingWish.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Ricerca non trovata' },
        { status: 404 }
      );
    }

    await prisma.wish.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Ricerca eliminata',
    });
  } catch (error) {
    console.error('Error deleting wish:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante l'eliminazione della ricerca" },
      { status: 500 }
    );
  }
}
