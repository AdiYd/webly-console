import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// Updated imports to use the new file structure
import { auth as clientAuth, db as clientDb } from '@/lib/firebase/firebase-client';
interface User {
  name: string;
  email: string;
  image: string;
  rememberMe: string | boolean;
  role?: string;
  id?: string;
}
declare module 'next-auth' {
  interface Session {
    user: User;
    maxAge: number;
  }
}

const demoUser: User = {
  id: 'demoUser',
  name: 'John Doe',
  email: 'demo@example.com',
  image: 'https://i.pravatar.cc/150?img=3',
  rememberMe: false, // Changed from 'false' (string) to false (boolean)
  role: 'Trial',
};

// Define session timing constants
const RememberMe_Period = 30 * 24 * 60 * 60; // 30 days in seconds if rememberMe is true
const Default_Period = 8 * 60 * 60; // 8 hours in seconds if rememberMe is false

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
  // Enable debug mode in development for detailed logs
  // debug: process.env.NODE_ENV !== 'production',

  // Configure authentication providers
  providers: [
    // Connect Credentials provider with Firebase Auth
    Credentials({
      authorize: async (credentials: any) => {
        authLog.info('Processing Firebase credentials authorization', { email: credentials.email });
        try {
          // Check that Firebase is initialized
          if (!clientAuth) {
            throw new Error('Firebase Auth is not initialized');
          }
          if (credentials.providerType === 'google' && credentials.idToken) {
            authLog.info('Processing Google ID token authorization');
            // Verify the ID token using Firebase Admin SDK

            if (!credentials.email) {
              throw new Error('No email found in Google ID token.');
            }

            return {
              id: credentials.id,
              name: credentials.name,
              email: credentials.email,
              role: 'Trial',
              image: credentials.image,
              rememberMe: false,
            };
          }

          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(
            clientAuth,
            credentials.email,
            credentials.password
          );

          const firebaseUser = userCredential.user;
          // Get additional user data from Firestore
          if (clientDb) {
            const userDoc = await getDoc(
              doc(clientDb, 'users', firebaseUser.email || firebaseUser.uid)
            );
            if (userDoc.exists()) {
              // Return combined data from Firebase Auth and Firestore
              return {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: userDoc.data().name || firebaseUser.displayName || '',
                image: userDoc.data().image || demoUser.image,
                role: userDoc.data().role || 'Trial',
                rememberMe: credentials.rememberMe,
              };
            }
          }

          // If no Firestore data or DB not initialized, return basic user
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: credentials.name || firebaseUser.displayName || '',
            image: demoUser.image,
            role: 'Trial',
            rememberMe: credentials.rememberMe || false,
          };
        } catch (error) {
          authLog.error('Failed to authorize with Firebase', error);
          return null;
        }
      },
    }),
    // Google provider for Google sign-in
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  // Session configuration
  session: {
    // Use JWT strategy for sessions (stored in cookies, not database)
    strategy: 'jwt',
    // Default session max age - will be modified by JWT callback based on rememberMe
    maxAge: Default_Period,
  },

  // Callbacks to customize authentication behavior
  callbacks: {
    // JWT callback - customize the token when created or updated
    async jwt({ token, user, account, trigger }) {
      // authLog.info('Processing JWT', { trigger, user, token });

      // First time token is created (sign in)
      if (user) {
        authLog.success('Setting JWT user data', { email: user.email });

        // Add user data to token
        token.id = user.id || token.sub;
        token.role = (user as User).role || 'Trial';
        token.name = (user as User).name || user.name;

        try {
          // Get or create user document in Firestore to track last_used context
          const userRef = doc(clientDb, 'users', user.email as string);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // User exists, get last_used context
            const userData = userSnap.data();

            if (userData.last_used) {
              // Add last used context to token
              token.last_used = userData.last_used;
              authLog.info('Retrieved last used context', userData.last_used);
            }

            // Update user's lastLogin
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
            });
          } else {
            // Create new user document
            authLog.info('Creating new user document in Firestore');

            // Create initial user profile
            await setDoc(userRef, {
              email: user.email,
              name: (user as User).name || user.name || 'User',
              role: 'Trial',
              created_at: serverTimestamp(),
              lastLogin: serverTimestamp(),
              last_used: {}, // Empty last_used object to be populated later
            });

            // We don't have last_used context yet for new users
          }
        } catch (error) {
          authLog.error('Failed to manage user Firestore document', error);
        }

        // Set session duration based on rememberMe flag
        if ((user as User).rememberMe === 'true' || (user as User).rememberMe === true) {
          token.maxAge = RememberMe_Period;
          authLog.info('Extended session created (30 days)');
        } else {
          token.maxAge = Default_Period;
          authLog.info('Standard session created (8 hours)');
        }
      }

      // Store provider access tokens for API calls
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.idToken = account.id_token;
        authLog.success(`${account.provider} authentication successful`);
      }

      // Ensure maxAge is always set
      if (!token.maxAge) {
        token.maxAge = Default_Period;
      }

      return token;
    },

    // Session callback - what data to pass to the client
    async session({ session, token }: any) {
      authLog.info('Creating client session', { email: session?.user?.email });

      // Add additional token data to the session for client use
      if (session.user && token) {
        // Map token data to session user
        session.user.id = token.id || (token.sub as string);
        session.user.role = (token.role as string) || 'Trial';
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.image = (token.picture as string) || session.user.image || demoUser.image;
        session.maxAge = (token.maxAge as number) || Default_Period;

        // Add last_used context to session
        if (token.last_used) {
          session.user.last_used = token.last_used;
        }

        // Safely add expires date
        try {
          const expiryTimeMs = Date.now() + ((token.maxAge as number) || Default_Period) * 1000;
          session.expires = new Date(expiryTimeMs).toISOString();
        } catch (error) {
          authLog.error('Failed to set session expiry', error);
          // Set a default expiry to avoid errors
          session.expires = new Date(Date.now() + Default_Period * 1000).toISOString();
        }
      }
      session.status = 'authenticated';
      return session;
    },

    // Authorization callback - control access to protected routes, triggered on each request
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      authLog.info('Authorization check', { path, isLoggedIn });

      // Redirect unauthenticated users from protected routes to login
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
