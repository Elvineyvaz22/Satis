import { NextRequest, NextResponse } from 'next/server';
import db, { Sale } from '@/lib/db';

// GET - Satış detallarını gətir (QR kod üçün)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sale = db.prepare(`
      SELECT s.*, p.name as product_name, p.price as product_price
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.id = ?
    `).get(id) as Sale | undefined;

    if (!sale) {
      return NextResponse.json({ error: 'Satış tapılmadı' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}