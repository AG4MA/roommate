import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { respondInvitationSchema } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Withdraw group interests if group falls below 2 accepted members
async function withdrawGroupInterestsIfNeeded(groupId: string) {
  const acceptedCount = await prisma.groupMembership.count({
    where: { groupId, status: 'ACCEPTED' },
  });

  if (acceptedCount < 2) {
    const groupInterests = await prisma.interest.findMany({
      where: { groupId, status: { in: ['ACTIVE', 'WAITING'] } },
    });

    for (const interest of groupInterests) {
      await prisma.interest.update({
        where: { id: interest.id },
        data: { status: 'WITHDRAWN' },
      });

      // Promote next waiting if we withdrew an active slot
      if (interest.status === 'ACTIVE') {
        const nextWaiting = await prisma.interest.findFirst({
          where: { listingId: interest.listingId, status: 'WAITING' },
          orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
        });
        if (nextWaiting) {
          await prisma.interest.update({
            where: { id: nextWaiting.id },
            data: { status: 'ACTIVE', position: interest.position },
          });
        }
      }
    }
  }
}

// PUT /api/groups/[id]/members/[memberId] — Accept or decline invitation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: groupId, memberId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the membership
    const membership = await prisma.groupMembership.findUnique({
      where: { id: memberId },
      include: { group: true },
    });

    if (!membership || membership.groupId !== groupId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invito non trovato' },
        { status: 404 }
      );
    }

    // Only the invited user can respond
    if (membership.userId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Puoi rispondere solo ai tuoi inviti' },
        { status: 403 }
      );
    }

    if (membership.status !== 'PENDING') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Questo invito non è più in sospeso' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = respondInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.errors[0]?.message || 'Dati non validi' },
        { status: 400 }
      );
    }

    if (parsed.data.action === 'accept') {
      // Check group capacity before accepting
      const acceptedCount = await prisma.groupMembership.count({
        where: { groupId, status: 'ACCEPTED' },
      });

      if (acceptedCount >= membership.group.maxMembers) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Il gruppo ha raggiunto il numero massimo di membri' },
          { status: 400 }
        );
      }

      await prisma.groupMembership.update({
        where: { id: memberId },
        data: { status: 'ACCEPTED', joinedAt: new Date() },
      });

      return NextResponse.json<ApiResponse<null>>({
        success: true,
        data: null,
        message: 'Invito accettato! Sei ora membro del gruppo',
      });
    } else {
      // Decline: update status and remove from conversation
      await prisma.groupMembership.update({
        where: { id: memberId },
        data: { status: 'DECLINED' },
      });

      if (membership.group.conversationId) {
        await prisma.conversationParticipant.deleteMany({
          where: {
            conversationId: membership.group.conversationId,
            userId: session.user.id,
          },
        });
      }

      return NextResponse.json<ApiResponse<null>>({
        success: true,
        data: null,
        message: 'Invito rifiutato',
      });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nella risposta all\'invito' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id]/members/[memberId] — Leave group or kick member
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: groupId, memberId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const membership = await prisma.groupMembership.findUnique({
      where: { id: memberId },
      include: { group: true },
    });

    if (!membership || membership.groupId !== groupId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Membro non trovato' },
        { status: 404 }
      );
    }

    const callerMembership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!callerMembership || callerMembership.status !== 'ACCEPTED') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non sei un membro attivo del gruppo' },
        { status: 403 }
      );
    }

    const isSelf = membership.userId === session.user.id;
    const isOwner = callerMembership.role === 'OWNER';

    // Can only remove self or owner can remove others
    if (!isSelf && !isOwner) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo il proprietario può rimuovere altri membri' },
        { status: 403 }
      );
    }

    // Remove from conversation
    if (membership.group.conversationId) {
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId: membership.group.conversationId,
          userId: membership.userId,
        },
      });
    }

    // If owner is leaving, transfer ownership
    if (isSelf && membership.role === 'OWNER') {
      const nextOwner = await prisma.groupMembership.findFirst({
        where: {
          groupId,
          status: 'ACCEPTED',
          userId: { not: session.user.id },
        },
        orderBy: { joinedAt: 'asc' },
      });

      if (nextOwner) {
        await prisma.groupMembership.update({
          where: { id: nextOwner.id },
          data: { role: 'OWNER' },
        });
      } else {
        // No accepted members left — dissolve group
        const groupInterests = await prisma.interest.findMany({
          where: { groupId, status: { in: ['ACTIVE', 'WAITING'] } },
        });

        for (const interest of groupInterests) {
          await prisma.interest.update({
            where: { id: interest.id },
            data: { status: 'WITHDRAWN' },
          });

          if (interest.status === 'ACTIVE') {
            const nextWaiting = await prisma.interest.findFirst({
              where: { listingId: interest.listingId, status: 'WAITING' },
              orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
            });
            if (nextWaiting) {
              await prisma.interest.update({
                where: { id: nextWaiting.id },
                data: { status: 'ACTIVE', position: interest.position },
              });
            }
          }
        }

        await prisma.housemateGroup.delete({ where: { id: groupId } });

        return NextResponse.json<ApiResponse<null>>({
          success: true,
          data: null,
          message: 'Gruppo sciolto (nessun membro rimasto)',
        });
      }
    }

    // Delete membership
    await prisma.groupMembership.delete({ where: { id: memberId } });

    // Check if group interests need to be withdrawn
    await withdrawGroupInterestsIfNeeded(groupId);

    const message = isSelf ? 'Hai lasciato il gruppo' : 'Membro rimosso dal gruppo';

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message,
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nella rimozione del membro' },
      { status: 500 }
    );
  }
}
