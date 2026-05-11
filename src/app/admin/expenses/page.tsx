'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      if (d.role === 'salesman') router.replace('/admin/dashboard');
    });
  }, []);
  const [search, setSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadExpenses(); }, []);

  async function loadExpenses() {
    setLoading(true);
    const data = await fetch('/api/expenses').then(r => r.json());
    setExpenses(Array.isArray(data)
      ? data.sort((a: Expense, b: Expense) => b.date.localeCompare(a.date))
      : []);
    setLoading(false);
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
    setAdding(true);
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: newDesc.trim(), amount: parseFloat(newAmount), date: newDate }),
    });
    setNewDesc(''); setNewAmount(''); setShowAdd(false);
    await loadExpenses();
    setAdding(false);
  }

  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    await loadExpenses();
  }

  const filtered = expenses.filter(e => {
    if (filterFrom && e.date < filterFrom) return false;
    if (filterTo && e.date > filterTo) return false;
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Açıqlama axtar..."
          className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" />
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition shadow-sm">
          + Yeni xərc
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cəmi Xərc</div>
          <div className="text-2xl font-black text-purple-600 mt-0.5">{total.toFixed(2)} ₼</div>
        </div>
        <div className="ml-auto text-xs text-gray-400">{filtered.length} qeyd</div>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={addExpense} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Açıqlama</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Xərcin açıqlaması" required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Məbləğ (₼)</label>
            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)}
              placeholder="0.00" step="0.01" min="0" required
              className="w-32 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Tarix</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
              Ləğv et
            </button>
            <button type="submit" disabled={adding}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
              {adding ? 'Əlavə olunur...' : 'Əlavə et'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Tarix</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Açıqlama</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Məbləğ</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-purple-50/20 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{e.date}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{e.description}</td>
                  <td className="px-5 py-3 text-right font-semibold text-purple-600">{e.amount.toFixed(2)} ₼</td>
                  <td className="px-5 py-3 text-right">
                    {deleteConfirm === e.id ? (
                      <span className="flex gap-2 justify-end">
                        <button onClick={() => deleteExpense(e.id)} className="text-xs font-semibold text-red-600 hover:underline">Sil</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:underline">Ləğv</button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteConfirm(e.id)}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition">
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Xərc tapılmadı</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
