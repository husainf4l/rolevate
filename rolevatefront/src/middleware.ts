import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/', '/about', '/contact', '/interview', '/room', '/room2', '/schedule-meeting', '/try-it-now', '/jobs']; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || 
                      pathname.startsWith('/_next') || 
                      pathname.startsWith('/api') ||
                      pathname.startsWith('/jobs/'); // Allow dynamic job routes
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  // For JWT tokens in localStorage, we need to check on the client side
  // The middleware will allow the request to go through and let the client-side
  // authentication check handle the redirect
  const authHeader = request.headers.get('authorization');
  const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

  console.log(`[Middleware] ${pathname} - isAuth: ${isAuthenticated}, isPublic: ${isPublicPage}, isProtected: ${isProtectedRoute}`);

  // ✅ 1. Authenticated User (if we can detect it)
  if (isAuthenticated) {
    if (pathname === '/login') {
      console.log('[Middleware] Authenticated user accessing login, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ✅ 2. Public routes are always allowed
  if (isPublicPage) {
    return NextResponse.next();
  }

  // ✅ 3. Protected routes - we'll let the client-side auth check handle this
  // since we can't reliably check localStorage from middleware
  if (isProtectedRoute) {
    // Allow the request to go through - the AuthChecker component will handle the redirect
    return NextResponse.next();
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
