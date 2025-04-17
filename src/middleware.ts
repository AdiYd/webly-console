import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile', '/account', '/projects'];

// Define routes that are only for unauthenticated users
const authOnlyRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextResponse) {
  const session = await auth();
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get authentication status
  const isAuthenticated = !!session?.user;

  // If user is authenticated and tries to access an auth-only page
  if (isAuthenticated && authOnlyRoutes.includes(pathname)) {
    // Redirect them to the dashboard or homepage
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and tries to access a protected route
  if (!isAuthenticated && protectedRoutes.includes(pathname)) {
    // Redirect them to the signin page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Allow the request to proceed if no redirection is needed
  return NextResponse.next();
}

// Configure the matcher to run middleware only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Explicitly include auth routes if needed, but the above pattern usually covers them
    // '/auth/:path*',
  ],
};
