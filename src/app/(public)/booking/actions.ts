'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { getSettings } from '@/lib/queries';
import { hariIniISO, randomKode, rupiah, tanggalPanjang } from '@/lib/format';
import { normalisasiWa, WA_REGEX } from '@/lib/validation';
import { isiTemplate, waUrl } from '@/lib/wa';

export type BookingState = { errors?: Record<string, string> } | null;

/**
 * Alur Family: validasi → simpan pemesanan (status "baru") → redirect ke WhatsApp dengan template.
 * (Korporat/PT tidak lewat sini: tombolnya langsung membuka WhatsApp.)
 */
export async function buatPemesanan(_prev: BookingState, fd: FormData): Promise<BookingState> {
  const str = (k: string) => String(fd.get(k) ?? '').trim();
  const errors: Record<string, string> = {};

  const slug = str('paket_slug');
  const nama = str('nama');
  const whatsapp = normalisasiWa(str('whatsapp'));
  const tanggal = str('tanggal_kunjungan');
  const jumlah = Number(str('jumlah'));
  const catatan = str('catatan');

  const db = await getDb();
  const [p] = await db
    .select()
    .from(schema.paket)
    .where(and(eq(schema.paket.slug, slug), eq(schema.paket.aktif, true)))
    .limit(1);
  if (!p) return { errors: { paket_slug: 'Paket tidak ditemukan.' } };

  if (!nama) errors.nama = 'Nama wajib diisi';
  else if (nama.length > 100) errors.nama = 'Nama maksimal 100 karakter';
  if (!WA_REGEX.test(whatsapp)) errors.whatsapp = 'Format: 628xxxxxxxxxx';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(tanggal))) errors.tanggal_kunjungan = 'Tanggal wajib diisi';
  else if (tanggal < hariIniISO()) errors.tanggal_kunjungan = 'Tidak boleh masa lalu';
  if (!Number.isInteger(jumlah) || jumlah < p.minPeserta) errors.jumlah = `Minimum ${p.minPeserta} ${p.satuanHarga.toLowerCase()}`;
  if (catatan.length > 500) errors.catatan = 'Catatan maksimal 500 karakter';
  if (Object.keys(errors).length) return { errors };

  const estimasi = p.hargaMulai * jumlah;
  let pemesananId: number | null = null;
  for (let i = 0; i < 6 && pemesananId === null; i++) {
    const kode = `AB-${hariIniISO().slice(0, 4)}-${randomKode(4)}`;
    try {
      const [row] = await db
        .insert(schema.pemesanan)
        .values({ kode, paketId: p.id, nama, whatsapp, tanggalKunjungan: tanggal, jumlah, catatan: catatan || null, estimasiTotal: estimasi, status: 'baru' })
        .returning({ id: schema.pemesanan.id });
      pemesananId = row.id;
    } catch (e) {
      const code = (e as { code?: string; cause?: { code?: string } }).code ?? (e as { cause?: { code?: string } }).cause?.code;
      if (code !== '23505') throw e; // selain bentrok kode unik → lempar
    }
  }
  if (pemesananId === null) return { errors: { nama: 'Gagal menyimpan pemesanan, coba lagi.' } };

  (await cookies()).set('pemesanan_id', String(pemesananId), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 6 });

  const set = await getSettings(['wa_number', 'wa_template_family']);
  const pesan = isiTemplate(set.wa_template_family ?? '', {
    paket: p.nama,
    nama,
    tanggal: tanggalPanjang(tanggal),
    jumlah,
    satuan: p.satuanHarga,
    estimasi: rupiah(estimasi),
    catatan: catatan || '-',
  });

  redirect(waUrl(set.wa_number, pesan));
}
