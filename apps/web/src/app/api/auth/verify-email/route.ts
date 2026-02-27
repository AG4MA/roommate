import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';

/**
 * GET /api/auth/verify-email?token=xxx
 * 
 * Verifies the user's email address using the token sent by email.
 * Redirects to login page with status.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?verified=invalid', request.url));
    }

    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, emailVerified: true } } },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/login?verified=invalid', request.url));
    }

    if (verificationToken.usedAt) {
      return NextResponse.redirect(new URL('/login?verified=already', request.url));
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/login?verified=expired', request.url));
    }

    if (verificationToken.type !== 'EMAIL_VERIFICATION') {
      return NextResponse.redirect(new URL('/login?verified=invalid', request.url));
    }

    // Mark token as used and verify email
    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
    ]);

    return NextResponse.redirect(new URL('/login?verified=success', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?verified=error', request.url));
  }
}
