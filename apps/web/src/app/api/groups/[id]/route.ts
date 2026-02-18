import { NextResponse } from 'next/server';
import type { ApiResponse, GroupDetail, GroupMember } from '@roommate/shared';
import { updateGroupSchema, calculateAge } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function buildGroupDetail(groupId: string): Promise<GroupDetail | null> {
  const group = await prisma.housemateGroup.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: {
          user: {
            include: { tenantProfile: true },
          },
        },
      },
    },
  });

  if (!group) return null;

  const acceptedCount = group.memberships.filter((m) => m.status === 'ACCEPTED').length;
  const pendingCount = group.memberships.filter((m) => m.status === 'PENDING').length;

  const members: GroupMember[] = group.memberships
    .filter((m) => m.status !== 'DECLINED')
    .map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      avatar: m.user.avatar,
      role: m.role as 'OWNER' | 'MEMBER',
      status: m.status as 'PENDING' | 'ACCEPTED' | 'DECLINED',
      joinedAt: m.joinedAt?.toISOString() ?? null,
      tenantProfile: m.status === 'ACCEPTED' && m.user.tenantProfile
        ? {
            id: m.user.id,
            name: m.user.name,
            avatar: m.user.avatar,
            age: m.user.dateOfBirth ? calculateAge(m.user.dateOfBirth) : null,
            gender: m.user.gender as 'MALE' | 'FEMALE' | 'OTHER' | null,
            occupation: m.user.occupation as 'STUDENT' | 'WORKING' | 'FREELANCER' | 'UNEMPLOYED' | 'RETIRED' | null,
            verified: m.user.verified,
            budgetMin: m.user.tenantProfile.budgetMin,
            budgetMax: m.user.tenantProfile.budgetMax,
            moveInDate: m.user.tenantProfile.moveInDate?.toISOString() ?? null,
            contractType: m.user.tenantProfile.contractType as 'PERMANENT' | 'TEMPORARY' | 'INTERNSHIP' | null,
            smoker: m.user.tenantProfile.smoker,
            hasPets: m.user.tenantProfile.hasPets,
            hasGuarantor: m.user.tenantProfile.hasGuarantor,
            incomeRange: m.user.tenantProfile.incomeRange as 'UNDER_1000' | 'FROM_1000_TO_1500' | 'FROM_1500_TO_2000' | 'FROM_2000_TO_3000' | 'OVER_3000' | null,
            languages: m.user.tenantProfile.languages,
            referencesAvailable: m.user.tenantProfile.referencesAvailable,
            employmentVerified: m.user.tenantProfile.employmentVerified,
            incomeVerified: m.user.tenantProfile.incomeVerified,
          }
        : null,
    }));

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    maxMembers: group.maxMembers,
    memberCount: acceptedCount,
    pendingCount,
    members,
    conversationId: group.conversationId,
    createdAt: group.createdAt.toISOString(),
  };
}

// GET /api/groups/[id] — Group detail
export async function GET(
  _request: Request,
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

    // Verify user is a member
    const membership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId: id, userId: session.user.id } },
    });

    if (!membership || membership.status === 'DECLINED') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non sei membro di questo gruppo' },
        { status: 403 }
      );
    }

    const detail = await buildGroupDetail(id);

    if (!detail) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Gruppo non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<GroupDetail>>({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error('Error fetching group detail:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento del gruppo' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[id] — Update group (owner only)
export async function PUT(
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

    const membership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId: id, userId: session.user.id } },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo il proprietario del gruppo può modificarlo' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.errors[0]?.message || 'Dati non validi' },
        { status: 400 }
      );
    }

    // Cannot reduce maxMembers below current accepted count
    if (parsed.data.maxMembers) {
      const acceptedCount = await prisma.groupMembership.count({
        where: { groupId: id, status: 'ACCEPTED' },
      });
      if (parsed.data.maxMembers < acceptedCount) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: `Non puoi ridurre il massimo sotto ${acceptedCount} (membri attuali)` },
          { status: 400 }
        );
      }
    }

    await prisma.housemateGroup.update({
      where: { id },
      data: parsed.data,
    });

    const detail = await buildGroupDetail(id);

    return NextResponse.json<ApiResponse<GroupDetail>>({
      success: true,
      data: detail!,
      message: 'Gruppo aggiornato',
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nell\'aggiornamento del gruppo' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] — Dissolve group (owner only)
export async function DELETE(
  _request: Request,
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

    const membership = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId: id, userId: session.user.id } },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo il proprietario del gruppo può scioglierlo' },
        { status: 403 }
      );
    }

    // Withdraw all active/waiting group interests and promote from waiting list
    const groupInterests = await prisma.interest.findMany({
      where: { groupId: id, status: { in: ['ACTIVE', 'WAITING'] } },
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

    // Delete group (cascades to memberships)
    await prisma.housemateGroup.delete({ where: { id } });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Gruppo sciolto',
    });
  } catch (error) {
    console.error('Error dissolving group:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nello scioglimento del gruppo' },
      { status: 500 }
    );
  }
}
