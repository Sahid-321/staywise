import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require middleware protection
  // NOTE: /admin is client-side protected, not middleware protected
  const protectedRoutes = ['/bookings'];
  const adminRoutes: string[] = []; // Admin handled client-side now
  const authRoutes = ['/login', '/signup'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // Fallback to cookie if no Authorization header
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }

  // If user is on auth route and already logged in, redirect to home
  if (isAuthRoute && token) {
    try {
      verifyJWT(token);
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
      // Token is invalid, continue to auth page
    }
  }

  // If route is protected but no token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      const payload = verifyJWT(token);
      
      // If admin route but user is not admin, redirect to home
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Token is invalid, clear it and redirect to login if on protected route
      const response = isProtectedRoute 
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();
      
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

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
  ],
};
