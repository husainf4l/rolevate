import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'token'; 

const PUBLIC_ROUTES = ['/login', '/signup', '/', '/about', '/contact', '/interview', '/room', '/room2', '/schedule-meeting', '/try-it-now', '/jobs']; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || 
                      pathname.startsWith('/_next') || 
                      pathname.startsWith('/api') ||
                      pathname.startsWith('/jobs/'); // Allow dynamic job routes
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);

  console.log(`[Middleware] ${pathname} - isAuth: ${isAuthenticated}, isPublic: ${isPublicPage}, isProtected: ${isProtectedRoute}`);

  // ✅ 1. Authenticated User
  if (isAuthenticated) {
    if (pathname === '/login') {
      console.log('[Middleware] Authenticated user accessing login, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ✅ 2. Unauthenticated User
  if (!isAuthenticated) {
    // Allow access to public pages
    if (isPublicPage) {
      return NextResponse.next();
    }

    // Protect dashboard routes
    if (isProtectedRoute) {
      console.log('[Middleware] Unauthenticated user accessing protected route, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname); 
      return NextResponse.redirect(loginUrl);
    }

    // Allow other routes (like static assets, etc.)
    return NextResponse.next();
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
