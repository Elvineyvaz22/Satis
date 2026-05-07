import { NextRequest, NextResponse } from 'next/server';
import { redis, PRODUCTS_KEY } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const numId = parseInt(id);
    
    // Məhsulları al
    const productsJson = await redis.get<string>(PRODUCTS_KEY);
    let products: any[] = [];
    
    if (productsJson) {
      products = typeof productsJson === 'string' ? JSON.parse(productsJson) : productsJson;
    } else {
      // Fallback to static if redis is empty
      products = [
        { id: 1, name: 'Çörək (Kiçik)', price: 0.50 },
        { id: 2, name: 'Çörək (Orta)', price: 0.80 },
        { id: 3, name: 'Çörək (Böyük)', price: 1.00 },
        { id: 4, name: 'Sum Çörəyi', price: 1.50 },
        { id: 5, name: 'Göbələkli Çörək', price: 2.00 },
        { id: 6, name: 'Südlü Çörək', price: 1.20 },
      ];
    }
    
    // Məhsulu tap və sil
    const idx = products.findIndex(p => p.id === numId);
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 });
    }
    
    products.splice(idx, 1);
    await redis.set(PRODUCTS_KEY, JSON.stringify(products));
    
    return NextResponse.json({ message: 'Məhsul silindi' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}