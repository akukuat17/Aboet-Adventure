import type { Metadata } from 'next';
import Link from 'next/link';
import { getRekap } from '@/lib/queries';
import { rupiah, tanggalPendek } from '@/lib/format';
import DonutBCA from '@/components/admin/DonutBCA';
import RekapHarian from '@/components/admin/RekapHarian';

export const metadata: Metadata = { title: 'Rekap Bulanan' };
export const dynamic = 'force-dynamic';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BADGE: Record<string, string> = { baru: 'badge-warning', dikonfirmasi: 'badge-info', selesai: 'badge-success', batal: 'badge-gray' };

function bulanIni(): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(new Date());
  return p.slice(0, 7);
}
function geser(b: string, d: number): string {
  const [y, m] = b.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function Rekap({ searchParams }: { searchParams: Promise<{ bulan?: string }> }) {
  const sp = await searchParams;
  const bulan = sp.bulan && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.bulan) ? sp.bulan : bulanIni();
  const r = await getRekap(bulan);
  const [y, m] = bulan.split('-').map(Number);
  const hariDalamBulan = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const map = new Map(r.harian.map((h) => [h.hari, h]));
  const labels: string[] = [], pend: number[] = [], pes: number[] = [];
  for (let d = 1; d <= hariDalamBulan; d++) {
    const k = `${bulan}-${String(d).padStart(2, '0')}`;
    labels.push(String(d)); pend.push(map.get(k)?.pendapatan ?? 0); pes.push(map.get(k)?.total ?? 0);
  }
  const s = r.ringkas;
  const kartu = [
    { l: 'Pendapatan', v: rupiah(s.pendapatan), s: `Family ${rupiah(s.pendapatanFamily)} · Korporat ${rupiah(s.pendapatanKorporat)}` },
    { l: 'Total Pemesanan', v: String(s.total), s: `${s.family} family · ${s.korporat} korporat` },
    { l: 'Peserta', v: String(s.peserta), s: 'dari pesanan dikonfirmasi/selesai' },
    { l: 'Klik WA Korporat', v: String(r.klikKorporat), s: 'tombol WhatsApp korporat' },
  ];

  return (
    <>
      <div className="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Rekap Bulanan</h1>
          <p className="text-gray-600 mt-1">{BULAN[m - 1]} {y}</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Link href={`/admin/rekap?bulan=${geser(bulan, -1)}`} className="btn btn-ghost" aria-label="Bulan sebelumnya">&larr;</Link>
          <form method="GET" className="flex gap-2">
            <input type="month" name="bulan" defaultValue={bulan} className="input" />
            <button type="submit" className="btn btn-secondary">Lihat</button>
          </form>
          <Link href={`/admin/rekap?bulan=${geser(bulan, 1)}`} className="btn btn-ghost" aria-label="Bulan berikutnya">&rarr;</Link>
          <a href={`/admin/rekap/export?bulan=${bulan}`} className="btn btn-primary"><span className="material-symbols-outlined">download</span> Excel</a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kartu.map((k) => (
          <div key={k.l} className="card"><div className="card-body">
            <p className="text-sm text-gray-500">{k.l}</p>
            <p className="font-heading font-extrabold text-2xl text-gray-900 mt-1">{k.v}</p>
            <p className="text-xs text-gray-500 mt-1">{k.s}</p>
          </div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card"><div className="card-header"><h3 className="font-heading font-bold text-lg">Pendapatan per Kategori</h3></div>
          <div className="card-body">
            {s.pendapatan > 0 ? (
              <DonutBCA
                items={r.perKategori.map((k) => ({ nama: k.nama, ikon: k.ikon, warnaBg: k.warnaBg, warnaIkon: k.warnaIkon, nilai: k.pendapatan }))}
                judulTengah="Total Pendapatan" nilaiTengah={rupiah(s.pendapatan)}
              />
            ) : <p className="text-gray-500 text-center py-10">Belum ada pendapatan bulan ini</p>}
          </div>
        </div>
        <div className="card"><div className="card-header"><h3 className="font-heading font-bold text-lg">Per Hari</h3></div>
          <div className="card-body"><RekapHarian labels={labels} pendapatan={pend} pesanan={pes} /></div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h3 className="font-heading font-bold text-lg">Per Paket</h3></div>
        <div className="table-container"><table className="table">
          <thead><tr><th>Paket</th><th>Kategori</th><th>Pesanan</th><th>Peserta</th><th>Pendapatan</th></tr></thead>
          <tbody>
            {r.perPaket.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada data</td></tr>}
            {r.perPaket.map((p) => <tr key={p.nama}><td>{p.nama}</td><td>{p.kategori}</td><td>{p.total}</td><td>{p.peserta}</td><td className="font-semibold">{rupiah(p.pendapatan)}</td></tr>)}
          </tbody>
        </table></div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="font-heading font-bold text-lg">Daftar Pemesanan ({r.daftar.length})</h3></div>
        <div className="table-container"><table className="table">
          <thead><tr><th>Tanggal</th><th>Kode</th><th>Tipe</th><th>Nama</th><th>Paket</th><th>Jml</th><th>Pendapatan</th><th>Status</th></tr></thead>
          <tbody>
            {r.daftar.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-gray-500">Tidak ada data</td></tr>}
            {r.daftar.map((p) => (
              <tr key={p.id}>
                <td>{tanggalPendek(p.createdAt)}</td>
                <td><Link href={`/admin/pemesanan/${p.id}`} className="font-mono text-primary-dark">{p.kode}</Link></td>
                <td><span className={'badge ' + (p.tipe === 'korporat' ? 'badge-purple' : 'badge-info')}>{p.tipe === 'korporat' ? 'Korporat' : 'Family'}</span></td>
                <td>{p.perusahaan ? `${p.perusahaan} (${p.nama})` : p.nama}</td>
                <td>{p.paket.nama}</td><td>{p.jumlah}</td>
                <td>{rupiah(p.hargaFinal ?? p.estimasiTotal)}</td>
                <td><span className={'badge ' + (BADGE[p.status] ?? 'badge-gray')}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
