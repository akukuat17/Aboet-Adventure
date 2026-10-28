import type { Metadata } from 'next';
import Link from 'next/link';
import { listKategoriAktif, listPaket } from '@/lib/queries';
import { hapusPaket } from '@/actions/paket';
import { rupiah } from '@/lib/format';
import ConfirmForm from '@/components/admin/ConfirmForm';
import Pagination from '@/components/admin/Pagination';

export const metadata: Metadata = { title: 'Paket Wahana' };
type SP = { kategori_id?: string; aktif?: string; search?: string; page?: string };

export default async function PaketIndex({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [data, kategori] = await Promise.all([
    listPaket({ kategoriId: sp.kategori_id, aktif: sp.aktif, search: sp.search, page: sp.page }),
    listKategoriAktif(),
  ]);
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Paket Wahana</h1>
          <p className="text-gray-600 mt-1">Kelola daftar wahana dan paket wisata</p>
        </div>
        <Link href="/admin/paket/new" className="btn btn-primary self-start">Tambah Paket</Link>
      </div>

      <div className="card mb-6 animate-fade-in">
        <div className="card-body">
          <form method="GET" className="form-row cols-4 items-end gap-4">
            <div className="form-group">
              <label className="label">Kategori</label>
              <select name="kategori_id" defaultValue={sp.kategori_id ?? ''} className="input select">
                <option value="">Semua Kategori</option>
                {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select name="aktif" defaultValue={sp.aktif ?? ''} className="input select">
                <option value="">Semua</option><option value="1">Aktif</option><option value="0">Nonaktif</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Cari</label><input type="text" name="search" defaultValue={sp.search ?? ''} placeholder="Nama paket..." className="input" /></div>
            <div className="form-group"><button type="submit" className="btn btn-primary w-full">Filter</button></div>
            <div className="form-group"><Link href="/admin/paket" className="btn btn-ghost w-full text-center">Reset</Link></div>
          </form>
        </div>
      </div>

      <div className="card animate-fade-in">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Foto</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Satuan</th><th>Min</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500"><span className="material-symbols-outlined text-3xl mb-2 block">local_activity</span>Belum ada paket</td></tr>
              )}
              {data.rows.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td>
                    {p.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.foto} alt="" className="w-16 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-sm">image</span></div>
                    )}
                  </td>
                  <td className="font-medium">{p.nama}</td>
                  <td><span className="badge" style={{ background: p.kategori.warnaBg, color: p.kategori.warnaIkon }}>{p.kategori.nama}</span></td>
                  <td>{rupiah(p.hargaMulai)}</td>
                  <td>{p.satuanHarga}</td>
                  <td>{p.minPeserta}</td>
                  <td><span className={'badge ' + (p.aktif ? 'badge-success' : 'badge-gray')}>{p.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td>
                    <Link href={`/admin/paket/${p.id}`} className="btn btn-ghost btn-sm mr-2">Edit</Link>
                    <ConfirmForm action={hapusPaket.bind(null, p.id)} pesan="Hapus paket ini?">
                      <button type="submit" className="btn btn-ghost btn-sm text-red-600 hover:text-red-700">Hapus</button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer"><Pagination {...data} basePath="/admin/paket" params={{ kategori_id: sp.kategori_id, aktif: sp.aktif, search: sp.search }} /></div>
      </div>
    </>
  );
}
