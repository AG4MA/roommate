import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PendingInvitation {
  membershipId: string;
  group: {
    id: string;
    name: string | null;
    description: string | null;
    memberCount: number;
  };
  invitedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
}

// GET /api/groups/invitations — List my pending invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const pendingMemberships = await prisma.groupMembership.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
      include: {
        group: {
          include: {
            memberships: {
              where: { status: 'ACCEPTED' },
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const invitations: PendingInvitation[] = pendingMemberships.map((m) => {
      const owner = m.group.memberships.find((gm) => gm.role === 'OWNER');
      return {
        membershipId: m.id,
        group: {
          id: m.group.id,
          name: m.group.name,
          description: m.group.description,
          memberCount: m.group.memberships.length,
        },
        invitedBy: owner
          ? { id: owner.user.id, name: owner.user.name, avatar: owner.user.avatar }
          : { id: '', name: 'Sconosciuto', avatar: null },
        createdAt: m.createdAt.toISOString(),
      };
    });

    return NextResponse.json<ApiResponse<PendingInvitation[]>>({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento degli inviti' },
      { status: 500 }
    );
  }
}
