import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eventBus, EVENTS } from '@/lib/realtime';
import { notifyNewMessage } from '@/lib/notifications';

interface MessageData {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  isOwn: boolean;
  createdAt: string;
  readAt: string | null;
}

/**
 * POST /api/conversations/[id]/messages
 * 
 * Send a message in a conversation
 * Body: { content: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body as { content: string };

    if (!content || !content.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Il messaggio non può essere vuoto' },
        { status: 400 }
      );
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
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, avatar: true },
    });

    if (!sender) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Update sender's engagement score for any listings they're interested in
    // +3 for sending a message
    await prisma.interest.updateMany({
      where: {
        tenantId: session.user.id,
        status: { in: ['ACTIVE', 'WAITING'] },
      },
      data: {
        score: { increment: 3 },
      },
    });

    const data: MessageData = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      isOwn: true,
      createdAt: message.createdAt.toISOString(),
      readAt: null,
    };

    // Emit real-time events
    const messagePayload = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      createdAt: message.createdAt.toISOString(),
    };

    // Notify conversation SSE listeners
    eventBus.publishToConversation(conversationId, EVENTS.NEW_MESSAGE, messagePayload);

    // Notify other participants via their personal channel (for unread badge)
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
      },
    });

    for (const participant of participants) {
      // Send unread count update
      const unreadCount = await prisma.message.count({
        where: {
          conversation: {
            participants: { some: { userId: participant.userId } },
          },
          senderId: { not: participant.userId },
          readAt: null,
        },
      });

      eventBus.publishToUser(participant.userId, EVENTS.UNREAD_COUNT, {
        totalUnread: unreadCount,
        conversationId,
      });

      // Send push notification (for offline users)
      notifyNewMessage(
        participant.userId,
        sender.name,
        message.content.substring(0, 100),
        conversationId
      ).catch(err => console.error('[NOTIFY ERROR]', err));
    }

    return NextResponse.json<ApiResponse<MessageData>>(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante l'invio del messaggio" },
      { status: 500 }
    );
  }
}
