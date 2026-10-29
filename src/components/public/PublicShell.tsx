'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function Brand() {
  return (
    <div className="brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={40} height={40} className="brand-logo" />
      <span>Aboet Adventure</span>
    </div>
  );
}

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Halaman detail/booking/profil: topbar tanpa bottom-nav (sama seperti versi Blade)
  const halamanDalam = pathname.startsWith('/paket/') || pathname.startsWith('/booking/') || pathname === '/profil';
  const aktifHome = pathname === '/';
  const aktifProfil = pathname === '/profil';

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [menuOpen]);

  const menuBtn = (
    <div className="actions">
      <button id="mobile-menu-btn" aria-label="Buka menu navigasi" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((v) => !v)} className="icon-btn">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );

  return (
    <div className="app min-h-screen">
      <header className="desktop-header hidden desktop:flex">
        <Brand />
        <div className="nav-links">
          <Link href="/" className={aktifHome ? 'active' : ''}>Paket Wahana</Link>
          <Link href="/profil" className={aktifProfil ? 'active' : ''}>Profil</Link>
        </div>
      </header>

      <div className={(halamanDalam ? 'topbar' : 'home-header') + ' desktop:hidden'}>
        <Brand />
        {menuBtn}
      </div>

      <main>{children}</main>


      <div
        id="mobile-menu"
        className={'mobile-menu-overlay' + (menuOpen ? ' active' : '')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        aria-hidden={!menuOpen}
        onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <span id="mobile-menu-title" className="title">Menu</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Tutup menu" className="icon-btn">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="mobile-menu-links" aria-label="Menu navigasi">
            <Link href="/" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined" aria-hidden="true">home</span> Paket Wahana</Link>
            <Link href="/profil" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined" aria-hidden="true">info</span> Profil</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
