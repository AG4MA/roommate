import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(role: 'landlord' | 'tenant') {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Role '${role}' required`);
  }
  return user;
}
