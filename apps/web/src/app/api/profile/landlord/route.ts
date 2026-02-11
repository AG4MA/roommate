import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { prisma } from '@roommate/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface LandlordProfileData {
  companyName: string | null;
  description: string | null;
  contactPreference: string;
  phonePublic: boolean;
  emailPublic: boolean;
  responseRate: number;
  responseTime: number;
  totalListings: number;
  idVerified: boolean;
  phoneVerified: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const profile = await prisma.landlordProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Profilo proprietario non trovato' },
        { status: 404 }
      );
    }

    const data: LandlordProfileData = {
      companyName: profile.companyName,
      description: profile.description,
      contactPreference: profile.contactPreference,
      phonePublic: profile.phonePublic,
      emailPublic: profile.emailPublic,
      responseRate: profile.responseRate,
      responseTime: profile.responseTime,
      totalListings: profile.totalListings,
      idVerified: profile.idVerified,
      phoneVerified: profile.phoneVerified,
    };

    return NextResponse.json<ApiResponse<LandlordProfileData>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching landlord profile:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName: body.companyName ?? undefined,
        description: body.description ?? undefined,
        contactPreference: body.contactPreference ?? undefined,
        phonePublic: body.phonePublic ?? undefined,
        emailPublic: body.emailPublic ?? undefined,
      },
      create: {
        userId: session.user.id,
        companyName: body.companyName ?? null,
        description: body.description ?? null,
        contactPreference: body.contactPreference ?? 'IN_APP',
        phonePublic: body.phonePublic ?? false,
        emailPublic: body.emailPublic ?? false,
      },
    });

    // Also update user name/phone/bio if provided
    if (body.name || body.phone || body.bio) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: body.name ?? undefined,
          phone: body.phone ?? undefined,
          bio: body.bio ?? undefined,
        },
      });
    }

    const data: LandlordProfileData = {
      companyName: profile.companyName,
      description: profile.description,
      contactPreference: profile.contactPreference,
      phonePublic: profile.phonePublic,
      emailPublic: profile.emailPublic,
      responseRate: profile.responseRate,
      responseTime: profile.responseTime,
      totalListings: profile.totalListings,
      idVerified: profile.idVerified,
      phoneVerified: profile.phoneVerified,
    };

    return NextResponse.json<ApiResponse<LandlordProfileData>>({
      success: true,
      data,
      message: 'Profilo aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating landlord profile:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Errore durante l'aggiornamento del profilo" },
      { status: 500 }
    );
  }
}
