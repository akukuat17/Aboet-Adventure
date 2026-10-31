'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import ExcelJS from 'exceljs';
import { getDb, schema } from '@/db';
import { STATUS_PEMESANAN, type StatusPemesanan, type TipePemesanan } from '@/db/schema';
import { wajibAdmin } from '@/lib/auth';
import { normalisasiWa, WA_REGEX } from '@/lib/validation';
import { simpanPemesananBaru } from '@/lib/pemesananBaru';
import { flash, str, type FormState } from './util';

const TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

export async function tambahPemesanan(_p: FormState, fd: FormData): Promise<FormState> {
  await wajibAdmin();
  const values: Record<string, string> = {};
  fd.forEach((v, k) => { values[k] = String(v); });

  const tipe = 'korporat' as const; // form manual khusus korporat; family masuk otomatis dari situs
  const paketId = Number(str(fd, 'paket_id'));
  const nama = str(fd, 'nama');
  const perusahaan = str(fd, 'perusahaan');
  const wa = normalisasiWa(str(fd, 'whatsapp'));
  const tanggal = str(fd, 'tanggal');
  const jumlah = Number(str(fd, 'jumlah'));
  const hargaRaw = str(fd, 'harga_final');
  const hargaFinal = hargaRaw === '' ? null : Number(hargaRaw);
  const status = str(fd, 'status') as StatusPemesanan;

  let error = '';
  if (!Number.isInteger(paketId) || paketId <= 0) error = 'Pilih paket';
  else if (!nama) error = 'Nama wajib diisi';
  else if (!perusahaan) error = 'Nama perusahaan wajib diisi';
  else if (wa && !WA_REGEX.test(wa)) error = 'Format WhatsApp: 628xxxxxxxxxx (boleh dikosongkan)';
  else if (!TANGGAL.test(tanggal) || Number.isNaN(Date.parse(tanggal))) error = 'Tanggal wajib diisi';
  else if (!Number.isInteger(jumlah) || jumlah < 1) error = 'Jumlah minimal 1';
  else if (hargaFinal !== null && (!Number.isInteger(hargaFinal) || hargaFinal < 0)) error = 'Harga final harus angka 0 atau lebih';
  else if (!STATUS_PEMESANAN.includes(status)) error = 'Status tidak valid';
  if (error) return { error, values };

  const id = await simpanPemesananBaru({
    tipe, paketId, nama, perusahaan: perusahaan || null, whatsapp: wa, tanggal, jumlah, hargaFinal,
    status, catatan: str(fd, 'catatan') || null, sumber: 'manual',
  });
  revalidatePath('/admin/pemesanan');
  flash(`/admin/pemesanan/${id}`, 'success', 'Pemesanan ditambahkan');
}

export async function ubahTipe(id: number, fd: FormData) {
  await wajibAdmin();
  const tipe = str(fd, 'tipe') === 'korporat' ? 'korporat' : 'family';
  const perusahaan = str(fd, 'perusahaan');
  if (tipe === 'korporat' && !perusahaan) flash(`/admin/pemesanan/${id}`, 'error', 'Nama perusahaan wajib untuk korporat');
  const db = await getDb();
  await db.update(schema.pemesanan).set({ tipe, perusahaan: tipe === 'korporat' ? perusahaan : null, updatedAt: new Date() }).where(eq(schema.pemesanan.id, id));
  revalidatePath('/admin/pemesanan');
  flash(`/admin/pemesanan/${id}`, 'success', 'Tipe pemesanan diperbarui');
}

export async function hapusPemesanan(id: number) {
  await wajibAdmin();
  const db = await getDb();
  await db.delete(schema.pemesanan).where(eq(schema.pemesanan.id, id));
  revalidatePath('/admin/pemesanan');
  flash('/admin/pemesanan', 'success', 'Pemesanan dihapus');
}

/* ---------------- Import Excel ---------------- */

export type HasilImport = { ok: number; gagal: { baris: number; alasan: string }[]; error?: string } | null;

function teks(c: ExcelJS.CellValue): string {
  if (c == null) return '';
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  if (typeof c === 'object') {
    if ('result' in c && c.result != null) return teks(c.result as ExcelJS.CellValue);
    if ('text' in c) return String(c.text).trim();
    if ('richText' in c) return c.richText.map((r) => r.text).join('').trim();
  }
  return String(c).trim();
}

function tanggalDari(c: ExcelJS.CellValue): string {
  if (c instanceof Date) {
    // exceljs mengembalikan tengah malam UTC → ambil tanggal UTC supaya tidak bergeser
    return c.toISOString().slice(0, 10);
  }
  const s = teks(c);
  if (TANGGAL.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); // dd/mm/yyyy
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}

