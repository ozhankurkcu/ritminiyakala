import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS  = ['/login', '/signup', '/forgot-password'];
const APP_PATHS     = ['/dashboard', '/profile', '/activities'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('firebase-auth-token')?.value;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAppPath    = APP_PATHS.some((p) => pathname.startsWith(p));

  if (isAppPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/activities/:path*', '/login', '/signup', '/forgot-password'],
};
