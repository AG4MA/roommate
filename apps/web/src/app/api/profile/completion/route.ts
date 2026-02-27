import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

export interface ProfileCompletionData {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  verifications: {
    emailVerified: boolean;
    idVerified: boolean;
    employmentVerified: boolean;
    incomeVerified: boolean;
  };
  badges: string[];
}

// GET /api/profile/completion — Get profile completion percentage and verified badges
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    }) as any;

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    // Base user fields
    const userFields: [string, boolean, string][] = [
      ['name', !!user.name, 'Nome'],
      ['email', !!user.email, 'Email'],
      ['avatar', !!user.avatar, 'Foto profilo'],
      ['phone', !!user.phone, 'Telefono'],
      ['bio', !!user.bio, 'Biografia'],
      ['dateOfBirth', !!user.dateOfBirth, 'Data di nascita'],
      ['gender', !!user.gender, 'Genere'],
      ['occupation', !!user.occupation, 'Occupazione'],
    ];

    for (const [, completed, label] of userFields) {
      if (completed) completedFields.push(label);
      else missingFields.push(label);
    }

    // Tenant profile fields
    const tp = user.tenantProfile;
    if (tp) {
      const tenantFields: [string, boolean, string][] = [
        ['budget', !!(tp.budgetMin || tp.budgetMax), 'Budget'],
        ['moveInDate', !!tp.moveInDate, 'Data ingresso'],
        ['contractType', !!tp.contractType, 'Tipo contratto'],
        ['incomeRange', !!tp.incomeRange, 'Fascia reddito'],
        ['languages', tp.languages.length > 0, 'Lingue parlate'],
      ];

      for (const [, completed, label] of tenantFields) {
        if (completed) completedFields.push(label);
        else missingFields.push(label);
      }
    } else {
      missingFields.push('Profilo inquilino');
    }

    const totalFields = completedFields.length + missingFields.length;
    const percentage = totalFields > 0 ? Math.round((completedFields.length / totalFields) * 100) : 0;

    // Verifications
    const verifications = {
      emailVerified: user.emailVerified,
      idVerified: user.verified,
      employmentVerified: tp?.employmentVerified ?? false,
      incomeVerified: tp?.incomeVerified ?? false,
    };

    // Calculate badges
    const badges: string[] = [];
    if (user.emailVerified) badges.push('email_verified');
    if (user.verified) badges.push('id_verified');
    if (tp?.employmentVerified) badges.push('employment_verified');
    if (tp?.incomeVerified) badges.push('income_verified');
    if (tp?.referencesAvailable) badges.push('references_available');
    if (tp?.hasGuarantor) badges.push('has_guarantor');
    if (percentage >= 80) badges.push('profile_complete');
    if (percentage === 100) badges.push('profile_perfect');

    const data: ProfileCompletionData = {
      percentage,
      completedFields,
      missingFields,
      verifications,
      badges,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error computing profile completion:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
