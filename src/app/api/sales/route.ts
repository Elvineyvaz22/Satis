import { NextRequest, NextResponse } from 'next/server';
import { redis, PRODUCTS_KEY, SALES_KEY, SALE_ID_COUNTER, Sale, generateSaleText } from '@/lib/db';
import db from '@/lib/db';

const STATIC_PRODUCTS = [
  { id: 1, name: 'Çörək (Kiçik)', price: 0.50 },
  { id: 2, name: 'Çörək (Orta)', price: 0.80 },
  { id: 3, name: 'Çörək (Böyük)', price: 1.00 },
  { id: 4, name: 'Sum Çörəyi', price: 1.50 },
  { id: 5, name: 'Göbələkli Çörək', price: 2.00 },
  { id: 6, name: 'Südlü Çörək', price: 1.20 },
];

async function getProducts() {
  try {
    const products = await redis.get<string>(PRODUCTS_KEY);
    if (products && typeof products === 'string') return JSON.parse(products);
    if (Array.isArray(products)) return products;
    return STATIC_PRODUCTS;
  } catch (error) {
    return STATIC_PRODUCTS;
  }
}

async function getSales(): Promise<Sale[]> {
  try {
    const sales = await redis.get<string>(SALES_KEY);
    if (sales && typeof sales === 'string') return JSON.parse(sales);
    if (Array.isArray(sales)) return sales;
    return [];
  } catch (error) {
    return [];
  }
}

async function sendTelegramMessage(text: string, tg_user_id?: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
    });
    if (tg_user_id && tg_user_id.toString() !== chatId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg_user_id, text: text, parse_mode: 'HTML' }),
      }).catch(() => {});
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET() {
  try {
    const sales = await getSales();
    const products = await getProducts();
    const result = sales.map(s => {
      const p = products.find((prod: any) => prod.id === s.product_id);
      return { ...s, product_name: p?.name || 'Məhsul', product_price: p?.price || 0 };
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, customer_name, customer_phone, latitude, longitude, product_id, quantity, gift_quantity = 0, tg_user_id, items, userName } = body;

    if (!date || !customer_name || (!product_id && !items)) {
      return NextResponse.json({ error: 'Məlumatlar çatışmır' }, { status: 400 });
    }

    const products = await getProducts();
    let total_amount = 0;
    let finalItems = items;

    if (items && items.length > 0) {
      total_amount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    } else {
      const product = products.find((p: any) => p.id === Number(product_id));
      total_amount = product ? product.price * Number(quantity) : 0;
      finalItems = [{
        product_id: Number(product_id),
        name: product?.name || 'Məhsul',
        price: product?.price || 0,
        quantity: Number(quantity)
      }];
    }

    const qr_data = `SALE-${Date.now()}`;
    const result = await (db.prepare('INSERT INTO sales') as any).run(
      date, customer_name, customer_phone, latitude, longitude, product_id || 0, quantity || 0, gift_quantity, total_amount, qr_data, finalItems, tg_user_id, userName
    );

    const saleObj = {
      id: result.lastInsertRowid,
      date, customer_name, customer_phone, 
      latitude, longitude, // Buranı əlavə etdik
      total_amount, items: finalItems, gift_quantity, expert_name: userName, created_at: new Date().toISOString()
    };

    const saleText = generateSaleText(saleObj as any);
    await sendTelegramMessage(saleText, tg_user_id);
    
    return NextResponse.json({ ...saleObj, sale_text: saleText });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}