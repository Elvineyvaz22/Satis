# LəçinSatış - Telegram Mini App

Telegram Mini App daxilində işləyən çörək satış və logistikasını idarə edən mobil-uyumlu satış sistemi.

## 📁 Layihə Strukturu

```
Lacinsatis/
├── backend/
│   ├── main.py              # FastAPI əsas fayl
│   └── requirements.txt     # Python asılılıqları
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx     # Ana satış formu
│   │       ├── layout.tsx   # Root layout
│   │       └── globals.css  # Ümumi stillər
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.local
├── SPEC.md
└── README.md
```

## 🚀 Quraşdırma və İşə Salma

### Backend (FastAPI)

```bash
# Backend qovluğuna keç
cd backend

# Python virtual mühiti yaradın (məsləhət görülür)
python -m venv venv

# Virtual mühiti aktivləşdirin
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Asılılıqları quraşdırın
pip install -r requirements.txt

# Serveri işə salın
python main.py
# və ya
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend `http://localhost:8000` ünvanında işləyəcək.

### Frontend (Next.js)

```bash
# Yeni terminal açın

# Frontend qovluğuna keç
cd frontend

# Asılılıqları quraşdırın
npm install

# İşə salın
npm run dev
```

Frontend `http://localhost:3000` ünvanında işləyəcək.

## 📱 Telegram Mini App Olaraq Test

1. [BotFather](https://t.me/BotFather) ilə Telegram-da yeni bot yaradın
2. `/newapp` əmri ilə Mini App yaradın
3. Mini App URL olaraq verin: `https://your-domain.com` (və ya local üçün `http://localhost:3000`)
4. Bot tokenini və Mini App URL-i qeyd edin

## 📋 API Endpoints

| Method | Endpoint | Təsvir |
|--------|----------|--------|
| GET | `/` | Sağlamlıq yoxlaması |
| GET | `/api/products` | Bütün məhsulları qaytarır |
| POST | `/api/sales` | Yeni satış yaradır |
| GET | `/api/sales/{id}` | Satış detallarını qaytarır |
| GET | `/api/sales` | Son 50 satışı qaytarır |

## 🗄️ Verilənlər Bazası Strukturu

### products cədvəli
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### sales cədvəli
```sql
CREATE TABLE sales (
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
    qr_code_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
```

## ✨ Xüsusiyyətlər

- ✅ Telegram mövzu uyğunlaşması (Dark/Light)
- ✅ Tarix seçimi (cari gün avtomatik seçilir)
- ✅ Müştəri məlumatları daxiletmə
- ✅ Telegram Location API ilə lokasiya
- ✅ Məhsul seçimi (dropdown)
- ✅ Real-vaxt cəm məbləğ hesablama
- ✅ Hədiyyə miqdarı qeydi
- ✅ QR kod generasiya
- ✅ Telegram Haptic Feedback
- ✅ MainButton göndərmə
- ✅ Mobil-optimizasiya

## 📦 Istifadə Olunan Texnologiyalar

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Telegram Web App SDK

**Backend:**
- FastAPI
- SQLite
- qrcode (Python)

## 🔧 Konfiqurasiya

### Backend URL dəyişdirilməsi
`frontend/.env.local` faylında:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production üçün
Production-da backend URL-i dəyişdirin:
```
NEXT_PUBLIC_API_URL=https://api.sizin-domain.com
```

## 📝 Qeydlər

1. **Telegram Mini App** kimi istifadə etmək üçün HTTPS lazımdır
2. Lokasiya üçün istifadəçi icazəsi tələb olunur
3. QR kod `LacinSatis:{sale_id}` formatında məlumat saxlayır
4. Nümunə məhsullar avtomatik əlavə olunur (ilk işə salma)

## 🌐 Server Deployment (Ubuntu/Debian)

### Sürətli Quraşdırma

```bash
# 1. Faylları serverə köçürün
scp -r backend admin.html index.html deploy.sh nginx.conf user@your-server:/var/www/lacinsatis/

# 2. Deploy scripti işlədin
chmod +x /var/www/lacinsatis/deploy.sh
sudo /var/www/lacinsatis/deploy.sh

# 3. Nginx aktiv edin
sudo cp /var/www/lacinsatis/nginx.conf /etc/nginx/sites-available/lacinsatis
sudo ln -s /etc/nginx/sites-available/lacinsatis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. Backend-i başladın (screen/tmux ilə)
cd /var/www/lacinsatis
source venv/bin/activate
nohup python main.py &
```

### Faylları Serverə Atmaq Üçün

Serverə atmalı olduğunuz fayllar:
- `backend/main.py`
- `backend/requirements.txt`
- `admin.html`
- `index.html`
- `deploy.sh`
- `nginx.conf`

### Backend Avtomatik Başladılması (systemd)

`/etc/systemd/system/lacinsatis.service` faylı yaradın:

```ini
[Unit]
Description=LəçinSatış Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/lacinsatis
ExecStart=/var/www/lacinsatis/venv/bin/python /var/www/lacinsatis/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Aktiv edin:
```bash
sudo systemctl daemon-reload
sudo systemctl enable lacinsatis
sudo systemctl start lacinsatis
```

## ☁️ Vercel Deployment (Tövsiyə Olunur)

### Üstünlükləri
- Pulsuz hosting
- Avtomatik SSL
- API routes ilə backend birləşik
- Asan deployment

### Addımlar

1. **Vercel hesabı yaradın** - [vercel.com](https://vercel.com)

2. **GitHub-a upload edin** və ya Vercel CLI istifadə edin:
```bash
npm i -g vercel
cd frontend
vercel
```

3. **Next.js konfiqurasiyası** (`frontend/next.config.js`):
```js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}
```

4. **Environment Variables** (Vercel dashboard):
```
VERCEL=1
```

5. **Deploy** - Vercel avtomatik olaraq Next.js build edib deploy edəcək

### Diqqət!
- Vercel-də SQLite `/tmp` qovluğunda saxlanılır (müvəqqəti)
- Server restart olanda data silinə bilər
- Əgər dataVacob saxlanılması vacibdirsə, ayrı server istifadə edin

---

Hazırladı: LəçinSatış Komandası
Versiya: 1.0.0
