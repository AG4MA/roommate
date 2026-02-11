import { NextResponse } from 'next/server';
import type { ApiResponse } from '@roommate/shared';
import { registerSchema } from '@roommate/shared';
import { prisma } from '@roommate/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const response: ApiResponse<null> = {
        success: false,
        error: result.error.errors[0].message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email, password, name, userType } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Un account con questa email esiste già',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with the appropriate profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        ...(userType === 'landlord'
          ? { landlordProfile: { create: {} } }
          : { tenantProfile: { create: {} } }),
      },
    });

    const response: ApiResponse<{ id: string; email: string; name: string }> = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Account creato con successo',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Errore durante la registrazione',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
