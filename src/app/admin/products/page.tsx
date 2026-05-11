'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await fetch('/api/products').then(r => r.json());
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newPrice) return;
    setAdding(true);
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), price: parseFloat(newPrice) }),
    });
    setNewName(''); setNewPrice(''); setShowAdd(false);
    await loadProducts();
    setAdding(false);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(p.price.toString());
  }

  async function saveEdit() {
    if (!editProduct) return;
    setSaving(true);
    await fetch(`/api/products/${editProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), price: parseFloat(editPrice) }),
    });
    await loadProducts();
    setSaving(false);
    setEditProduct(null);
  }

  async function deleteProduct(id: number) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    await loadProducts();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Məhsul axtar..."
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition shadow-sm"
        >
          + Yeni məhsul
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={addProduct} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Ad</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Məhsul adı" required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Qiymət (₼)</label>
            <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00"
              step="0.01" min="0" required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-32" />
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Ad</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Qiymət</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">#{p.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-right font-semibold text-orange-500">{p.price.toFixed(2)} ₼</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => openEdit(p)}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-700 transition">
                        Redaktə
                      </button>
                      {deleteConfirm === p.id ? (
                        <span className="flex gap-2">
                          <button onClick={() => deleteProduct(p.id)} className="text-xs font-semibold text-red-600 hover:underline">Sil</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:underline">Ləğv</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition">Sil</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Məhsul tapılmadı</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditProduct(null)} />
          <div className="relative z-10 bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Məhsulu redaktə et</h3>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Ad</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Qiymət (₼)</label>
              <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                step="0.01" min="0"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditProduct(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
                Ləğv et
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                {saving ? 'Saxlanılır...' : 'Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
