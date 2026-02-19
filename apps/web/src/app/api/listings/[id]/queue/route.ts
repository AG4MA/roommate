import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MAX_ACTIVE_INTERESTS = 3;

// GET — landlord sees the queue for their listing (active interests with tenant profiles)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { landlordId: true, status: true, title: true },
    });

    if (!listing || listing.landlordId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Annuncio non trovato o non autorizzato' },
        { status: 404 }
      );
    }

    const interests = await prisma.interest.findMany({
      where: { listingId, status: 'ACTIVE' },
      orderBy: { position: 'asc' },
      include: {
        tenant: {
          include: {
            tenantProfile: true,
          },
        },
        certificationRequests: true,
      },
    });

    const queue = interests.map((i) => {
      const u = i.tenant;
      const tp = u.tenantProfile;
      return {
        interestId: i.id,
        position: i.position,
        score: i.score,
        schedulingApproved: i.schedulingApproved,
        createdAt: i.createdAt.toISOString(),
        tenant: {
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          age: u.dateOfBirth
            ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null,
          gender: u.gender,
          occupation: u.occupation,
          verified: u.verified,
          bio: u.bio,
          budgetMin: tp?.budgetMin ?? null,
          budgetMax: tp?.budgetMax ?? null,
          contractType: tp?.contractType ?? null,
          smoker: tp?.smoker ?? false,
          hasPets: tp?.hasPets ?? false,
          hasGuarantor: tp?.hasGuarantor ?? false,
          incomeRange: tp?.incomeRange ?? null,
          languages: tp?.languages ?? [],
          referencesAvailable: tp?.referencesAvailable ?? false,
          employmentVerified: tp?.employmentVerified ?? false,
          incomeVerified: tp?.incomeVerified ?? false,
          noShowCount: u.noShowCount,
        },
        certifications: i.certificationRequests.map((c) => ({
          id: c.id,
          type: c.type,
          status: c.status,
          documentUrl: c.documentUrl,
          note: c.note,
          createdAt: c.createdAt.toISOString(),
        })),
      };
    });

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: {
        listingTitle: listing.title,
        listingStatus: listing.status,
        maxActive: MAX_ACTIVE_INTERESTS,
        queue,
      },
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore nel caricamento della coda' },
      { status: 500 }
    );
  }
}

// DELETE — landlord removes a tenant from the queue
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!tenantId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'tenantId richiesto' },
        { status: 400 }
      );
    }

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { landlordId: true },
    });

    if (!listing || listing.landlordId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Find the interest
    const interest = await prisma.interest.findUnique({
      where: { listingId_tenantId: { listingId, tenantId } },
    });

    if (!interest || interest.status !== 'ACTIVE') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Interesse non trovato nella coda attiva' },
        { status: 404 }
      );
    }

    // Remove the interest
    await prisma.interest.update({
      where: { id: interest.id },
      data: { status: 'REMOVED' },
    });

    // Promote next waiting user
    const nextWaiting = await prisma.interest.findFirst({
      where: { listingId, status: 'WAITING' },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    });

    if (nextWaiting) {
      await prisma.interest.update({
        where: { id: nextWaiting.id },
        data: { status: 'ACTIVE', position: interest.position },
      });
    }

    // Check if listing should return to ACTIVE
    const remainingActive = await prisma.interest.count({
      where: { listingId, status: 'ACTIVE' },
    });

    if (remainingActive < MAX_ACTIVE_INTERESTS) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'Inquilino rimosso dalla coda',
    });
  } catch (error) {
    console.error('Error removing from queue:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante la rimozione' },
      { status: 500 }
    );
  }
}

