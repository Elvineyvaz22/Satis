import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
