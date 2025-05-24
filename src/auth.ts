import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase-client';

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role?: string;
  rememberMe?: boolean;
  provider?: string;
}

declare module 'next-auth' {
  interface Session {
    user: User;
    maxAge: number;
  }
}

// Define session timing constants
const REMEMBER_ME_PERIOD = 30 * 24 * 60 * 60; // 30 days in seconds
const DEFAULT_PERIOD = 8 * 60 * 60; // 8 hours in seconds

// Custom logging function for server-side auth logs
const authLog = {
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', `[AUTH] ${message}`, data || '');
  },
  success: (message: string, data?: any) => {
    console.log('\x1b[32m%s\x1b[0m', `[AUTH] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.log('\x1b[33m%s\x1b[0m', `[AUTH] ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    console.log('\x1b[31m%s\x1b[0m', `[AUTH] ${message}`, data || '');
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Configure authentication providers
  providers: [
    Credentials({
      authorize: async (credentials: any) => {
        try {
          authLog.info('Processing credentials authorization');

          // The credentials should come pre-authenticated from Firebase Auth
          if (!credentials.email) {
            authLog.error('Missing email in credentials');
            return null;
          }

          // Return user data for session
          return {
            id: credentials.id || credentials.uid || credentials.email,
            name: credentials.name || '',
            email: credentials.email,
            image: credentials.image || 'https://i.pravatar.cc/150?img=3',
            role: credentials.role || 'Trial',
            rememberMe: credentials.rememberMe === true,
            provider: credentials.provider || 'credentials',
          };
        } catch (error) {
          authLog.error('Failed to authorize credentials', error);
          return null;
        }
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: DEFAULT_PERIOD,
  },

  // Callbacks to customize authentication behavior
  callbacks: {
    // JWT callback - customize the token when created or updated
    async jwt({ token, user }) {
      // First time token is created (sign in)
      if (user) {
        authLog.success('Setting JWT user data', { email: user.email });

        // Add user data to token
        token.id = user.id;
        token.role = (user as User).role || 'Trial';
        token.name = (user as User).name;
        token.provider = (user as User).provider;

        try {
          // Update user's lastLogin in Firestore
          const userRef = doc(db, 'users', user.email as string);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.last_used) {
              // Add last used context to token
              token.last_used = userData.last_used;
            }

            // Update lastLogin timestamp
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
            });
          }
        } catch (error) {
          authLog.warn('Failed to update user login timestamp', error);
          // Continue with authentication even if this fails
        }

        // Set session duration based on rememberMe flag
        token.maxAge = (user as User).rememberMe ? REMEMBER_ME_PERIOD : DEFAULT_PERIOD;
        authLog.info(`Session created with duration: ${token.maxAge} seconds`);
      }

      return token;
    },

    // Session callback - what data to pass to the client
    async session({ session, token }: any) {
      if (session.user && token) {
        // Map token data to session user
        session.user.id = token.id || token.sub;
        session.user.role = token.role || 'Trial';
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image =
          token.picture || session.user.image || 'https://i.pravatar.cc/150?img=3';
        session.user.provider = token.provider;
        session.maxAge = token.maxAge || DEFAULT_PERIOD;

        // Add last_used context if available
        if (token.last_used) {
          session.user.last_used = token.last_used;
        }

        // Set expiry date
        const expiryTimeMs = Date.now() + token.maxAge * 1000;
        session.expires = new Date(expiryTimeMs).toISOString();
      }

      session.status = 'authenticated';
      return session;
    },

    // Authorization callback - control access to protected routes
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      // Protect dashboard routes
      if (path.startsWith('/dashboard') && !isLoggedIn) {
        authLog.warn('Unauthorized access attempt', { path });
        return false;
      }

      return true;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
});
