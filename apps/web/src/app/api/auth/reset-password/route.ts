import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { checkRateLimit, rateLimits } from '@/lib/security';

/**
 * POST /api/auth/reset-password
 * 
 * Resets the user's password using a valid reset token.
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, rateLimits.strict, 'reset-password');
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Token e password richiesti' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    });

    if (!verificationToken) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Link non valido o scaduto' },
        { status: 400 }
      );
    }

    if (verificationToken.type !== 'PASSWORD_RESET') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Token non valido' },
        { status: 400 }
      );
    }

    if (verificationToken.usedAt) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Questo link è già stato utilizzato' },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Il link è scaduto. Richiedi un nuovo reset della password.' },
        { status: 400 }
      );
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { passwordHash },
      }),
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Password reimpostata con successo. Ora puoi accedere con la nuova password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante il reset della password' },
      { status: 500 }
    );
  }
}
