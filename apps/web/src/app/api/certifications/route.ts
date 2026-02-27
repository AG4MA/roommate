import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

// GET /api/certifications — Get certification requests for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'tenant'; // tenant or landlord
    const interestId = searchParams.get('interestId');

    if (role === 'tenant') {
      // Get all certification requests for this tenant
      const where: any = { tenantId: session.user.id };
      if (interestId) where.interestId = interestId;

      const certifications = await (prisma as any).certificationRequest.findMany({
        where,
        include: {
          interest: {
            include: {
              listing: {
                select: { id: true, title: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: certifications.map((c: any) => ({
          id: c.id,
          interestId: c.interestId,
          type: c.type,
          status: c.status,
          documentUrl: c.documentUrl,
          note: c.note,
          listing: c.interest?.listing
            ? { id: c.interest.listing.id, title: c.interest.listing.title }
            : null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      });
    } else {
      // Landlord: get all certification requests for their listings
      const certifications = await (prisma as any).certificationRequest.findMany({
        where: {
          interest: {
            listing: {
              landlordId: session.user.id,
            },
          },
        },
        include: {
          interest: {
            include: {
              listing: {
                select: { id: true, title: true },
              },
            },
          },
          tenant: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: certifications.map((c: any) => ({
          id: c.id,
          interestId: c.interestId,
          type: c.type,
          status: c.status,
          documentUrl: c.documentUrl,
          note: c.note,
          listing: c.interest?.listing
            ? { id: c.interest.listing.id, title: c.interest.listing.title }
            : null,
          tenant: c.tenant
            ? { id: c.tenant.id, name: c.tenant.name, avatar: c.tenant.avatar }
            : null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST /api/certifications — Create (landlord requests) or submit (tenant uploads) certification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'request') {
      // Landlord requests a certification from a tenant
      const { interestId, type } = body;

      if (!interestId || !type) {
        return NextResponse.json(
          { error: 'interestId e type sono richiesti' },
          { status: 400 }
        );
      }

      const validTypes = [
        'EMPLOYMENT_CONTRACT',
        'INCOME_PROOF',
        'STUDENT_ENROLLMENT',
        'GUARANTOR',
        'ID_DOCUMENT',
      ];

      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Tipo di certificazione non valido' },
          { status: 400 }
        );
      }

      // Verify the interest belongs to the landlord's listing
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: {
          listing: { select: { landlordId: true } },
        },
      });

      if (!interest) {
        return NextResponse.json(
          { error: 'Interesse non trovato' },
          { status: 404 }
        );
      }

      if (interest.listing.landlordId !== session.user.id) {
        return NextResponse.json(
          { error: 'Non autorizzato' },
          { status: 403 }
        );
      }

      // Check if already exists
      const existing = await (prisma as any).certificationRequest.findUnique({
        where: {
          interestId_type: {
            interestId,
            type,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Certificazione già richiesta' },
          { status: 409 }
        );
      }

      const certification = await (prisma as any).certificationRequest.create({
        data: {
          interestId,
          tenantId: interest.tenantId,
          type,
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: certification.id,
          type: certification.type,
          status: certification.status,
        },
      });
    } else if (action === 'submit') {
      // Tenant submits a document for a certification
      const { certificationId, documentUrl } = body;

      if (!certificationId || !documentUrl) {
        return NextResponse.json(
          { error: 'certificationId e documentUrl sono richiesti' },
          { status: 400 }
        );
      }

      const certification = await (prisma as any).certificationRequest.findUnique({
        where: { id: certificationId },
      });

      if (!certification) {
        return NextResponse.json(
          { error: 'Certificazione non trovata' },
          { status: 404 }
        );
      }

      if (certification.tenantId !== session.user.id) {
        return NextResponse.json(
          { error: 'Non autorizzato' },
          { status: 403 }
        );
      }

      const updated = await (prisma as any).certificationRequest.update({
        where: { id: certificationId },
        data: {
          documentUrl,
          status: 'SUBMITTED',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          type: updated.type,
          status: updated.status,
          documentUrl: updated.documentUrl,
        },
      });
    } else if (action === 'review') {
      // Landlord reviews a submitted certification
      const { certificationId, status, note } = body;

      if (!certificationId || !status) {
        return NextResponse.json(
          { error: 'certificationId e status sono richiesti' },
          { status: 400 }
        );
      }

      if (!['VERIFIED', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Status deve essere VERIFIED o REJECTED' },
          { status: 400 }
        );
      }

      const certification = await (prisma as any).certificationRequest.findUnique({
        where: { id: certificationId },
        include: {
          interest: {
            include: {
              listing: { select: { landlordId: true } },
            },
          },
        },
      });

      if (!certification) {
        return NextResponse.json(
          { error: 'Certificazione non trovata' },
          { status: 404 }
        );
      }

      if (certification.interest.listing.landlordId !== session.user.id) {
        return NextResponse.json(
          { error: 'Non autorizzato' },
          { status: 403 }
        );
      }

      const updated = await (prisma as any).certificationRequest.update({
        where: { id: certificationId },
        data: {
          status,
          note: note || null,
        },
      });

      // If ID_DOCUMENT is verified, mark user as verified
      if (status === 'VERIFIED' && updated.type === 'ID_DOCUMENT') {
        await prisma.user.update({
          where: { id: certification.tenantId },
          data: { verified: true },
        });
      }

      // If EMPLOYMENT_CONTRACT is verified, mark employment as verified
      if (status === 'VERIFIED' && updated.type === 'EMPLOYMENT_CONTRACT') {
        const tenantProfile = await prisma.tenantProfile.findUnique({
          where: { userId: certification.tenantId },
        });
        if (tenantProfile) {
          await prisma.tenantProfile.update({
            where: { userId: certification.tenantId },
            data: { employmentVerified: true },
          });
        }
      }

      // If INCOME_PROOF is verified, mark income as verified
      if (status === 'VERIFIED' && updated.type === 'INCOME_PROOF') {
        const tenantProfile = await prisma.tenantProfile.findUnique({
          where: { userId: certification.tenantId },
        });
        if (tenantProfile) {
          await prisma.tenantProfile.update({
            where: { userId: certification.tenantId },
            data: { incomeVerified: true },
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          type: updated.type,
          status: updated.status,
          note: updated.note,
        },
      });
    }

    return NextResponse.json(
      { error: 'Azione non valida. Usa request, submit o review.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in certification action:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
