'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/actions/auth';

const NAV = [
  { href: '/admin', ikon: 'dashboard', label: 'Dashboard', exact: true },
  { href: '/admin/pemesanan', ikon: 'receipt_long', label: 'Pemesanan' },
  { href: '/admin/kategori', ikon: 'category', label: 'Kategori' },
  { href: '/admin/paket', ikon: 'local_activity', label: 'Paket Wahana' },
  { href: '/admin/pengaturan', ikon: 'settings', label: 'Pengaturan' },
];

export default function AdminShell({ nama, children, flash }: { nama: string; children: React.ReactNode; flash: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const aktif = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));
  const cls = (n: (typeof NAV)[number]) =>
    'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 ' + (aktif(n) ? 'bg-primary-soft text-primary-dark' : '');

  const links = NAV.map((n) => (
    <Link key={n.href} href={n.href} className={cls(n)}>
      <span className="material-symbols-outlined">{n.ikon}</span>
      {n.label}
    </Link>
  ));
  const keluar = (
    <form action={logout}>
      <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
        <span className="material-symbols-outlined">logout</span>
        Keluar
      </button>
    </form>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-screen">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-dark">landscape</span>
              </div>
              <span className="font-heading font-extrabold text-xl text-gray-900">Aboet Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Menu navigasi utama">{links}</nav>
          <div className="p-4 border-t border-gray-200 flex-shrink-0">{keluar}</div>
        </div>
      </aside>

      {/* Drawer mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      {open && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-sidebar-title">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span id="mobile-sidebar-title" className="font-heading font-extrabold text-lg text-gray-900">Aboet Admin</span>
              <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="p-2 rounded-lg hover:bg-gray-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Menu navigasi mobile">{links}</nav>
            <div className="p-4 border-t border-gray-200">{keluar}</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top bar mobile */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-dark">landscape</span>
            </div>
            <span className="font-heading font-extrabold text-lg text-gray-900">Aboet Admin</span>
          </div>
          <button onClick={() => setOpen(true)} aria-label="Buka menu" className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Header desktop */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-dark">landscape</span>
            </div>
            <span className="font-heading font-extrabold text-lg text-gray-900">Aboet Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{nama}</span>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-dark">
                <span className="material-symbols-outlined">logout</span>
                Keluar
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-16 lg:pt-0">
          {flash}
          {children}
        </main>
      </div>
    </div>
  );
}
