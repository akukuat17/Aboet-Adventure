import 'server-only';
import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const MAX_BYTES = 2 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * Resize maks. 1200px → WebP, lalu simpan.
 * - Vercel : Vercel Blob (BLOB_READ_WRITE_TOKEN)
 * - Lokal  : public/uploads
 * Mengembalikan URL publik yang disimpan di database.
 */
export async function simpanFoto(file: File, folder: 'paket' | 'profil'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new UploadError('File harus berupa gambar.');
  if (file.size > MAX_BYTES) throw new UploadError('Ukuran foto maksimal 2 MB.');

  const buf = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const nama = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(nama, buf, { access: 'public', contentType: 'image/webp' });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new UploadError('Upload foto belum aktif: hubungkan Vercel Blob ke project (BLOB_READ_WRITE_TOKEN).');
  }
  const tujuan = path.join(process.cwd(), 'public', 'uploads', nama);
  await mkdir(path.dirname(tujuan), { recursive: true });
  await writeFile(tujuan, buf);
  return `/uploads/${nama}`;
}

export async function hapusFoto(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith('http')) {
      if (process.env.BLOB_READ_WRITE_TOKEN) await del(url);
    } else if (url.startsWith('/uploads/')) {
      await unlink(path.join(process.cwd(), 'public', url));
    }
  } catch {
    /* file sudah tidak ada: abaikan */
  }
}
