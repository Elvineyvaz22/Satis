import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'lacinsatis-admin-secret-key-change-in-prod'
);

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return NextResponse.json({ role: null }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ role: payload.role, username: payload.username });
  } catch {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}
