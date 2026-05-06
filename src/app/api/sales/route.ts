import { NextRequest, NextResponse } from 'next/server';
import db, { Sale, generateSaleText } from '@/lib/db';

// GET - Bütün satışları gətir
export async function GET() {
  try {
    const sales = db.prepare(`
      SELECT s.*, p.name as product_name, p.price as product_price
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      ORDER BY s.id DESC
      LIMIT 50
    `).all() as Sale[];
    
    // Hər satışa sale_text əlavə et
    const salesWithText = sales.map(s => ({
      ...s,
      sale_text: generateSaleText(s)
    }));
    
    return NextResponse.json(salesWithText);
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

// POST - Yeni satış əlavə et
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      customer_name,
      customer_phone,
      latitude,
      longitude,
      product_id,
      quantity,
      gift_quantity = 0
    } = body;

    if (!date || !customer_name || !customer_phone || !product_id || !quantity) {
      return NextResponse.json({ error: 'Bütün sahələri doldurun' }, { status: 400 });
    }

    // Məhsulun qiymətini al
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id) as { id: number; name: string; price: number } | undefined;
    
    if (!product) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 });
    }

    const total_amount = product.price * quantity;
    const qr_data = `LacinSatis:${Date.now()}`;

    const result = db.prepare(`
      INSERT INTO sales (date, customer_name, customer_phone, latitude, longitude, product_id, quantity, gift_quantity, total_amount, qr_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(date, customer_name, customer_phone, latitude || null, longitude || null, product_id, quantity, gift_quantity, total_amount, qr_data);

    // Yeni satış obyekti yaradıb mətn generate et
    const newSale: Sale = {
      id: result.lastInsertRowid as number,
      date,
      customer_name,
      customer_phone,
      latitude: latitude || null,
      longitude: longitude || null,
      product_id,
      quantity,
      gift_quantity,
      total_amount,
      qr_data,
      created_at: new Date().toISOString(),
      product_name: product.name,
      product_price: product.price
    };

    return NextResponse.json({
      ...newSale,
      sale_text: generateSaleText(newSale)
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}