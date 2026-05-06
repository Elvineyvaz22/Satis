import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Vercel-də müvəqqəti qovluq istifadə et
const getDbPath = () => {
  if (process.env.VERCEL) {
    const tempDir = '/tmp';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    return path.join(tempDir, 'lacinsatis.db');
  }
  return path.join(process.cwd(), 'lacinsatis.db');
};

const dbPath = getDbPath();
const db = new Database(dbPath);

// Cədvəlləri yaradın
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    gift_quantity INTEGER DEFAULT 0,
    total_amount REAL NOT NULL,
    qr_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

// Nümunə məhsullar əlavə et (əgər yoxdursa)
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
  insert.run('Çörək (Kiçik)', 0.50);
  insert.run('Çörək (Orta)', 0.80);
  insert.run('Çörək (Böyük)', 1.00);
  insert.run('Sum Çörəyi', 1.50);
  insert.run('Göbələkli Çörək', 2.00);
  insert.run('Südlü Çörək', 1.20);
}

export default db;

export interface Product {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

export interface Sale {
  id: number;
  date: string;
  customer_name: string;
  customer_phone: string;
  latitude: number | null;
  longitude: number | null;
  product_id: number;
  quantity: number;
  gift_quantity: number;
  total_amount: number;
  qr_data: string | null;
  created_at: string;
  product_name?: string;
  product_price?: number;
}