import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/account',
  '/projects',
  '/organizations',
  '/chat',
];

// Define routes that are only for unauthenticated users
const authOnlyRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextResponse) {
  const session = await auth();
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get authentication status
  const isAuthenticated = !!session?.user;

  // Check if this is a project-specific route
  const isProjectRoute = pathname.startsWith('/projects/') && pathname !== '/projects/new';

  // Check if this is an organization-specific route
  const isOrgRoute = pathname.startsWith('/organizations/') && pathname !== '/organizations/new';

  // If user is authenticated and tries to access an auth-only page
  if (
    isAuthenticated &&
    authOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  ) {
    // Check if there's a redirect parameter
    const redirectParam = url.searchParams.get('redirect');
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }

    // If no redirect specified, go to dashboard or homepage
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
  if (isAuthenticated && (isProjectRoute || isOrgRoute)) {
    // We'll let the page component handle permission checks and NotFound states
    // This allows for more granular control and better user feedback in the UI
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
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
