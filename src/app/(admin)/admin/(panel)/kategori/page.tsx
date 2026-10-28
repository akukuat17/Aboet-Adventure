import type { Metadata } from 'next';
import Link from 'next/link';
import { listKategori } from '@/lib/queries';
import { hapusKategori } from '@/actions/kategori';
import ConfirmForm from '@/components/admin/ConfirmForm';
import Pagination from '@/components/admin/Pagination';

export const metadata: Metadata = { title: 'Kategori Wahana' };

export default async function KategoriIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const data = await listKategori(page);
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Kategori Wahana</h1>
          <p className="text-gray-600 mt-1">Kelola kategori untuk mengelompokkan wahana</p>
        </div>
        <Link href="/admin/kategori/new" className="btn btn-primary self-start">Tambah Kategori</Link>
      </div>

      <div className="card animate-fade-in">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Ikon</th><th>Nama</th><th>Slug</th><th>Warna</th><th>Urutan</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.rows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500"><span className="material-symbols-outlined text-3xl mb-2 block">category</span>Belum ada kategori</td></tr>
              )}
              {data.rows.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: k.warnaBg }}>
                      <span className="material-symbols-outlined" style={{ color: k.warnaIkon, fontSize: 20 }}>{k.ikon}</span>
                    </div>
                  </td>
                  <td className="font-medium">{k.nama}</td>
                  <td className="text-gray-600 font-mono text-sm">{k.slug}</td>
                  <td><div className="flex items-center gap-2"><div className="w-6 h-6 rounded border" style={{ background: k.warnaBg }} /><span className="text-xs font-mono">{k.warnaBg}</span></div></td>
                  <td>{k.urutan}</td>
                  <td><span className={'badge ' + (k.aktif ? 'badge-success' : 'badge-gray')}>{k.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td>
                    <Link href={`/admin/kategori/${k.id}`} className="btn btn-ghost btn-sm mr-2">Edit</Link>
                    <ConfirmForm action={hapusKategori.bind(null, k.id)} pesan="Hapus kategori ini?">
                      <button type="submit" className="btn btn-ghost btn-sm text-red-600 hover:text-red-700">Hapus</button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer"><Pagination {...data} basePath="/admin/kategori" /></div>
      </div>
    </>
  );
}
