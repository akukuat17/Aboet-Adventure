import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { s } from '@/lib/css';
import { fotoPaket, rupiah, tanggalPanjang } from '@/lib/format';
import { getPemesananPublik, getWaNumber } from '@/lib/queries';

export const metadata: Metadata = { title: 'Pesanan Terkirim' };
export const dynamic = 'force-dynamic';

export default async function TerkirimPage() {
  const id = Number((await cookies()).get('pemesanan_id')?.value);
  const [pemesanan, wa] = await Promise.all([Number.isInteger(id) && id > 0 ? getPemesananPublik(id) : null, getWaNumber()]);

  return (
    <>
      <div className="confirm-hero" style={s('text-align:center; padding:48px 24px 24px;')}>
        <div className="confirm-check" style={s('width:66px; height:66px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;')}>
          <span className="material-symbols-outlined" style={s('font-size:36px; color:#fff;')}>check</span>
        </div>
        <h2 style={s('margin-bottom:8px;')}>Pesan Terkirim!</h2>
        <p style={s('color:var(--text-muted);')}>Detail pemesananmu telah dikirim ke WhatsApp Aboet Adventure. Tim kami akan membalas segera.</p>
      </div>

      {pemesanan && (
        <div className="ticket-card" style={s('margin:18px 18px 0; background:var(--surface); border-radius:var(--radius-lg); box-shadow:var(--shadow); overflow:hidden;')}>
          <div className="thumb-row" style={s('display:flex; gap:12px; padding:16px;')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoPaket(pemesanan.paket.foto, pemesanan.paket.slug, '64/64')} alt={pemesanan.paket.nama} style={s('width:64px; height:64px; border-radius:var(--radius-sm); object-fit:cover;')} />
            <div>
              <div className="name" style={s('font-size:15px; font-weight:800;')}>{pemesanan.paket.nama}</div>
              <div className="loc" style={s('font-size:12.5px; color:var(--text-muted); margin-top:3px;')}>{pemesanan.paket.lokasi}</div>
            </div>
          </div>
          <div className="ticket-detail" style={s('padding:0 16px 16px; display:flex; flex-direction:column; gap:10px;')}>
            {[
              ['Kode', pemesanan.kode],
              ['Tanggal', tanggalPanjang(pemesanan.tanggalKunjungan)],
              ['Jumlah', `${pemesanan.jumlah} ${pemesanan.paket.satuanHarga.toLowerCase()}`],
            ].map(([k, v]) => (
              <div key={k} className="row" style={s('display:flex; justify-content:space-between; font-size:14px;')}>
                <span className="k" style={s('color:var(--text-muted);')}>{k}</span>
                <span className="v" style={s('font-weight:700;')}>{v}</span>
              </div>
            ))}
            <div className="row total" style={s('display:flex; justify-content:space-between; font-size:14px;')}>
              <span className="k" style={s('color:var(--text-muted);')}>Estimasi</span>
              <span className="v" style={s('color:var(--primary-dark); font-size:16px; font-weight:800;')}>{rupiah(pemesanan.estimasiTotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="page-actions" style={s('padding:24px 18px 16px; display:flex; flex-direction:column; gap:12px;')}>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-primary-full" style={s('text-align:center; display:block; background:var(--primary); color:#fff; border:none; font-size:16px; font-weight:800; padding:16px; border-radius:999px; min-height:54px; box-shadow:0 8px 18px rgba(31,122,70,.28); text-decoration:none;')}>Buka WhatsApp</a>
        <Link href="/" className="btn-secondary-full" style={s('text-align:center; display:block; background:var(--surface); color:var(--primary-dark); border:2px solid var(--primary); font-size:15px; font-weight:800; padding:14px; border-radius:999px; min-height:50px; text-decoration:none;')}>Kembali ke Beranda</Link>
      </div>
    </>
  );
}
