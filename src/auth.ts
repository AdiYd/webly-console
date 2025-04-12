import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// Import FirestoreAdapter only in non-edge environments
// This is to avoid Edge runtime compatibility issues
let FirestoreAdapter;
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  const { FirestoreAdapter: FSAdapter } = require("@auth/firebase-adapter");
  FirestoreAdapter = FSAdapter;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Only use adapter in non-edge environments
  ...(FirestoreAdapter && typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge' 
    ? { adapter: FirestoreAdapter(require("./lib/firebase/firebase").clientFirebase.app) } 
    : {}),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // You can implement your own credentials authentication with Firebase
          // This is just a placeholder
          return {
            id: "1",
            name: "User",
            email: credentials.email,
          } as User;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user, token }) {
      // For JWT strategy, use token.sub as the user ID
      if (session?.user) {
        session.user.id = user?.id || token?.sub || "1";
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user.id to the token right after sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",  // Using JWT is more compatible with Edge
  },
});
