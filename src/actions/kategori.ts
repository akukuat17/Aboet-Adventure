'use server';

import { and, eq, ne, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb, schema } from '@/db';
import { wajibAdmin } from '@/lib/auth';
import { flash, intOr, str, type FormState } from './util';

const { kategori, paket } = schema;

export async function simpanKategori(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await wajibAdmin();
  const v = {
    nama: str(fd, 'nama'),
    slug: str(fd, 'slug'),
    ikon: str(fd, 'ikon'),
    warna_bg: str(fd, 'warna_bg'),
    warna_ikon: str(fd, 'warna_ikon'),
    urutan: str(fd, 'urutan'),
    aktif: fd.get('aktif') === 'on',
  };
  const gagal = (error: string): FormState => ({ error, values: v });

  if (!v.nama) return gagal('Nama kategori wajib diisi.');
  if (v.nama.length > 100) return gagal('Nama kategori maksimal 100 karakter.');
  if (!v.slug) return gagal('Slug wajib diisi.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)) return gagal('Slug hanya boleh huruf kecil, angka, dan tanda hubung.');
  if (!v.ikon) return gagal('Ikon wajib diisi.');
  if (!v.warna_bg || !v.warna_ikon) return gagal('Warna wajib diisi.');
  const urutan = intOr(v.urutan, 0);
  if (!Number.isInteger(urutan) || urutan < 0) return gagal('Urutan harus angka 0 atau lebih.');

  const db = await getDb();
  const bentrok = await db
    .select({ id: kategori.id })
    .from(kategori)
    .where(id ? and(eq(kategori.slug, v.slug), ne(kategori.id, id)) : eq(kategori.slug, v.slug))
    .limit(1);
  if (bentrok.length) return gagal('Slug sudah dipakai kategori lain.');

  const data = { nama: v.nama, slug: v.slug, ikon: v.ikon, warnaBg: v.warna_bg, warnaIkon: v.warna_ikon, urutan, aktif: v.aktif };
  if (id) await db.update(kategori).set({ ...data, updatedAt: new Date() }).where(eq(kategori.id, id));
  else await db.insert(kategori).values(data);

  revalidatePath('/');
  flash('/admin/kategori', 'success', id ? 'Kategori diperbarui' : 'Kategori ditambahkan');
}

export async function hapusKategori(id: number) {
  await wajibAdmin();
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(paket).where(eq(paket.kategoriId, id));
  if (n > 0) flash('/admin/kategori', 'error', 'Kategori memiliki paket, tidak bisa dihapus');
  await db.delete(kategori).where(eq(kategori.id, id));
  revalidatePath('/');
  flash('/admin/kategori', 'success', 'Kategori dihapus');
}
