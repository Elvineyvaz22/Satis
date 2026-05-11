import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'lacinsatis-admin-secret-key-change-in-prod'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('admin_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    // Salesman cannot access expenses
    if (payload.role === 'salesman' && pathname.startsWith('/admin/expenses')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
