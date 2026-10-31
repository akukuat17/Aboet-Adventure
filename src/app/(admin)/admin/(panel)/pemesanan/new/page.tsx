import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb, schema } from '@/db';
import { asc, eq } from 'drizzle-orm';
import { hariIniISO } from '@/lib/format';
import PemesananForm from '@/components/admin/PemesananForm';

export const metadata: Metadata = { title: 'Tambah Pemesanan' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const db = await getDb();
  const rows = await db
    .select({ id: schema.paket.id, nama: schema.paket.nama, kategori: schema.kategori.nama })
    .from(schema.paket)
    .innerJoin(schema.kategori, eq(schema.paket.kategoriId, schema.kategori.id))
    .orderBy(asc(schema.kategori.nama), asc(schema.paket.nama));
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">Tambah Korporat (Deal)</h1>
        <p className="text-gray-600 mt-1">Catat pelanggan korporat yang sudah deal supaya masuk statistik, pendapatan, dan rekap. Pemesanan family masuk otomatis dari form situs.</p>
        <Link href="/admin/pemesanan" className="text-primary font-medium hover:underline inline-block mt-2">&larr; Kembali</Link>
      </div>
      <PemesananForm paket={rows} hariIni={hariIniISO()} />
    </div>
  );
}
