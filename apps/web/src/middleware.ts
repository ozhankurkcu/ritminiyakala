import { NextResponse } from 'next/server';

// Auth is guarded client-side in (app)/layout.tsx.
// Middleware redirect was causing a race condition: the firebase-auth-token
// cookie is set client-side after Firebase auth resolves, but middleware
// runs server-side before the cookie exists — resulting in infinite redirects.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
