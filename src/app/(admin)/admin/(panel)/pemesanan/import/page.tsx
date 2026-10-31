import type { Metadata } from 'next';
import Link from 'next/link';
import ImportForm from '@/components/admin/ImportForm';

export const metadata: Metadata = { title: 'Import Excel' };

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">Import Pemesanan dari Excel</h1>
        <p className="text-gray-600 mt-1">Masukkan banyak data sekaligus, family maupun korporat (kolom Tipe). Pemesanan dari form situs sudah otomatis, tidak perlu diimport.</p>
        <Link href="/admin/pemesanan" className="text-primary font-medium hover:underline inline-block mt-2">&larr; Kembali</Link>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <h3 className="font-heading font-bold text-lg mb-2">1. Unduh template</h3>
          <p className="text-gray-600 text-sm mb-3">Isi sesuai kolom. Sheet “Petunjuk” berisi aturan dan daftar nama paket yang valid.</p>
          <a href="/api/admin/template" className="btn btn-secondary"><span className="material-symbols-outlined">download</span> Template Excel</a>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="font-heading font-bold text-lg mb-3">2. Upload file</h3>
          <ImportForm />
        </div>
      </div>
    </div>
  );
}
