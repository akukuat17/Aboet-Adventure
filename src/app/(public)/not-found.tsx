import Link from 'next/link';
import { s } from '@/lib/css';

export default function NotFound() {
  return (
    <div style={s('text-align:center; padding:72px 24px;')}>
      <div style={s('width:66px; height:66px; border-radius:50%; background:var(--primary-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;')}>
        <span className="material-symbols-outlined" style={s('font-size:34px; color:var(--primary-dark);')}>explore_off</span>
      </div>
      <h2 style={s('margin-bottom:8px;')}>Halaman tidak ditemukan</h2>
      <p style={s('color:var(--text-muted); margin-bottom:24px;')}>Paket atau halaman yang kamu cari tidak tersedia.</p>
      <Link href="/" className="btn-primary-lg" style={s('display:inline-block; background:var(--primary); color:#fff; font-weight:800; padding:14px 26px; border-radius:999px;')}>Kembali ke Beranda</Link>
    </div>
  );
}
