import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { inviteMemberSchema } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/groups/[id]/invite — Invite a tenant by email
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is an accepted member of the group
    const callerMembership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!callerMembership || callerMembership.status !== 'ACCEPTED') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Devi essere un membro attivo del gruppo per invitare' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.errors[0]?.message || 'Dati non validi' },
        { status: 400 }
      );
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { tenantProfile: true, landlordProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Utente non trovato con questa email' },
        { status: 404 }
      );
    }

    if (targetUser.landlordProfile && !targetUser.tenantProfile) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Puoi invitare solo inquilini, non proprietari' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId: targetUser.id } },
    });

    if (existingMembership) {
      const statusMsg = existingMembership.status === 'PENDING'
        ? 'Questo utente ha già un invito in sospeso'
        : existingMembership.status === 'ACCEPTED'
        ? 'Questo utente è già membro del gruppo'
        : 'Questo utente ha già rifiutato l\'invito';
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: statusMsg },
        { status: 409 }
      );
    }

    // Check group capacity
    const group = await prisma.housemateGroup.findUnique({
      where: { id: groupId },
      include: {
        memberships: { where: { status: 'ACCEPTED' } },
      },
    });

    if (!group) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Gruppo non trovato' },
        { status: 404 }
      );
    }

    if (group.memberships.length >= group.maxMembers) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Il gruppo ha raggiunto il massimo di ${group.maxMembers} membri` },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.groupMembership.create({
      data: {
        groupId,
        userId: targetUser.id,
        role: 'MEMBER',
        status: 'PENDING',
      },
    });

    // Add invited user to group conversation so they can see the chat
    if (group.conversationId) {
      const existingParticipant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: group.conversationId,
            userId: targetUser.id,
          },
        },
      });

      if (!existingParticipant) {
        await prisma.conversationParticipant.create({
          data: {
            conversationId: group.conversationId,
            userId: targetUser.id,
          },
        });
      }
    }

    return NextResponse.json<ApiResponse<{ membershipId: string }>>(
      {
        success: true,
        data: { membershipId: membership.id },
        message: `Invito inviato a ${targetUser.name}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nell\'invio dell\'invito' },
      { status: 500 }
    );
  }
}
