import { NextRequest, NextResponse } from 'next/server';
import db, { redis, CUSTOMERS_KEY } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const raw = await redis.get<string>(CUSTOMERS_KEY);
    let customers: any[] = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : [];

    const idx = customers.findIndex((c: any) => String(c.id) === String(id));
    if (idx === -1) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    customers[idx] = { ...customers[idx], ...body };
    await redis.set(CUSTOMERS_KEY, JSON.stringify(customers));
    return NextResponse.json(customers[idx]);
  } catch {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await (db.prepare('DELETE FROM customers WHERE id = ?') as any).run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Müştəri tapılmadı' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Müştəri silindi' });
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
