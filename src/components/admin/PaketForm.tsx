'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { simpanPaket } from '@/actions/paket';
import type { FormState } from '@/actions/util';
import type { Kategori, Paket } from '@/db/schema';
import SubmitButton from './SubmitButton';

const INPUT = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const LABEL = 'block text-sm font-medium text-gray-500 mb-1';

export default function PaketForm({ paket, kategori }: { paket: Paket | null; kategori: Kategori[] }) {
  const [state, action] = useActionState((p: FormState, fd: FormData) => simpanPaket(paket?.id ?? null, p, fd), null);
  const v = state?.values;
  const val = (k: string, d: string | number | null | undefined) => String(v?.[k] ?? d ?? '');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">{paket ? 'Edit' : 'Tambah'} Paket Wahana</h1>
        <Link href="/admin/paket" className="text-primary font-medium hover:underline inline-block mt-2">&larr; Kembali</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form action={action}>
          {state?.error && <div className="alert alert-error mb-4" role="alert"><span className="material-symbols-outlined icon">error</span>{state.error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={LABEL}>Kategori</label>
              <select name="kategori_id" required defaultValue={val('kategori_id', paket?.kategoriId)} className={INPUT}>
                {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Nama Paket</label>
              <input type="text" name="nama" defaultValue={val('nama', paket?.nama)} required maxLength={150} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Slug (URL)</label>
              <input type="text" name="slug" defaultValue={val('slug', paket?.slug)} maxLength={180} className={INPUT} placeholder="Otomatis jika kosong" />
            </div>
            <div>
              <label className={LABEL}>Harga Mulai (Rp)</label>
              <input type="number" name="harga_mulai" defaultValue={val('harga_mulai', paket?.hargaMulai)} required min={0} step={1000} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Satuan Harga</label>
              <select name="satuan_harga" required defaultValue={val('satuan_harga', paket?.satuanHarga ?? 'Orang')} className={INPUT}>
                <option value="Orang">Orang</option>
                <option value="Pax">Pax</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Lokasi</label>
              <input type="text" name="lokasi" defaultValue={val('lokasi', paket?.lokasi)} maxLength={150} className={INPUT} placeholder="Sentul, Bogor" />
            </div>
            <div>
              <label className={LABEL}>Ikon (Material Symbols)</label>
              <input type="text" name="ikon" defaultValue={val('ikon', paket?.ikon)} maxLength={50} className={INPUT} placeholder="kosong = pakai ikon kategori" />
            </div>
            <div>
              <label className={LABEL}>Durasi</label>
              <input type="text" name="durasi" defaultValue={val('durasi', paket?.durasi)} maxLength={50} className={INPUT} placeholder="contoh: 2–3 Jam" />
            </div>
            <div>
              <label className={LABEL}>Medan</label>
              <input type="text" name="medan" defaultValue={val('medan', paket?.medan)} maxLength={50} className={INPUT} placeholder="Mudah / Sedang / Sulit" />
            </div>
            <div>
              <label className={LABEL}>Min. Peserta</label>
              <input type="number" name="min_peserta" defaultValue={val('min_peserta', paket?.minPeserta ?? 1)} min={1} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Urutan</label>
              <input type="number" name="urutan" defaultValue={val('urutan', paket?.urutan ?? 0)} min={0} className={INPUT} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aktif" defaultChecked={v ? Boolean(v.aktif) : (paket?.aktif ?? true)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className={LABEL}>Foto Paket</label>
            {paket?.foto && (
              <div className="mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={paket.foto} alt="Foto saat ini" className="max-h-40 rounded-lg border" />
                <p className="text-xs text-gray-500 mt-1">Foto saat ini. Upload baru untuk mengganti.</p>
              </div>
            )}
            <input type="file" name="foto" accept="image/*" className={INPUT} />
            <p className="text-xs text-gray-500 mt-1">Max 2MB. Format: JPG, PNG, WebP. Otomatis diperkecil (maks. 1200px) dan diubah ke WebP.</p>
          </div>

          <div className="mb-6">
            <label className={LABEL}>Yang Termasuk (satu per baris)</label>
            <textarea name="termasuk" rows={5} defaultValue={val('termasuk', paket?.termasuk?.join('\n'))} className={INPUT + ' font-mono text-sm'} placeholder={'Guide bersertifikat\nPerlengkapan safety\nAsuransi peserta\nAir mineral & snack'} />
          </div>

          <div className="mb-6">
            <label className={LABEL}>Deskripsi</label>
            <textarea name="deskripsi" rows={6} defaultValue={val('deskripsi', paket?.deskripsi)} className={INPUT} />
          </div>

          <SubmitButton className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">
            {paket ? 'Simpan Perubahan' : 'Tambah Paket'}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
