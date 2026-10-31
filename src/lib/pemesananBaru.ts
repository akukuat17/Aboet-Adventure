import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import type { SumberPemesanan, StatusPemesanan, TipePemesanan } from '@/db/schema';
import { randomKode } from '@/lib/format';

export type DataBaru = {
  tipe: TipePemesanan;
  paketId: number;
  nama: string;
  perusahaan: string | null;
  whatsapp: string;
  tanggal: string; // YYYY-MM-DD
  jumlah: number;
  hargaFinal: number | null;
  status: StatusPemesanan;
  catatan: string | null;
  sumber: SumberPemesanan;
};

/** Simpan satu pemesanan (kode unik, estimasi dihitung dari harga paket). */
export async function simpanPemesananBaru(d: DataBaru): Promise<number> {
  const db = await getDb();
  const [p] = await db.select().from(schema.paket).where(eq(schema.paket.id, d.paketId)).limit(1);
  if (!p) throw new Error('Paket tidak ditemukan');
  const waktu = new Date(`${d.tanggal}T12:00:00+07:00`);
  for (let i = 0; i < 8; i++) {
    const kode = `AB-${d.tanggal.slice(0, 4)}-${randomKode(5)}`;
    try {
      const [row] = await db
        .insert(schema.pemesanan)
        .values({
          kode,
          paketId: d.paketId,
          nama: d.nama,
          whatsapp: d.whatsapp || '-',
          tanggalKunjungan: d.tanggal,
          jumlah: d.jumlah,
          catatan: d.catatan,
          estimasiTotal: p.hargaMulai * d.jumlah,
          hargaFinal: d.hargaFinal,
          tipe: d.tipe,
          perusahaan: d.perusahaan,
          sumber: d.sumber,
          status: d.status,
          tanggalKonfirmasi: d.status === 'dikonfirmasi' || d.status === 'selesai' ? waktu : null,
          createdAt: waktu,
          updatedAt: waktu,
        })
        .returning({ id: schema.pemesanan.id });
      return row.id;
    } catch (e) {
      const code = (e as { code?: string; cause?: { code?: string } }).code ?? (e as { cause?: { code?: string } }).cause?.code;
      if (code !== '23505') throw e;
    }
  }
  throw new Error('Gagal membuat kode unik');
}
