import type { Metadata } from 'next';
import Link from 'next/link';
import { getDashboard } from '@/lib/queries';
import { akhirBulanISO, awalBulanISO, labelBulan, rupiah, tanggalPendek } from '@/lib/format';
import DashboardCharts from '@/components/admin/DashboardCharts';

export const metadata: Metadata = { title: 'Dashboard' };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const BADGE: Record<string, string> = { baru: 'badge-warning', dikonfirmasi: 'badge-info', selesai: 'badge-success', batal: 'badge-gray' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function dua12Bulan(): string[] {
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ start_date?: string; end_date?: string }> }) {
  const sp = await searchParams;
  const start = sp.start_date && ISO.test(sp.start_date) ? sp.start_date : awalBulanISO();
  const end = sp.end_date && ISO.test(sp.end_date) ? sp.end_date : akhirBulanISO();
  const d = await getDashboard(start, end);

  const bulan = dua12Bulan();
  const peta = new Map(d.bulanan.map((b) => [b.bulan, b.total]));
  const totalWa = d.total + d.korporat;
  const cards = [
    { label: 'Konfirmasi ke WhatsApp', nilai: String(totalWa), ikon: 'chat', warna: 'bg-primary-soft text-primary-dark' },
    { label: 'Family (form + WA)', nilai: String(d.total), ikon: 'group', warna: 'bg-blue-100 text-blue-700' },
    { label: 'Korporat (klik WA)', nilai: String(d.korporat), ikon: 'business', warna: 'bg-purple-100 text-purple-700' },
    { label: 'Pendapatan', nilai: rupiah(d.pendapatan), ikon: 'attach_money', warna: 'bg-green-100 text-green-700' },
  ];

  return (
    <>
      <div className="mb-6 animate-fade-in">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Statistik orang yang sampai klik konfirmasi ke WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={c.label} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{c.label}</p>
                <p className="font-heading font-extrabold text-3xl text-gray-900 mt-1">{c.nilai}</p>
              </div>
              <div className={'stat-icon ' + c.warna}><span className="material-symbols-outlined">{c.ikon}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6 animate-fade-in">
        <div className="card-body">
          <form method="GET" className="form-row cols-4 items-end gap-4">
            <div className="form-group"><label className="label">Dari Tanggal</label><input type="date" name="start_date" defaultValue={start} className="input" /></div>
            <div className="form-group"><label className="label">Sampai Tanggal</label><input type="date" name="end_date" defaultValue={end} className="input" /></div>
            <div className="form-group"><button type="submit" className="btn btn-primary w-full">Filter</button></div>
            <div className="form-group"><Link href="/admin" className="btn btn-ghost w-full text-center">Reset</Link></div>
          </form>
        </div>
      </div>

      <DashboardCharts
        bulananLabel={bulan.map(labelBulan)}
        bulananData={bulan.map((b) => peta.get(b) ?? 0)}
        kategoriLabel={d.perKategori.map((k) => k.nama)}
        kategoriData={d.perKategori.map((k) => k.total)}
        paketLabel={d.terlaris.map((p) => p.nama)}
        paketData={d.terlaris.map((p) => p.total)}
        waFamily={bulan.map((b) => d.waBulanan.family.find((x) => x.bulan === b)?.total ?? 0)}
        waKorporat={bulan.map((b) => d.waBulanan.korporat.find((x) => x.bulan === b)?.total ?? 0)}
      />

      <div className="card animate-slide-up mb-6">
        <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Pemesanan Terbaru</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Kode</th><th>Paket</th><th>Nama</th><th>Status</th><th>Tanggal</th></tr></thead>
              <tbody>
                {d.terbaru.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500"><span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>Belum ada pemesanan</td></tr>
                )}
                {d.terbaru.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="font-mono text-primary-dark"><Link href={`/admin/pemesanan/${p.id}`}>{p.kode}</Link></td>
                    <td>{p.paket.nama}</td>
                    <td>{p.nama}</td>
                    <td><span className={'badge ' + (BADGE[p.status] ?? 'badge-gray')}>{cap(p.status)}</span></td>
                    <td className="text-gray-600">{tanggalPendek(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer"><Link href="/admin/pemesanan" className="btn btn-ghost text-center w-full">Lihat Semua</Link></div>
        </div>
      </div>
    </>
  );
}
