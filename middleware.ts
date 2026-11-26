// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
 
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (!isProtectedRoute) {
    return NextResponse.next(); 
  }

  
  const token = request.cookies.get('token')?.value;

 
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};