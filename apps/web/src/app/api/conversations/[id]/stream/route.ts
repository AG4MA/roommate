import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';
import { createSSEStream } from '@/lib/realtime';

/**
 * GET /api/conversations/[id]/stream
 * 
 * SSE stream for real-time updates in a conversation:
 * - new-message: when another user sends a message
 * - typing-start / typing-stop: typing indicators
 * - message-read: read receipts
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify user is a participant
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

  const stream = createSSEStream(
    `conversation:${conversationId}`,
    session.user.id
  );

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
