// export { auth as middleware } from '@/auth';
// filepath: src/middleware.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Adjust path if needed

export async function middleware(request: NextResponse) {
  const session = await auth();
  const pathname = request.url;
  console.log('Middleware session:', session);
  console.log('Middleware pathname:', pathname);

  const isAuthenticated = !!session?.user;
  const isAuthPage = pathname.startsWith('/auth');

  // If user is authenticated and tries to access an auth page (signin, signup, etc.)
  if (isAuthenticated && isAuthPage) {
    // Redirect them to the dashboard or homepage
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
