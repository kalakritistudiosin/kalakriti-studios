import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const adminEmail = () =>
  (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

// Google OAuth only.
// ADMIN role is assigned only when the Google email matches ADMIN_EMAIL.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') {
        return false;
      }

      const email = String(profile?.email || '').toLowerCase();

      if (!email || profile?.email_verified === false) {
        return false;
      }

      const role = email === adminEmail() ? 'ADMIN' : 'CUSTOMER';

      try {
        await prisma.user.upsert({
          where: {
            email,
          },
          update: {
            image: (profile?.picture as string) || undefined,
            role,
          },
          create: {
            email,
            name: (profile?.name as string) || email.split('@')[0],
            image: (profile?.picture as string) || null,
            role,
          },
        });

        return true;
      } catch (error) {
        console.error('[AUTH-DB-ERROR]', error);
        throw error;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const db = await prisma.user.findUnique({
          where: {
            email: user.email.toLowerCase(),
          },
        });

        if (db) {
          token.uid = db.id;
          token.role = db.role;
          token.name = db.name;
          token.picture = db.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) || '';
        session.user.role =
          (token.role as 'ADMIN' | 'CUSTOMER') || 'CUSTOMER';
      }

      return session;
    },
  },
});
