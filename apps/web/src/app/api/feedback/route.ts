import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json();
    const { message, rating, page } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Il messaggio deve contenere almeno 3 caratteri.' }, { status: 400 });
    }

    if (rating !== undefined && rating !== null && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json({ success: false, error: 'Il rating deve essere tra 1 e 5.' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;

    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim().slice(0, 2000),
        rating: rating ?? null,
        page: page ?? null,
        userId: session?.user?.id ?? null,
        ip: session?.user?.id ? null : ip, // only store IP for anonymous
      },
    });

    return NextResponse.json({ success: true, data: { id: feedback.id } });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ success: false, error: 'Errore nel salvataggio del feedback.' }, { status: 500 });
  }
}
