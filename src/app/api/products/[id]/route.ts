import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// DELETE - Məhsulu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Məhsul silindi' });
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}