import type { Metadata } from 'next';
import Link from 'next/link';
import { listPemesanan } from '@/lib/queries';
import { rupiah, tanggalJam } from '@/lib/format';
import Pagination from '@/components/admin/Pagination';

export const metadata: Metadata = { title: 'Pemesanan' };

const BADGE: Record<string, string> = { baru: 'badge-warning', dikonfirmasi: 'badge-info', selesai: 'badge-success', batal: 'badge-gray' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
type SP = { status?: string; search?: string; date_from?: string; date_to?: string; page?: string };

export default async function PemesananIndex({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const data = await listPemesanan({ status: sp.status, search: sp.search, dateFrom: sp.date_from, dateTo: sp.date_to, page: sp.page });

  return (
    <>
      <div className="mb-6 animate-fade-in">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Pemesanan</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau semua pemesanan masuk</p>
      </div>

      <div className="card mb-6 animate-fade-in">
        <div className="card-body">
          <form method="GET" className="form-row cols-4 items-end gap-4">
            <div className="form-group">
              <label className="label">Status</label>
              <select name="status" defaultValue={sp.status ?? ''} className="input select">
                <option value="">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="dikonfirmasi">Dikonfirmasi</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Cari</label><input type="text" name="search" defaultValue={sp.search ?? ''} placeholder="Kode, nama, WA..." className="input" /></div>
            <div className="form-group"><label className="label">Dari</label><input type="date" name="date_from" defaultValue={sp.date_from ?? ''} className="input" /></div>
            <div className="form-group"><label className="label">Sampai</label><input type="date" name="date_to" defaultValue={sp.date_to ?? ''} className="input" /></div>
            <div className="form-group"><button type="submit" className="btn btn-primary w-full">Filter</button></div>
            <div className="form-group"><Link href="/admin/pemesanan" className="btn btn-ghost w-full text-center">Reset</Link></div>
          </form>
        </div>
      </div>

      <div className="card animate-fade-in">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Kode</th><th>Paket</th><th>Nama</th><th>Jumlah</th><th>Estimasi</th><th>Harga Final</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {data.rows.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-gray-500"><span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>Tidak ada data pemesanan</td></tr>
              )}
              {data.rows.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="font-mono text-primary-dark">{p.kode}</td>
                  <td>{p.paket.nama}</td>
                  <td>{p.nama}</td>
                  <td>{p.jumlah} {p.paket.satuanHarga.toLowerCase()}</td>
                  <td className="text-gray-700">{rupiah(p.estimasiTotal)}</td>
                  <td>{p.hargaFinal ? <span className="font-semibold text-green-700">{rupiah(p.hargaFinal)}</span> : <span className="text-gray-400">-</span>}</td>
                  <td><span className={'badge ' + (BADGE[p.status] ?? 'badge-gray')}>{cap(p.status)}</span></td>
                  <td className="text-gray-600">{tanggalJam(p.createdAt)}</td>
                  <td><Link href={`/admin/pemesanan/${p.id}`} className="btn btn-ghost btn-sm">Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <Pagination {...data} basePath="/admin/pemesanan" params={{ status: sp.status, search: sp.search, date_from: sp.date_from, date_to: sp.date_to }} />
        </div>
      </div>
    </>
  );
}
