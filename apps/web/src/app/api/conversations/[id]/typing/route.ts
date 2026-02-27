import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';
import { eventBus, EVENTS } from '@/lib/realtime';

/**
 * POST /api/conversations/[id]/typing
 * 
 * Broadcast typing indicator to conversation participants
 * Body: { typing: boolean }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify participant
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participation) {
    return new Response('Not Found', { status: 404 });
  }

  const body = await request.json();
  const { typing } = body as { typing: boolean };

  eventBus.publishToConversation(
    conversationId,
    typing ? EVENTS.TYPING_START : EVENTS.TYPING_STOP,
    {
      userId: session.user.id,
      userName: session.user.name,
    }
  );

  return NextResponse.json({ success: true });
}
