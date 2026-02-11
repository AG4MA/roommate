import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ConversationSummary {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

/**
 * GET /api/conversations
 * 
 * List all conversations for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find all conversations where user is a participant
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: session.user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                // We need user info but not from the DB directly
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: 'desc' },
      },
    });

    // Build response with other user info
    const conversations: ConversationSummary[] = [];

    for (const participation of participations) {
      const conv = participation.conversation;
      
      // Get other participant's userId
      const otherParticipant = conv.participants.find(
        (p: { userId: string }) => p.userId !== session.user.id
      );
      
      if (!otherParticipant) continue;

      // Fetch other user's info
      const otherUser = await prisma.user.findUnique({
        where: { id: otherParticipant.userId },
        select: { id: true, name: true, avatar: true },
      });

      if (!otherUser) continue;

      // Get listing title if conversation is about a listing
      let listingTitle: string | null = null;
      if (conv.listingId) {
        const listing = await prisma.listing.findUnique({
          where: { id: conv.listingId },
          select: { title: true },
        });
        listingTitle = listing?.title ?? null;
      }

      // Count unread messages
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: session.user.id },
          readAt: null,
        },
      });

      const lastMsg = conv.messages[0] ?? null;

      conversations.push({
        id: conv.id,
        listingId: conv.listingId,
        listingTitle,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt.toISOString(),
              isOwn: lastMsg.senderId === session.user.id,
            }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt.toISOString(),
      });
    }

    return NextResponse.json<ApiResponse<ConversationSummary[]>>({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento delle conversazioni' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * 
 * Create a new conversation or return existing one
 * Body: { recipientId: string, listingId?: string, message?: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, listingId, message } = body as {
      recipientId: string;
      listingId?: string;
      message?: string;
    };

    if (!recipientId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Destinatario richiesto' },
        { status: 400 }
      );
    }

    if (recipientId === session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non puoi iniziare una conversazione con te stesso' },
        { status: 400 }
      );
    }

    // Check recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: { landlordProfile: true },
    });

    if (!recipient) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Check contact preferences if recipient is a landlord
    if (recipient.landlordProfile) {
      const preference = recipient.landlordProfile.contactPreference;
      // For now, we allow all contacts through the app (IN_APP is default)
      // Future: enforce PHONE/EMAIL only if selected
    }

    // Check if conversation already exists between these users (optionally for same listing)
    let existingConv = await prisma.conversation.findFirst({
      where: {
        ...(listingId ? { listingId } : {}),
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });

    if (existingConv) {
      // Return existing conversation
      return NextResponse.json<ApiResponse<{ id: string; isNew: boolean }>>({
        success: true,
        data: { id: existingConv.id, isNew: false },
      });
    }

    // Create new conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        listingId: listingId || null,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: recipientId },
          ],
        },
      },
    });

    // If initial message provided, create it
    if (message && message.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: message.trim(),
        },
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json<ApiResponse<{ id: string; isNew: boolean }>>(
      {
        success: true,
        data: { id: conversation.id, isNew: true },
        message: 'Conversazione creata',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nella creazione della conversazione' },
      { status: 500 }
    );
  }
}
