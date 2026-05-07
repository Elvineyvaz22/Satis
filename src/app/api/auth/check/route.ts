import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ role: null, error: 'User ID missing' }, { status: 400 });
    }

    const adminIds = (process.env.ADMIN_IDS || '').split(',').map(id => id.trim());
    const courierIds = (process.env.COURIER_IDS || '').split(',').map(id => id.trim());
    const expertIds = (process.env.EXPERT_IDS || '').split(',').map(id => id.trim());

    const uid = userId.toString();

    if (adminIds.includes(uid)) {
      return NextResponse.json({ role: 'admin' });
    } else if (courierIds.includes(uid)) {
      return NextResponse.json({ role: 'courier' });
    } else if (expertIds.includes(uid)) {
      return NextResponse.json({ role: 'expert' });
    }

    return NextResponse.json({ role: null });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ role: null, error: 'Server error' }, { status: 500 });
  }
}
