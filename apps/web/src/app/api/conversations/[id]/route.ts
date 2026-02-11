import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

interface ConversationDetail {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  messages: MessageData[];
}

/**
 * GET /api/conversations/[id]
 * 
 * Get conversation details with messages
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is a participant
    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
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

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Get other user
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== session.user.id
    );

    const otherUser = otherParticipant
      ? await prisma.user.findUnique({
          where: { id: otherParticipant.userId },
          select: { id: true, name: true, avatar: true },
        })
      : null;

    if (!otherUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Altro utente non trovato' },
        { status: 404 }
      );
    }

    // Get listing title if applicable
    let listingTitle: string | null = null;
    if (conversation.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: conversation.listingId },
        select: { title: true },
      });
      listingTitle = listing?.title ?? null;
    }

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const data: ConversationDetail = {
      id: conversation.id,
      listingId: conversation.listingId,
      listingTitle,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar,
      },
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderAvatar: msg.sender.avatar,
        isOwn: msg.senderId === session.user.id,
        createdAt: msg.createdAt.toISOString(),
        readAt: msg.readAt?.toISOString() ?? null,
      })),
    };

    return NextResponse.json<ApiResponse<ConversationDetail>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento della conversazione' },
      { status: 500 }
    );
  }
}
