'use server';

import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb, schema } from '@/db';
import { wajibAdmin } from '@/lib/auth';
import { randomKode, slugify } from '@/lib/format';
import { hapusFoto, simpanFoto, UploadError } from '@/lib/storage';
import { flash, intOr, str, type FormState } from './util';

const { paket, kategori } = schema;
const SATUAN = ['Orang', 'Pax', 'Unit'];

export async function simpanPaket(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await wajibAdmin();
  const v = {
    kategori_id: str(fd, 'kategori_id'),
    nama: str(fd, 'nama'),
    slug: str(fd, 'slug'),
    harga_mulai: str(fd, 'harga_mulai'),
    satuan_harga: str(fd, 'satuan_harga'),
    lokasi: str(fd, 'lokasi'),
    ikon: str(fd, 'ikon'),
    durasi: str(fd, 'durasi'),
    medan: str(fd, 'medan'),
    min_peserta: str(fd, 'min_peserta'),
    urutan: str(fd, 'urutan'),
    termasuk: String(fd.get('termasuk') ?? ''),
    deskripsi: String(fd.get('deskripsi') ?? '').trim(),
    aktif: fd.get('aktif') === 'on',
  };
  const gagal = (error: string): FormState => ({ error, values: v });

  const kategoriId = Number(v.kategori_id);
  const harga = Number(v.harga_mulai);
  const minPeserta = intOr(v.min_peserta, 1);
  const urutan = intOr(v.urutan, 0);

  if (!v.nama) return gagal('Nama paket wajib diisi.');
  if (v.nama.length > 150) return gagal('Nama paket maksimal 150 karakter.');
  if (v.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)) return gagal('Slug hanya boleh huruf kecil, angka, dan tanda hubung.');
  if (!Number.isInteger(harga) || harga < 0 || v.harga_mulai === '') return gagal('Harga mulai harus angka 0 atau lebih.');
  if (!SATUAN.includes(v.satuan_harga)) return gagal('Satuan harga tidak valid.');
  if (!Number.isInteger(minPeserta) || minPeserta < 1) return gagal('Min. peserta minimal 1.');
  if (!Number.isInteger(urutan) || urutan < 0) return gagal('Urutan harus angka 0 atau lebih.');

  const db = await getDb();
  const [kat] = await db.select({ id: kategori.id }).from(kategori).where(eq(kategori.id, kategoriId)).limit(1);
  if (!kat) return gagal('Kategori tidak valid.');

  let slug = v.slug || `${slugify(v.nama)}-${randomKode(4).toLowerCase()}`;
  const bentrok = await db
    .select({ id: paket.id })
    .from(paket)
    .where(id ? and(eq(paket.slug, slug), ne(paket.id, id)) : eq(paket.slug, slug))
    .limit(1);
  if (bentrok.length) return gagal('Slug sudah dipakai paket lain.');

  const lama = id ? (await db.select().from(paket).where(eq(paket.id, id)).limit(1))[0] : null;
  if (id && !lama) flash('/admin/paket', 'error', 'Paket tidak ditemukan');

  let foto = lama?.foto ?? null;
  const file = fd.get('foto');
  if (file instanceof File && file.size > 0) {
    try {
      const baru = await simpanFoto(file, 'paket');
      if (foto) await hapusFoto(foto);
      foto = baru;
    } catch (e) {
      if (e instanceof UploadError) return gagal(e.message);
      throw e;
    }
  }

  // Galeri slider: hapus yang dicentang, lalu tambahkan upload baru (maks. 8 foto total)
  const hapusSet = new Set(fd.getAll('hapus_galeri').map(String));
  let galeri = (lama?.galeri ?? []).filter((u) => !hapusSet.has(u));
  for (const u of hapusSet) if ((lama?.galeri ?? []).includes(u)) await hapusFoto(u);
  const baruFiles = fd.getAll('galeri_baru').filter((f): f is File => f instanceof File && f.size > 0);
  if (galeri.length + baruFiles.length > 8) return gagal('Galeri maksimal 8 foto. Hapus beberapa foto lama dulu.');
  for (const f of baruFiles) {
    try {
      galeri.push(await simpanFoto(f, 'paket'));
    } catch (e) {
      if (e instanceof UploadError) return gagal(e.message);
      throw e;
    }
  }

  const termasuk = v.termasuk.split('\n').map((l) => l.trim()).filter(Boolean);
  const data = {
    kategoriId,
    nama: v.nama,
    slug,
    hargaMulai: harga,
    satuanHarga: v.satuan_harga,
    lokasi: v.lokasi || 'Sentul, Bogor',
    deskripsi: v.deskripsi || null,
    ikon: v.ikon || null,
    durasi: v.durasi || null,
    medan: v.medan || null,
    minPeserta,
    termasuk: termasuk.length ? termasuk : null,
    urutan,
    aktif: v.aktif,
    foto,
    galeri,
  };
  if (id) await db.update(paket).set({ ...data, updatedAt: new Date() }).where(eq(paket.id, id));
  else await db.insert(paket).values(data);

  revalidatePath('/');
  revalidatePath(`/paket/${slug}`);
  flash('/admin/paket', 'success', id ? 'Paket diperbarui' : 'Paket ditambahkan');
}

export async function hapusPaket(id: number) {
  await wajibAdmin();
  const db = await getDb();
  const [p] = await db.select().from(paket).where(eq(paket.id, id)).limit(1);
  if (p) {
    await hapusFoto(p.foto);
    for (const u of p.galeri ?? []) await hapusFoto(u);
    await db.delete(paket).where(eq(paket.id, id));
  }
  revalidatePath('/');
  flash('/admin/paket', 'success', 'Paket dihapus');
}