// POST — landlord actions: approve scheduling, propose open day
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, tenantId, ...extra } = body;

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { landlordId: true },
    });

    if (!listing || listing.landlordId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Verify tenant is in ACTIVE queue
    const interest = tenantId
      ? await prisma.interest.findUnique({
          where: { listingId_tenantId: { listingId, tenantId } },
        })
      : null;

    if (tenantId && (!interest || interest.status !== 'ACTIVE')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Inquilino non trovato nella coda attiva' },
        { status: 404 }
      );
    }

    switch (action) {
      // Approve scheduling — tenant can now pick a visit slot
      case 'approve_scheduling': {
        if (!interest) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'tenantId richiesto' },
            { status: 400 }
          );
        }

        await prisma.interest.update({
          where: { id: interest.id },
          data: { schedulingApproved: true },
        });

        return NextResponse.json<ApiResponse<null>>({
          success: true,
          data: null,
          message: 'Schedulazione approvata — l\'inquilino può ora prenotare una visita',
        });
      }

      // Request certification from tenant
      case 'request_certification': {
        if (!interest) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'tenantId richiesto' },
            { status: 400 }
          );
        }

        const { certificationType, note } = extra;
        const validTypes = ['EMPLOYMENT_CONTRACT', 'INCOME_PROOF', 'STUDENT_ENROLLMENT', 'GUARANTOR', 'ID_DOCUMENT'];

        if (!validTypes.includes(certificationType)) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Tipo di certificazione non valido' },
            { status: 400 }
          );
        }

        const cert = await prisma.certificationRequest.create({
          data: {
            interestId: interest.id,
            tenantId,
            type: certificationType,
            note: note || null,
          },
        });

        return NextResponse.json<ApiResponse<typeof cert>>({
          success: true,
          data: cert,
          message: 'Richiesta di certificazione inviata',
        });
      }

      // Create open day — one slot, all active tenants invited
      case 'create_openday': {
        const { date, startTime, endTime } = extra;

        if (!date || !startTime || !endTime) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Data, ora inizio e ora fine sono richiesti' },
            { status: 400 }
          );
        }

        const slot = await prisma.visitSlot.create({
          data: {
            listingId,
            date: new Date(date),
            startTime,
            endTime,
            type: 'OPENDAY',
            maxGuests: MAX_ACTIVE_INTERESTS,
          },
        });

        // Approve scheduling for all active interests
        await prisma.interest.updateMany({
          where: { listingId, status: 'ACTIVE' },
          data: { schedulingApproved: true },
        });

        return NextResponse.json<ApiResponse<typeof slot>>({
          success: true,
          data: slot,
          message: 'Open Day creato — gli interessati possono confermare la partecipazione',
        });
      }

      // Report attendance after a visit
      case 'report_attendance': {
        const { slotId, attendees } = extra as { slotId: string; attendees: string[] };

        if (!slotId || !attendees) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'slotId e lista presenti richiesti' },
            { status: 400 }
          );
        }

        // Get all bookings for this slot that were confirmed
        const bookings = await prisma.booking.findMany({
          where: { slotId, status: 'CONFIRMED' },
        });

        for (const booking of bookings) {
          const attended = attendees.includes(booking.tenantId);

          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: attended ? 'COMPLETED' : 'NO_SHOW' },
          });

          if (!attended) {
            // Increment no-show counter
            const updatedUser = await prisma.user.update({
              where: { id: booking.tenantId },
              data: { noShowCount: { increment: 1 } },
            });

            // Block user if 3+ no-shows
            if (updatedUser.noShowCount >= 3 && !updatedUser.blockedUntil) {
              const blockedUntil = new Date();
              blockedUntil.setMonth(blockedUntil.getMonth() + 3);
              await prisma.user.update({
                where: { id: booking.tenantId },
                data: { blockedUntil },
              });
            }
          }
        }

        return NextResponse.json<ApiResponse<null>>({
          success: true,
          data: null,
          message: 'Presenze registrate',
        });
      }

      default:
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: `Azione '${action}' non riconosciuta` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in queue action:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Errore durante l\'operazione' },
      { status: 500 }
    );
  }
}
