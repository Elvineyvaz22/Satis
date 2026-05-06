'use client';

import { useEffect, useState, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface SaleResponse {
  id: number;
  date: string;
  customer_name: string;
  customer_phone: string;
  latitude: number | null;
  longitude: number | null;
  product_id: number;
  product_name: string;
  quantity: number;
  gift_quantity: number;
  total_amount: number;
  qr_code: string;
  created_at: string;
}

export default function TelegramForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [giftQuantity, setGiftQuantity] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleResult, setSaleResult] = useState<SaleResponse | null>(null);
  const [error, setError] = useState('');

  const totalAmount = selectedProduct ? parseInt(quantity || '0') * selectedProduct.price : 0;

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Məhsullar yüklənə bilmədi:', err);
    }
  };

  const getLocation = useCallback(() => {
    setLocationLoading(true);
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg?.locationManager) {
      tg.locationManager.getLocation((loc: any) => {
        setLocation({ lat: loc.latitude, lon: loc.longitude });
        setLocationLoading(false);
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => setLocationLoading(false)
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!customerName || !selectedProduct || !quantity) {
      setError('Bütün sahələri doldurun!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          customer_name: customerName,
          customer_phone: customerPhone,
          latitude: location?.lat || null,
          longitude: location?.lon || null,
          product_id: selectedProduct.id,
          quantity: parseInt(quantity),
          gift_quantity: parseInt(giftQuantity) || 0,
        }),
      });

      if (!res.ok) throw new Error('Xəta baş verdi');
      
      const data = await res.json();
      setSaleResult(data);
      
      const tg = (window as any).Telegram?.WebApp;
      tg?.hapticFeedback?.notification('success');
      tg?.HapticFeedback?.notification('success');
      
    } catch (err) {
      setError('Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.MainButton) {
      tg.MainButton.setText('Göndər');
      tg.MainButton.onClick(handleSubmit);
      tg.MainButton.show();
    }
    
    return () => {
      tg?.MainButton?.offClick(handleSubmit);
      tg?.MainButton?.hide();
    };
  }, [customerName, selectedProduct, quantity, date, giftQuantity]);

  if (saleResult) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Uğurlu Əməliyyat!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Satış qeydə alındı</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Müştəri</span>
            <span className="font-semibold text-gray-800 dark:text-white">{saleResult.customer_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Məhsul</span>
            <span className="font-semibold text-gray-800 dark:text-white">{saleResult.product_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Miqdar</span>
            <span className="font-semibold text-gray-800 dark:text-white">{saleResult.quantity} ədəd</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-orange-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Hədiyyə</span>
            <span className="font-semibold text-gray-800 dark:text-white">{saleResult.gift_quantity} ədəd</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Cəm Məbləğ</span>
            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{saleResult.total_amount} ₼</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">QR Kod</p>
          <div className="inline-block bg-white p-3 rounded-xl">
            <QRCodeCanvas 
              value={`http://localhost:8000/api/sales/${saleResult.id}`}
              size={180}
              level="H"
              includeMargin
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Skan edərək məlumatları görün</p>
        </div>

        <button
          onClick={() => {
            setSaleResult(null);
            setCustomerName('');
            setCustomerPhone('');
            setQuantity('1');
            setGiftQuantity('0');
            setSelectedProduct(null);
            setLocation(null);
          }}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          Yeni Satış
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📅 Tarix
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Müştəri Məlumatları
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Müştərinin Adı *
          </label>
          <input
            type="text"
            placeholder="Məsələn: Kral Dönər"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Mobil Nömrə
          </label>
          <input
            type="tel"
            placeholder="050 123 45 67"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Kuryer Lokasiyası
          </label>
          <button
            onClick={getLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl shadow-lg active:scale-95 transition-all"
          >
            {locationLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {location ? 'Lokasiya Götürüldü ✓' : locationLoading ? 'Gözləyin...' : 'Lokasiyanı Göndər'}
          </button>
          {location && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 text-center">
              Koordinatlar: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Məhsul Detalları
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Məhsul Seçin *
          </label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const product = products.find(p => p.id === Number(e.target.value));
              setSelectedProduct(product || null);
            }}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="">-- Məhsul seçin --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.price} ₼
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Miqdar *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Hədiyyə Miqdarı
            </label>
            <input
              type="number"
              min="0"
              value={giftQuantity}
              onChange={(e) => setGiftQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-lg font-semibold"
            />
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-orange-100 font-medium">Cəm Məbləğ:</span>
            <span className="text-2xl font-bold">{totalAmount} ₼</span>
          </div>
          <p className="text-orange-100 text-xs mt-1">
            {quantity} ədəd × {selectedProduct.price} ₼
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Göndərilir...
          </span>
        ) : 'Göndər'}
      </button>
    </div>
  );
}