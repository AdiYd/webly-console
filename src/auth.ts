import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface User {
  name: string;
  email: string;
  image: string;
  rememberMe: boolean;
}

interface Credential {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    Credentials({
      authorize: async (credentials: any) => {
        console.log('Authorizing user...', credentials);
        let user: User = {
          name: 'John Doe',
          email: credentials.email,
          image: 'https://i.pravatar.cc/300',
          rememberMe: credentials.rememberMe || false,
        };

        return user;
      },
    }),
  ],
});
