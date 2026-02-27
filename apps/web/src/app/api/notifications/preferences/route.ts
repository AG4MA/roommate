import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

// GET /api/notifications/preferences — Get user notification preferences
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Non autenticato' },
      { status: 401 }
    );
  }

  let prefs = await (prisma as any).notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  // Return defaults if no preferences exist
  if (!prefs) {
    prefs = {
      emailEnabled: true,
      pushEnabled: true,
      newMessage: true,
      interestReceived: true,
      interestApproved: true,
      bookingConfirmed: true,
      bookingCancelled: true,
      wishMatched: true,
      listingExpiring: true,
      listingExpired: true,
      groupInvite: true,
      quietHoursEnabled: false,
      quietHoursStart: null,
      quietHoursEnd: null,
    };
  }

  // Check if push is subscribed
  const pushSubscriptionCount = await (prisma as any).pushSubscription.count({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    success: true,
    data: {
      ...prefs,
      hasPushSubscription: pushSubscriptionCount > 0,
      pushSubscriptionCount,
    },
  });
}

// PUT /api/notifications/preferences — Update notification preferences
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Non autenticato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate quiet hours format
    if (body.quietHoursStart && !/^\d{2}:\d{2}$/.test(body.quietHoursStart)) {
      return NextResponse.json(
        { success: false, error: 'Formato orario non valido (HH:MM)' },
        { status: 400 }
      );
    }
    if (body.quietHoursEnd && !/^\d{2}:\d{2}$/.test(body.quietHoursEnd)) {
      return NextResponse.json(
        { success: false, error: 'Formato orario non valido (HH:MM)' },
        { status: 400 }
      );
    }

    // Only allow known fields
    const allowedFields = [
      'emailEnabled',
      'pushEnabled',
      'newMessage',
      'interestReceived',
      'interestApproved',
      'bookingConfirmed',
      'bookingCancelled',
      'wishMatched',
      'listingExpiring',
      'listingExpired',
      'groupInvite',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    const prefs = await (prisma as any).notificationPreference.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    console.error('[NOTIFICATION PREFS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel salvataggio preferenze' },
      { status: 500 }
    );
  }
}