const angka = (c: ExcelJS.CellValue) => Number(teks(c).replace(/[^0-9.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, ''));

export async function importPemesanan(_p: HasilImport, fd: FormData): Promise<HasilImport> {
  await wajibAdmin();
  const file = fd.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: 0, gagal: [], error: 'Pilih file .xlsx atau .csv dulu' };
  if (file.size > 5 * 1024 * 1024) return { ok: 0, gagal: [], error: 'Ukuran file maksimal 5 MB' };

  const wb = new ExcelJS.Workbook();
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    if (file.name.toLowerCase().endsWith('.csv')) {
      const { Readable } = await import('node:stream');
      await wb.csv.read(Readable.from(buf));
    } else {
      await wb.xlsx.load(buf as unknown as ArrayBuffer);
    }
  } catch {
    return { ok: 0, gagal: [], error: 'File tidak bisa dibaca. Pakai format .xlsx atau .csv sesuai template.' };
  }
  const ws = wb.worksheets[0];
  if (!ws) return { ok: 0, gagal: [], error: 'File kosong' };

  // peta header → nomor kolom (fleksibel urutan/huruf)
  const kol: Record<string, number> = {};
  ws.getRow(1).eachCell((cell, n) => { kol[teks(cell.value).toLowerCase().replace(/[^a-z]/g, '')] = n; });
  const ambil = (row: ExcelJS.Row, ...names: string[]) => {
    for (const n of names) if (kol[n]) return row.getCell(kol[n]).value;
    return null;
  };
  if (!kol.tanggal || !(kol.paket) || !kol.jumlah) return { ok: 0, gagal: [], error: 'Header harus berisi minimal: Tanggal, Paket, Jumlah. Unduh template untuk contoh.' };

  const db = await getDb();
  const semuaPaket = await db.select().from(schema.paket);
  const cari = new Map<string, number>();
  for (const p of semuaPaket) { cari.set(p.nama.toLowerCase(), p.id); cari.set(p.slug.toLowerCase(), p.id); }

  let ok = 0;
  const gagal: { baris: number; alasan: string }[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    if (!row.hasValues) continue;
    const tanggal = tanggalDari(ambil(row, 'tanggal'));
    const namaPaket = teks(ambil(row, 'paket')).toLowerCase();
    const jumlah = angka(ambil(row, 'jumlah'));
    const perusahaan = teks(ambil(row, 'perusahaan'));
    const nama = teks(ambil(row, 'nama', 'namapic', 'pic')) || perusahaan;
    const tipeRaw = teks(ambil(row, 'tipe')).toLowerCase();
    const tipe: TipePemesanan = tipeRaw.startsWith('kor') || (!tipeRaw && perusahaan) ? 'korporat' : 'family';
    const wa = normalisasiWa(teks(ambil(row, 'whatsapp', 'wa', 'nohp')));
    const hargaTeks = teks(ambil(row, 'hargafinal', 'harga', 'pendapatan'));
    const hargaFinal = hargaTeks === '' ? null : angka(ambil(row, 'hargafinal', 'harga', 'pendapatan'));
    const statusTeks = teks(ambil(row, 'status')).toLowerCase();
    const status = (statusTeks || 'selesai') as StatusPemesanan;

    const alasan =
      !tanggal ? 'Tanggal tidak valid (pakai YYYY-MM-DD)'
      : !cari.has(namaPaket) ? `Paket "${teks(ambil(row, 'paket'))}" tidak ditemukan`
      : !Number.isInteger(jumlah) || jumlah < 1 ? 'Jumlah harus angka ≥ 1'
      : tipe === 'korporat' && !perusahaan ? 'Perusahaan wajib diisi untuk korporat'
      : !nama ? 'Nama kosong'
      : wa && wa !== '62' && !WA_REGEX.test(wa) ? 'Format WhatsApp salah'
      : hargaFinal !== null && (!Number.isFinite(hargaFinal) || hargaFinal < 0) ? 'Harga tidak valid'
      : !STATUS_PEMESANAN.includes(status) ? `Status "${statusTeks}" tidak valid`
      : '';
    if (alasan) { gagal.push({ baris: r, alasan }); continue; }
    try {
      await simpanPemesananBaru({
        tipe, paketId: cari.get(namaPaket)!, nama, perusahaan: perusahaan || null, whatsapp: wa === '62' ? '' : wa,
        tanggal, jumlah, hargaFinal, status, catatan: teks(ambil(row, 'catatan')) || null, sumber: 'import',
      });
      ok++;
    } catch (e) {
      gagal.push({ baris: r, alasan: e instanceof Error ? e.message : 'Gagal menyimpan' });
    }
  }
  revalidatePath('/admin/pemesanan');
  revalidatePath('/admin');
  return { ok, gagal: gagal.slice(0, 50) };
}
