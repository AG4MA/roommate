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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Limit to 5 active wishes per user
    const activeCount = await prisma.wish.count({
      where: {
        userId: session.user.id,
        active: true,
      },
    });

    if (activeCount >= 5) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Puoi avere al massimo 5 ricerche salvate attive' },
        { status: 400 }
      );
    }

    const wish = await prisma.wish.create({
      data: {
        userId: session.user.id,
        name: body.name || null,
        city: body.city || null,
        neighborhoods: body.neighborhoods || [],
        priceMin: body.priceMin ? Number(body.priceMin) : null,
        priceMax: body.priceMax ? Number(body.priceMax) : null,
        roomTypes: body.roomTypes || [],
        minSize: body.minSize ? Number(body.minSize) : null,
        features: body.features || [],
        emailNotify: body.emailNotify ?? true,
        pushNotify: body.pushNotify ?? true,
      },
    });

    return NextResponse.json<ApiResponse<WishData>>({
      success: true,
      data: mapWishToData(wish),
      message: 'Ricerca salvata con successo',
    });
  } catch (error) {
    console.error('Error creating wish:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante il salvataggio della ricerca' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const wishes = await prisma.wish.findMany({
      where: {
        userId: session.user.id,
        ...(activeOnly ? { active: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = wishes.map(mapWishToData);

    return NextResponse.json<ApiResponse<WishData[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching wishes:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento delle ricerche salvate' },
      { status: 500 }
    );
  }
}
