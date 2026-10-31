'use client';

import { useRouter } from 'next/navigation';

/** Kembali ke halaman sebelumnya; kalau halaman dibuka langsung (tanpa riwayat) → ke beranda. */
export default function BackButton({ className = '', label = 'Kembali' }: { className?: string; label?: string }) {
  const router = useRouter();
  const kembali = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };
  return (
    <button type="button" onClick={kembali} className={'back-btn ' + className} aria-label="Kembali ke halaman sebelumnya">
      <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      <span className="back-label">{label}</span>
    </button>
  );
}
