// This route handles NextAuth.js session requests
// DO NOT use 'use server' here as it causes ClientFetchError

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// GET handler for /api/auth/session
export async function GET(req: NextRequest) {
  try {
    console.log("Fetching session data...");
    
    // Use JWT token instead of auth() to avoid Edge runtime issues
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    console.log("Session token:", token ? "Found" : "Not found");
    
    // If we have a token, construct a session-like response
    if (token) {
      return NextResponse.json({
        user: {
          id: token.sub || token.id || "1",
          name: token.name,
          email: token.email,
          image: token.picture
        },
        expires: token.exp ? new Date(token.exp * 1000).toISOString() : null
      }, { status: 200 });
    }
    
    // Return null session if not authenticated
    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}