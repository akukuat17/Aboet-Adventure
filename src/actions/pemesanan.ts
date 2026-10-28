'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb, schema, } from '@/db';
import { STATUS_PEMESANAN, type StatusPemesanan } from '@/db/schema';
import { wajibAdmin } from '@/lib/auth';
import { flash, str } from './util';

const { pemesanan } = schema;

export async function ubahStatus(id: number, fd: FormData) {
  await wajibAdmin();
  const status = str(fd, 'status') as StatusPemesanan;
  if (!STATUS_PEMESANAN.includes(status)) flash(`/admin/pemesanan/${id}`, 'error', 'Status tidak valid');

  const db = await getDb();
  const [p] = await db.select().from(pemesanan).where(eq(pemesanan.id, id)).limit(1);
  if (!p) flash('/admin/pemesanan', 'error', 'Pemesanan tidak ditemukan');

  const set: Partial<typeof pemesanan.$inferInsert> = { status, updatedAt: new Date() };
  if ((status === 'dikonfirmasi' || status === 'selesai') && !p!.tanggalKonfirmasi) set.tanggalKonfirmasi = new Date();
  await db.update(pemesanan).set(set).where(eq(pemesanan.id, id));

  revalidatePath(`/admin/pemesanan/${id}`);
  flash(`/admin/pemesanan/${id}`, 'success', 'Status diperbarui');
}

export async function ubahHargaFinal(id: number, fd: FormData) {
  await wajibAdmin();
  const raw = str(fd, 'harga_final');
  const harga = raw === '' ? null : Number(raw);
  if (harga !== null && (!Number.isInteger(harga) || harga < 0)) flash(`/admin/pemesanan/${id}`, 'error', 'Harga final harus angka 0 atau lebih');

  const db = await getDb();
  await db.update(pemesanan).set({ hargaFinal: harga, updatedAt: new Date() }).where(eq(pemesanan.id, id));
  flash(`/admin/pemesanan/${id}`, 'success', 'Harga final diperbarui');
}
