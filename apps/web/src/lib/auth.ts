import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@roommate/database';

// Dynamic import bcryptjs to avoid issues if not yet installed
async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(plain, hash);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
        };
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name?.firstName
            ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
            : profile.email?.split('@')[0] || 'Utente Apple',
          email: profile.email,
          avatar: null,
        };
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, handle account linking
      if (account && account.provider !== 'credentials') {
        const email = user.email;
        if (!email) return false;

        // Check if a user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if this provider is already linked
          const existingAccount = existingUser.accounts.find(
            (a: { provider: string }) => a.provider === account.provider
          );

          if (!existingAccount) {
            // Link the OAuth account to the existing user
            await (prisma as any).account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token as string | undefined,
                refresh_token: account.refresh_token as string | undefined,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token as string | undefined,
                session_state: account.session_state as string | undefined,
              },
            });
          }

          // Update avatar from social if user doesn't have one
          if (!existingUser.avatar && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { avatar: user.image },
            });
          }

          // Mark email as verified (OAuth emails are pre-verified)
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: true },
            });
          }

          // Override the user id so JWT gets the correct existing user id
          user.id = existingUser.id;
          user.name = existingUser.name;
          user.avatar = existingUser.avatar || user.image || null;
        } else {
          // New user from OAuth — will be auto-created by adapter
          // Mark email as verified
          // Note: adapter creates user first, so we update after
          const newUser = await prisma.user.findUnique({ where: { email } });
          if (newUser) {
            await prisma.user.update({
              where: { id: newUser.id },
              data: { emailVerified: true },
            });
            user.id = newUser.id;
            user.avatar = newUser.avatar || user.image || null;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.avatar = user.avatar;
      }
      // On first OAuth sign-in, refresh user data
      if (account && account.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.avatar = dbUser.avatar;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.avatar = token.avatar;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
