'use server';

import { revalidatePath } from 'next/cache';
import { wajibAdmin } from '@/lib/auth';
import { getSettings, setSetting } from '@/lib/queries';
import { hapusFoto, simpanFoto, UploadError } from '@/lib/storage';
import { flash, str } from './util';

const URL_OK = /^https?:\/\/\S+$/i;

export async function simpanPengaturan(fd: FormData) {
  await wajibAdmin();
  const wa = str(fd, 'wa_number');
  const tplFamily = String(fd.get('wa_template_family') ?? '').replace(/\r\n/g, '\n').trim();
  const tplKorporat = String(fd.get('wa_template_korporat') ?? '').replace(/\r\n/g, '\n').trim();
  const instagram = str(fd, 'profil_instagram');
  const facebook = str(fd, 'profil_facebook');
  const p = '/admin/pengaturan';

  if (!wa || wa.length > 20) flash(p, 'error', 'Nomor WhatsApp wajib diisi (maks. 20 karakter).');
  if (!/^[0-9]+$/.test(wa)) flash(p, 'error', 'Nomor WhatsApp hanya boleh angka, format 628xxxxxxxxxx.');
  if (!tplFamily) flash(p, 'error', 'Template Family wajib diisi.');
  if (!tplKorporat) flash(p, 'error', 'Template Korporat wajib diisi.');
  if (instagram && !URL_OK.test(instagram)) flash(p, 'error', 'URL Instagram tidak valid.');
  if (facebook && !URL_OK.test(facebook)) flash(p, 'error', 'URL Facebook tidak valid.');

  let fotoBaru: string | null = null;
  const file = fd.get('profil_foto');
  if (file instanceof File && file.size > 0) {
    try {
      fotoBaru = await simpanFoto(file, 'profil');
    } catch (e) {
      if (e instanceof UploadError) flash(p, 'error', e.message);
      throw e;
    }
  }

  const nilai: Record<string, string | null> = {
    wa_number: wa,
    wa_template_family: tplFamily,
    wa_template_korporat: tplKorporat,
    profil_tentang: str(fd, 'profil_tentang') || null,
    profil_alamat: str(fd, 'profil_alamat') || null,
    profil_jam: str(fd, 'profil_jam') || null,
    profil_telepon: str(fd, 'profil_telepon') || null,
    profil_instagram: instagram || null,
    profil_facebook: facebook || null,
  };
  for (const [k, v] of Object.entries(nilai)) await setSetting(k, v);
  if (fotoBaru) {
    const { profil_foto } = await getSettings(['profil_foto']);
    await setSetting('profil_foto', fotoBaru);
    await hapusFoto(profil_foto);
  }

  revalidatePath('/profil');
  flash(p, 'success', 'Pengaturan disimpan');
}
