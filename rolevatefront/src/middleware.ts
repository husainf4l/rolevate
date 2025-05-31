import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'token'; 

const PUBLIC_ROUTES = ['/login', '/about', '/contact']; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPage = PUBLIC_ROUTES.includes(pathname);
  const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);

  // ✅ 1. Authenticated User
  if (isAuthenticated) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    if (isPublicPage) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
