import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { registerSubscription, removeSubscription, getVapidPublicKey } from '@/lib/push';

// GET /api/push/subscribe — Get VAPID public key
export async function GET() {
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    success: true,
    data: { publicKey },
  });
}

// POST /api/push/subscribe — Register push subscription
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Non autenticato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { subscription, platform } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'Dati sottoscrizione mancanti' },
        { status: 400 }
      );
    }

    await registerSubscription(
      session.user.id,
      subscription,
      {
        userAgent: request.headers.get('user-agent') || undefined,
        platform: platform || 'web',
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Sottoscrizione push registrata',
    });
  } catch (error) {
    console.error('[PUSH SUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella registrazione' },
      { status: 500 }
    );
  }
}

// DELETE /api/push/subscribe — Unregister push subscription
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Non autenticato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint mancante' },
        { status: 400 }
      );
    }

    await removeSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: 'Sottoscrizione push rimossa',
    });
  } catch (error) {
    console.error('[PUSH UNSUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella rimozione' },
      { status: 500 }
    );
  }
}
