import { NextResponse } from 'next/server';
import type { ApiResponse, GroupSummary } from '@roommate/shared';
import { createGroupSchema } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/groups — List current user's groups
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const memberships = await prisma.groupMembership.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['ACCEPTED', 'PENDING'] },
      },
      include: {
        group: {
          include: {
            memberships: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const groups: GroupSummary[] = memberships.map((m) => {
      const group = m.group;
      const acceptedCount = group.memberships.filter((gm) => gm.status === 'ACCEPTED').length;
      const pendingCount = group.memberships.filter((gm) => gm.status === 'PENDING').length;

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        maxMembers: group.maxMembers,
        memberCount: acceptedCount,
        pendingCount,
        members: group.memberships
          .filter((gm) => gm.status !== 'DECLINED')
          .map((gm) => ({
            userId: gm.user.id,
            name: gm.user.name,
            avatar: gm.user.avatar,
            role: gm.role as 'OWNER' | 'MEMBER',
            status: gm.status as 'PENDING' | 'ACCEPTED' | 'DECLINED',
          })),
        conversationId: group.conversationId,
        createdAt: group.createdAt.toISOString(),
      };
    });

    return NextResponse.json<ApiResponse<GroupSummary[]>>({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento dei gruppi' },
      { status: 500 }
    );
  }
}

// POST /api/groups — Create a new group
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role === 'landlord') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo gli inquilini possono creare gruppi' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.errors[0]?.message || 'Dati non validi' },
        { status: 400 }
      );
    }

    const { name, description, maxMembers } = parsed.data;

    // Create conversation for group chat
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.user.id }],
        },
      },
    });

    // Create group with owner membership
    const group = await prisma.housemateGroup.create({
      data: {
        name,
        description,
        maxMembers,
        conversationId: conversation.id,
        memberships: {
          create: [
            {
              userId: session.user.id,
              role: 'OWNER',
              status: 'ACCEPTED',
              joinedAt: new Date(),
            },
          ],
        },
      },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    const result: GroupSummary = {
      id: group.id,
      name: group.name,
      description: group.description,
      maxMembers: group.maxMembers,
      memberCount: 1,
      pendingCount: 0,
      members: group.memberships.map((gm) => ({
        userId: gm.user.id,
        name: gm.user.name,
        avatar: gm.user.avatar,
        role: gm.role as 'OWNER' | 'MEMBER',
        status: gm.status as 'PENDING' | 'ACCEPTED' | 'DECLINED',
      })),
      conversationId: group.conversationId,
      createdAt: group.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<GroupSummary>>(
      { success: true, data: result, message: 'Gruppo creato con successo' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nella creazione del gruppo' },
      { status: 500 }
    );
  }
}
