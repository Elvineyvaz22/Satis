'use client';

import { useEffect, useState } from 'react';

interface BasketItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  gift_quantity?: number;
}

interface Sale {
  id: number;
  customer_name: string;
  total_amount: number;
  paid_amount?: number;
  payment_status?: string;
  date?: string;
  created_at: string;
  items?: BasketItem[];
  gift_quantity?: number;
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);
  const [filterFrom, setFilterFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [filterTo, setFilterTo] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetch('/api/sales').then(r => r.json()).then(d => {
      setSales(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const filtered = sales.filter(s => {
    const date = (s.date || s.created_at || '').slice(0, 10);
    return (!filterFrom || date >= filterFrom) && (!filterTo || date <= filterTo);
  });

  const totalRevenue = filtered.reduce((a, s) => a + s.total_amount, 0);
  const totalPaid = filtered.reduce((a, s) => a + (s.paid_amount ?? (s.payment_status === 'paid' ? s.total_amount : 0)), 0);
  const totalDebt = totalRevenue - totalPaid;

  // Debtors
  const debtMap: Record<string, number> = {};
  filtered.forEach(s => {
    const debt = s.total_amount - (s.paid_amount ?? (s.payment_status === 'paid' ? s.total_amount : 0));
    if (debt > 0) debtMap[s.customer_name] = (debtMap[s.customer_name] || 0) + debt;
  });
  const debtors = Object.entries(debtMap).sort((a, b) => b[1] - a[1]);

  // Daily sales
  const dailyMap: Record<string, number> = {};
  filtered.forEach(s => {
    const day = (s.date || s.created_at || '').slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + s.total_amount;
  });
  const dailyEntries = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDay = Math.max(...dailyEntries.map(e => e[1]), 1);

  // Gift stats
  const giftMap: Record<string, { qty: number; value: number }> = {};
  filtered.forEach(s => {
    s.items?.forEach(item => {
      if ((item.gift_quantity || 0) > 0) {
        if (!giftMap[item.name]) giftMap[item.name] = { qty: 0, value: 0 };
        giftMap[item.name].qty += item.gift_quantity || 0;
        giftMap[item.name].value += (item.gift_quantity || 0) * item.price;
      }
    });
  });
  const totalGiftQty = Object.values(giftMap).reduce((a, g) => a + g.qty, 0);
  const totalGiftValue = Object.values(giftMap).reduce((a, g) => a + g.value, 0);

  return (
    <div className="space-y-5">
      {/* Date filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Başlanğıc</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Son tarix</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="ml-auto self-end text-xs text-gray-400 pb-1">{filtered.length} sifariş</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Ümumi Satış', value: `${totalRevenue.toFixed(2)} ₼`, color: 'text-gray-900' },
              { label: 'Yığılan', value: `${totalPaid.toFixed(2)} ₼`, color: 'text-green-600' },
              { label: 'Qalıq Borc', value: `${totalDebt.toFixed(2)} ₼`, color: 'text-red-500' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k.label}</div>
                <div className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-4">Günlük Satışlar</h2>
            {dailyEntries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Bu dövr üçün məlumat yoxdur</p>
            ) : (
              <div className="space-y-2">
                {dailyEntries.map(([day, amount]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 shrink-0">{day}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full transition-all"
                        style={{ width: `${(amount / maxDay) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-20 text-right">{amount.toFixed(2)} ₼</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debtors */}
          {debtors.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Borclular ({debtors.length})</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {debtors.map(([name, debt]) => (
                    <tr key={name} className="border-b border-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{name}</td>
                      <td className="px-5 py-3 text-right font-semibold text-red-500">{debt.toFixed(2)} ₼</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Gifts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Hədiyyələr</h2>
              <span className="text-xs text-gray-400">{totalGiftQty} ədəd · {totalGiftValue.toFixed(2)} ₼</span>
            </div>
            {Object.keys(giftMap).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Bu dövr üçün hədiyyə yoxdur</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Məhsul</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Miqdar</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Dəyər</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(giftMap).sort((a, b) => b[1].qty - a[1].qty).map(([name, g]) => (
                    <tr key={name} className="border-b border-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{name}</td>
                      <td className="px-5 py-3 text-right text-orange-500 font-semibold">{g.qty} ədəd</td>
                      <td className="px-5 py-3 text-right text-gray-600">{g.value.toFixed(2)} ₼</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
