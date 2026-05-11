'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const allNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '◈', roles: ['admin', 'salesman'] },
  { href: '/admin/sales', label: 'Satışlar', icon: '🧾', roles: ['admin', 'salesman'] },
  { href: '/admin/products', label: 'Məhsullar', icon: '📦', roles: ['admin', 'salesman'] },
  { href: '/admin/customers', label: 'Müştərilər', icon: '👥', roles: ['admin', 'salesman'] },
  { href: '/admin/reports', label: 'Hesabatlar', icon: '📊', roles: ['admin', 'salesman'] },
  { href: '/admin/expenses', label: 'Xərclər', icon: '💸', roles: ['admin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setUserRole(d.role || null);
      setUserName(d.username || '');
    }).catch(() => {});
  }, []);

  const navItems = allNavItems.filter(item =>
    !userRole || item.roles.includes(userRole)
  );

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-white font-black text-base">L</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">Lacinsatis</div>
            <div className="text-[10px] text-gray-400 font-medium">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          {userName && (
            <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-[10px]">
                {userName[0]?.toUpperCase()}
              </span>
              <span className="truncate">{userName}</span>
              {userRole === 'salesman' && (
                <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">S.M.</span>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <span className="text-base">🚪</span>
            Çıxış
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-xl">☰</span>
          </button>
          <span className="font-semibold text-gray-900 text-sm">
            {navItems.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
