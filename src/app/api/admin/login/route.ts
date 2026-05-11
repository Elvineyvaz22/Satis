import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'lacinsatis-admin-secret-key-change-in-prod'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'lacinsatis2024';
    const salesmanUsername = process.env.SALESMAN_USERNAME || '';
    const salesmanPassword = process.env.SALESMAN_PASSWORD || '';

    let role = '';
    if (username === adminUsername && password === adminPassword) {
      role = 'admin';
    } else if (salesmanUsername && username === salesmanUsername && password === salesmanPassword) {
      role = 'salesman';
    } else {
      return NextResponse.json({ error: 'İstifadəçi adı və ya şifrə yanlışdır' }, { status: 401 });
    }

    const token = await new SignJWT({ username, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
