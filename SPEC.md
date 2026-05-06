# LəçinSatış - Telegram Mini App Specification

## Project Overview
- **Name**: LəçinSatış
- **Type**: Telegram Mini App (TMA) for bread sales and logistics
- **Core Functionality**: Mobile-first sales management system for couriers/sellers to record bread orders with QR code verification
- **Target Users**: Couriers and sellers in bread distribution logistics

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS + Telegram Web App SDK (@twa-dev/sdk)
- **Backend**: FastAPI (Python)
- **Database**: SQLite (beginner-friendly, portable)
- **QR Code**: qrcode library (Python) + qrcode.react (Frontend display)

## Feature List

### 1. Sales Entry Form
- [ ] Date picker (auto-filled with current date, editable)
- [ ] Customer name input
- [ ] Customer phone number input
- [ ] Location capture via Telegram Location API
- [ ] Product dropdown selection
- [ ] Quantity input
- [ ] Auto-calculated price from product selection
- [ ] Gift quantity field (optional)
- [ ] Real-time total amount calculation

### 2. QR Code System
- [ ] Generate unique QR code per transaction
- [ ] QR contains transaction ID
- [ ] Display QR code after successful submission
- [ ] Backend QR generation with qrcode library

### 3. Telegram Integration
- [ ] Telegram Theme adaptation (Dark/Light)
- [ ] MainButton for submission
- [ ] Haptic feedback on success
- [ ] Location API integration

### 4. Backend API
- [ ] POST /api/sales - Create new sale
- [ ] GET /api/products - List products
- [ ] GET /api/sales/{id} - Get sale details (for QR scan)
- [ ] SQLite database with sales and products tables

## UI/UX Design Direction
- **Visual Style**: Clean, modern Telegram-native design
- **Color Scheme**: Telegram-adaptive (uses ThemeParams)
- **Layout**: Single-page form with floating MainButton
- **Mobile-First**: Large touch targets (min 48px), thumb-friendly

## Database Schema

### products table
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- price (REAL)
- created_at (TIMESTAMP)

### sales table
- id (INTEGER PRIMARY KEY)
- date (DATE)
- customer_name (TEXT)
- customer_phone (TEXT)
- latitude (REAL)
- longitude (REAL)
- product_id (INTEGER FK)
- quantity (INTEGER)
- gift_quantity (INTEGER DEFAULT 0)
- total_amount (REAL)
- qr_code_path (TEXT)
- created_at (TIMESTAMP)
