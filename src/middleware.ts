import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/account',
  '/projects',
  '/organizations',
  '/chat',
];

// Define routes that are only for unauthenticated users
const unProtectedRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextResponse) {
  const session = await auth();
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get authentication status
  const isAuthenticated = !!session?.user;

  // If user is authenticated and tries to access an auth-only page
  if (
    isAuthenticated &&
    unProtectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  ) {
    // Check if there's a redirect parameter
    const redirectParam = url.searchParams.get('redirect');
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }

    // If no redirect specified, go to dashboard or homepage
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and tries to access a protected route
  if (
    !isAuthenticated &&
    protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  ) {
    // Save the current URL to redirect back after login
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname + url.search);

    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated but accessing a specific project/organization

  // Allow the request to proceed if no redirection is needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};