import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { sendPasswordResetEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { checkRateLimit, rateLimits } from '@/lib/security';

/**
 * POST /api/auth/forgot-password
 * 
 * Sends a password reset email to the user.
 * Always returns success to prevent email enumeration.
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, rateLimits.strict, 'forgot-password');
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Email richiesta' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: true,
        data: null,
        message: 'Se l\'email è registrata, riceverai un link per reimpostare la password',
      });
    }

    // Invalidate existing password reset tokens for this user
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Create new token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.verificationToken.create({
      data: {
        token,
        type: 'PASSWORD_RESET',
        userId: user.id,
        expiresAt,
      },
    });

    // Send email
    await sendPasswordResetEmail(user.email, user.name, token);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Se l\'email è registrata, riceverai un link per reimpostare la password',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante l\'invio dell\'email' },
      { status: 500 }
    );
  }
}
