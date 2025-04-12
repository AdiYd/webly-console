import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for path:', request.nextUrl.pathname);
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin', '/auth/signup'];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  );

  // Always allow access to API routes and public paths
  const isApiPath = request.nextUrl.pathname.startsWith('/api');
  if (isPublicPath || isApiPath) {
    return NextResponse.next();
  }

  // Use JWT token to check authentication status instead of auth()
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // If not authenticated, redirect to sign in page
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};