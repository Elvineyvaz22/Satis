import { NextRequest, NextResponse } from 'next/server';
import db, { Product } from '@/lib/db';

// GET - Bütün məhsulları gətir
export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all() as Product[];
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

// POST - Yeni məhsul əlavə et
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Ad və qiymət məcburidir' }, { status: 400 });
    }

    const result = db.prepare(
      'INSERT INTO products (name, price) VALUES (?, ?)'
    ).run(name, price);

    return NextResponse.json({
      id: result.lastInsertRowid,
      name,
      price
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}