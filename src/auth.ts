import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
      image: string;
    };
    maxAge: number;
  }
}

interface User {
  name: string;
  email: string;
  image: string;
  rememberMe: boolean;
  role?: string;
  id?: string;
}

const demoUser: User = {
  name: 'John Doe',
  email: 'demo@example.com',
  image: 'https://i.pravatar.cc/150?img=3',
  rememberMe: false,
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
  debug: process.env.NODE_ENV !== 'production',

  // Configure authentication providers
  providers: [
    // Credential-based authentication (email/password)
    Credentials({
      authorize: async (credentials: any) => {
        authLog.info('Processing credentials authorization', { email: credentials.email });

        try {
          // TODO: Replace with actual authentication logic against your database
          // This is just a mock implementation for demonstration
          let user = { ...demoUser, rememberMe: credentials.rememberMe, email: credentials.email };

          authLog.success('User authorized successfully', { email: user.email, role: user.role });
          return user;
        } catch (error) {
          authLog.error('Failed to authorize user', error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // authorization: {
      //   params: {
      //     prompt: 'consent',
      //     access_type: 'offline',
      //     response_type: 'code',
      //   },
      // },
      // profile(profile) {
      //   authLog.info('Google profile received', { email: profile.email });
      //   return {
      //     id: profile.sub,
      //     name: profile.name,
      //     email: profile.email,
      //     image: profile.picture,
      //     role: 'user',
      //     rememberMe: false, // Default value for Google login
      //   };
      // },
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
      authLog.info('Processing JWT', { trigger, user, account, token });

      // First time token is created (sign in)
      if (user) {
        authLog.success('Setting JWT user data', { email: user.email });

        // Add user data to token
        token.id = user.id || token.sub;
        token.role = (user as User).role || 'Trial';

        // Set session duration based on rememberMe flag
        if ((user as User).rememberMe) {
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
        authLog.info(`${account.provider} authentication successful`);
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
        session.user.image = (token.picture as string) || session.user.image;
        session.maxAge = (token.maxAge as number) || Default_Period;

        // Safely add expires date
        try {
          const expiryTimeMs = Date.now() + ((token.maxAge as number) || Default_Period) * 1000;
          session.expires = new Date(expiryTimeMs).toISOString();
          authLog.success('Session data prepared for client', session);
        } catch (error) {
          authLog.error('Failed to set session expiry', error);
          // Set a default expiry to avoid errors
          session.expires = new Date(Date.now() + Default_Period * 1000).toISOString();
        }
      }

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

  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error',
  // },
});
