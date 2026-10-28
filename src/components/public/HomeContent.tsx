'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { s } from '@/lib/css';
import { fotoPaket, rupiah } from '@/lib/format';

export type PaketKartu = { slug: string; nama: string; lokasi: string; hargaMulai: number; satuanHarga: string; foto: string | null };
export type KategoriKartu = { id: number; slug: string; nama: string; ikon: string; warnaBg: string; warnaIkon: string; paket: PaketKartu[] };

function PaketCard({ paket, kategori }: { paket: PaketKartu; kategori: KategoriKartu }) {
  return (
    <Link href={`/paket/${paket.slug}`} className="list-card" role="listitem" aria-label={`Lihat detail ${paket.nama}`}>
      <div className="thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotoPaket(paket.foto, paket.slug)} alt="" loading="lazy" />
        <span className="arrow-badge" aria-hidden="true"><span className="material-symbols-outlined">arrow_outward</span></span>
        <span className="kategori-badge" style={s(`position:absolute; top:12px; left:12px; background:${kategori.warnaBg}; color:${kategori.warnaIkon}; font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px;`)}>{kategori.nama}</span>
      </div>
      <div className="body">
        <div className="name">{paket.nama}</div>
        <div className="loc"><span className="material-symbols-outlined" aria-hidden="true">location_on</span>{paket.lokasi}</div>
        <div className="card-bottom-row">
          <div className="card-price">{rupiah(paket.hargaMulai)} <span style={s('font-size:12px; font-weight:500; color:var(--text-muted);')}>/{paket.satuanHarga.toLowerCase()}</span></div>
          <button className="btn-lihat" type="button" aria-label={`Lihat detail ${paket.nama}`}>Lihat</button>
        </div>
      </div>
    </Link>
  );
}

export default function HomeContent({ kategori }: { kategori: KategoriKartu[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const tampil = useMemo(
    () => kategori.map((k) => ({ ...k, paket: k.paket.filter((p) => !q || p.nama.toLowerCase().includes(q)) })).filter((k) => k.paket.length > 0),
    [kategori, q],
  );

  return (
    <>
      <div className="hero-banner" style={{ backgroundImage: 'url(https://picsum.photos/seed/hero-aboet/800/600)' }}>
        <div className="hero-text">
          <h2>Liburan Seru<br />Menanti!</h2>
          <p>Pilih wahana favoritmu, nikmati pengalaman tak terlupakan di alam Sentul</p>
        </div>
      </div>

      <div className="hero-search" role="search">
        <span className="material-symbols-outlined" aria-hidden="true">search</span>
        <input type="text" placeholder="Cari wahana..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Cari wahana" />
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </div>

      <nav className="category-row" aria-label="Kategori wahana" style={s('display:flex; gap:8px; overflow-x:auto; padding:26px 20px 8px; scrollbar-width:none;')}>
        {kategori.map((k) => (
          <a key={k.id} href={`#kategori-${k.slug}`} className="category-chip" style={s('width:auto; flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; transition:transform var(--transition-fast);')} aria-label={`Lihat kategori ${k.nama}`}>
            <span className="cat-icon" style={s(`background:${k.warnaBg}; width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,.08); transition:all var(--transition-base);`)}>
              <span className="material-symbols-outlined" style={s(`color:${k.warnaIkon}; font-size:26px;`)}>{k.ikon}</span>
            </span>
            <span className="lbl" style={s('font-size:12.5px; font-weight:700; color:var(--text); white-space:nowrap; text-align:center;')}>{k.nama}</span>
          </a>
        ))}
      </nav>

      {tampil.map((k) => (
        <section key={k.id} id={`kategori-${k.slug}`} aria-labelledby={`heading-${k.slug}`}>
          <div className="section-head"><h3 id={`heading-${k.slug}`}>{k.nama}</h3></div>
          <div className="paket-scroll" role="list" aria-label={k.nama}>
            {k.paket.map((p) => <PaketCard key={p.slug} paket={p} kategori={k} />)}
          </div>
        </section>
      ))}
    </>
  );
}
