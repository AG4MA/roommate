import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { updateTenantProfileSchema } from '@roommate/shared';
import { prisma } from '@roommate/database';

interface TenantProfileData {
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string | null;
  preferredAreas: string[];
  contractType: string | null;
  smoker: boolean;
  hasPets: boolean;
  hasGuarantor: boolean;
  incomeRange: string | null;
  languages: string[];
  referencesAvailable: boolean;
  employmentVerified: boolean;
  incomeVerified: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // TODO: Replace with session auth (Phase 1)
    const userId = searchParams.get('userId');

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const profile = await prisma.tenantProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Profilo non trovato',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const data: TenantProfileData = {
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      moveInDate: profile.moveInDate?.toISOString() ?? null,
      preferredAreas: profile.preferredAreas,
      contractType: profile.contractType,
      smoker: profile.smoker,
      hasPets: profile.hasPets,
      hasGuarantor: profile.hasGuarantor,
      incomeRange: profile.incomeRange,
      languages: profile.languages,
      referencesAvailable: profile.referencesAvailable,
      employmentVerified: profile.employmentVerified,
      incomeVerified: profile.incomeVerified,
    };

    const response: ApiResponse<TenantProfileData> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error fetching profile',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = updateTenantProfileSchema.safeParse(body);
    if (!result.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: result.error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // TODO: Replace with session auth (Phase 1)
    const userId = body.userId as string | undefined;
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const updateData: any = { ...result.data };
    if (updateData.moveInDate) {
      updateData.moveInDate = new Date(updateData.moveInDate);
    }

    const profile = await prisma.tenantProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    const data: TenantProfileData = {
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      moveInDate: profile.moveInDate?.toISOString() ?? null,
      preferredAreas: profile.preferredAreas,
      contractType: profile.contractType,
      smoker: profile.smoker,
      hasPets: profile.hasPets,
      hasGuarantor: profile.hasGuarantor,
      incomeRange: profile.incomeRange,
      languages: profile.languages,
      referencesAvailable: profile.referencesAvailable,
      employmentVerified: profile.employmentVerified,
      incomeVerified: profile.incomeVerified,
    };

    const response: ApiResponse<TenantProfileData> = {
      success: true,
      data,
      message: 'Profilo aggiornato con successo',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating tenant profile:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Errore durante l'aggiornamento del profilo",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
