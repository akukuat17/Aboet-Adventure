'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { simpanKategori } from '@/actions/kategori';
import type { FormState } from '@/actions/util';
import type { Kategori } from '@/db/schema';
import SubmitButton from './SubmitButton';

const INPUT = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const LABEL = 'block text-sm font-medium text-gray-500 mb-1';

export default function KategoriForm({ kategori }: { kategori: Kategori | null }) {
  const [state, action] = useActionState((p: FormState, fd: FormData) => simpanKategori(kategori?.id ?? null, p, fd), null);
  const v = state?.values;
  const val = (k: string, d: string | number) => String(v?.[k] ?? d);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">{kategori ? 'Edit' : 'Tambah'} Kategori</h1>
        <Link href="/admin/kategori" className="text-primary font-medium hover:underline inline-block mt-2">&larr; Kembali</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form action={action}>
          {state?.error && <div className="alert alert-error mb-4" role="alert"><span className="material-symbols-outlined icon">error</span>{state.error}</div>}

          <div className="mb-4">
            <label className={LABEL}>Nama Kategori</label>
            <input type="text" name="nama" defaultValue={val('nama', kategori?.nama ?? '')} required className={INPUT} />
          </div>
          <div className="mb-4">
            <label className={LABEL}>Slug (URL)</label>
            <input type="text" name="slug" defaultValue={val('slug', kategori?.slug ?? '')} required className={INPUT} />
          </div>
          <div className="mb-4">
            <label className={LABEL}>Ikon (Material Symbols)</label>
            <input type="text" name="ikon" defaultValue={val('ikon', kategori?.ikon ?? '')} required placeholder="contoh: water, hiking, directions_run" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={LABEL}>Warna Background</label>
              <input type="color" name="warna_bg" defaultValue={val('warna_bg', kategori?.warnaBg ?? '#dcf0e2')} required className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className={LABEL}>Warna Ikon</label>
              <input type="color" name="warna_ikon" defaultValue={val('warna_ikon', kategori?.warnaIkon ?? '#2f9e58')} required className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={LABEL}>Urutan</label>
              <input type="number" name="urutan" defaultValue={val('urutan', kategori?.urutan ?? 0)} min={0} className={INPUT} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="aktif" defaultChecked={v ? Boolean(v.aktif) : (kategori?.aktif ?? true)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          <SubmitButton className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">
            {kategori ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
