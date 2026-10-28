import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { s } from '@/lib/css';
import { fotoPaket, rupiah } from '@/lib/format';
import { getPaketAktif } from '@/lib/queries';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const paket = await getPaketAktif(slug);
  return { title: paket?.nama ?? 'Paket tidak ditemukan' };
}

export default async function DetailPaketPage({ params }: Props) {
  const { slug } = await params;
  const paket = await getPaketAktif(slug);
  if (!paket) notFound();

  const adaPills = paket.durasi || paket.minPeserta > 1 || paket.medan;
  const termasuk = paket.termasuk ?? [];

  return (
    <div className="detail-layout">
      <div className="detail-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img id="detail-hero-img" src={fotoPaket(paket.foto, paket.slug, '800/600')} alt={paket.nama} />
        <div className="top-overlay desktop:hidden">
          <Link href="/" className="icon-btn" aria-label="Kembali ke daftar paket"><span className="material-symbols-outlined">arrow_back</span></Link>
        </div>
      </div>

      <div className="detail-right-col">
        <div className="detail-sheet">
          <h2>{paket.nama}</h2>
          <div className="detail-loc"><span className="material-symbols-outlined" aria-hidden="true">location_on</span>{paket.lokasi}</div>

          <div className="detail-price-row">
            <div>
              <div className="label">Harga mulai</div>
              <div className="value">{rupiah(paket.hargaMulai)} <span style={s('font-size:13px; font-weight:600; color:var(--text-muted);')}>/{paket.satuanHarga.toLowerCase()}</span></div>
            </div>
            {paket.ikon && <span className="material-symbols-outlined" style={s('font-size:30px; color:var(--primary-dark);')} aria-hidden="true">{paket.ikon}</span>}
          </div>

          {adaPills && (
            <div className="info-pills" style={s('display:flex; gap:10px; margin-bottom:18px;')} role="list" aria-label="Informasi paket">
              {paket.durasi && <Pill icon="schedule" nilai={paket.durasi} label="Durasi" />}
              {paket.minPeserta > 1 && <Pill icon="groups" nilai={`Min. ${paket.minPeserta}`} label={paket.satuanHarga.toLowerCase()} />}
              {paket.medan && <Pill icon="route" nilai={paket.medan} label="Medan" />}
            </div>
          )}

          {termasuk.length > 0 && (
            <>
              <h3 style={s('font-size:16px; margin-bottom:10px;')}>Yang termasuk</h3>
              <ul className="include-list" style={s('list-style:none; margin:0 0 16px; padding:0; display:flex; flex-direction:column; gap:10px;')} role="list" aria-label="Fasilitas yang termasuk">
                {termasuk.map((item) => (
                  <li key={item} style={s('display:flex; align-items:center; gap:10px; font-size:14.5px; padding:8px 12px; border-radius:var(--radius-sm); background:var(--surface-soft); transition:all var(--transition-fast);')} role="listitem">
                    <span className="material-symbols-outlined" style={s('font-size:20px; color:#fff; background:var(--primary); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;')} aria-hidden="true">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {paket.deskripsi && (
            <details>
              <summary className="more-toggle" style={s('color:var(--primary-dark); font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; list-style:none;')}>
                Selengkapnya
                <span className="material-symbols-outlined" style={s('font-size:18px; transition:transform var(--transition-base);')} aria-hidden="true">expand_more</span>
              </summary>
              <p className="more-text" style={s('font-size:14px; color:var(--text-muted); line-height:1.6; margin-top:8px;')}>{paket.deskripsi}</p>
            </details>
          )}
        </div>

        <div className="sticky-bar desktop-inline">
          <div className="price-block">
            <div className="lbl">Mulai dari</div>
            <div className="val">{rupiah(paket.hargaMulai)}</div>
          </div>
          <Link href={`/booking/${paket.slug}`} className="btn-primary-lg" aria-label={`Pesan ${paket.nama} sekarang`}>Pesan Sekarang</Link>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, nilai, label }: { icon: string; nilai: string; label: string }) {
  return (
    <div className="info-pill" style={s('flex:1; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; text-align:center;')} role="listitem">
      <span className="material-symbols-outlined" style={s('color:var(--primary-dark); font-size:22px;')} aria-hidden="true">{icon}</span>
      <div className="val" style={s('font-size:14px; font-weight:800; margin-top:4px;')}>{nilai}</div>
      <div className="lbl" style={s('font-size:11px; color:var(--text-muted);')}>{label}</div>
    </div>
  );
}
