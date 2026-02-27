import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSSEStream } from '@/lib/realtime';

/**
 * GET /api/notifications/stream
 * 
 * SSE stream for user-level notifications:
 * - unread-count: updated total unread message count  
 * - conversation-updated: a conversation has new activity
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = createSSEStream(
    `user:${session.user.id}`,
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
