import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@roommate/database';

// GET /api/auth/linked-accounts — Get user's linked social accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const accounts = await (prisma as any).account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        createdAt: true,
      },
    });

    // Check if user has a password (credential account)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    return NextResponse.json({
      success: true,
      accounts: accounts.map((a: any) => ({
        id: a.id,
        provider: a.provider,
        linkedAt: a.createdAt,
      })),
      hasPassword: !!user?.passwordHash,
    });
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// DELETE /api/auth/linked-accounts — Unlink a social account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { provider } = await request.json();
    if (!provider) {
      return NextResponse.json({ error: 'Provider richiesto' }, { status: 400 });
    }

    // Get user's accounts and check they have another way to login
    const accounts = await (prisma as any).account.findMany({
      where: { userId: session.user.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    const hasPassword = !!user?.passwordHash;
    const otherAccounts = accounts.filter((a: any) => a.provider !== provider);

    // Don't allow unlinking if it's the only login method
    if (!hasPassword && otherAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Non puoi scollegare l\'unico metodo di accesso. Imposta prima una password.' },
        { status: 400 }
      );
    }

    // Delete the account link
    await (prisma as any).account.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking account:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
