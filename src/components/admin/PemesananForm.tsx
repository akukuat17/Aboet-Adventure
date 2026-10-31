'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { tambahPemesanan } from '@/actions/pemesananBaru';
import type { FormState } from '@/actions/util';
import SubmitButton from './SubmitButton';

type PaketOpt = { id: number; nama: string; kategori: string };

export default function PemesananForm({ paket, hariIni }: { paket: PaketOpt[]; hariIni: string }) {
  const [state, action] = useActionState(tambahPemesanan, null as FormState);
  const v = state?.values ?? {};
  const val = (k: string, d = '') => String(v[k] ?? d);

  return (
    <form action={action} className="card">
      <div className="card-body">
        {state?.error && <div className="alert alert-error mb-4" role="alert"><span className="material-symbols-outlined icon">error</span>{state.error}</div>}

        <div className="form-row cols-2">
          <div className="form-group">
            <label className="label">Paket</label>
            <select name="paket_id" defaultValue={val('paket_id')} className="input select" required>
              <option value="">— Pilih paket —</option>
              {paket.map((p) => <option key={p.id} value={p.id}>{p.nama} ({p.kategori})</option>)}
            </select>
          </div>
          <div className="form-group sm:col-span-2">
            <label className="label">Nama Perusahaan / Instansi</label>
            <input name="perusahaan" defaultValue={val('perusahaan')} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">Nama PIC</label>
            <input name="nama" defaultValue={val('nama')} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">WhatsApp (opsional)</label>
            <input name="whatsapp" defaultValue={val('whatsapp')} placeholder="08xxxxxxxxxx" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Tanggal</label>
            <input type="date" name="tanggal" defaultValue={val('tanggal', hariIni)} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">Jumlah (orang/unit)</label>
            <input type="number" name="jumlah" min={1} defaultValue={val('jumlah', '1')} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">Harga Final (Rp)</label>
            <input type="number" name="harga_final" min={0} step={1000} defaultValue={val('harga_final')} placeholder="Kosong = harga paket × jumlah" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select name="status" defaultValue={val('status', 'selesai')} className="input select">
              <option value="baru">Baru</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>
          </div>
          <div className="form-group sm:col-span-2">
            <label className="label">Catatan</label>
            <textarea name="catatan" rows={3} defaultValue={val('catatan')} className="input" />
          </div>
        </div>

        <div className="save-bar">
          <Link href="/admin/pemesanan" className="btn btn-ghost">Batal</Link>
          <SubmitButton className="btn btn-primary btn-lg">Simpan Pemesanan</SubmitButton>
        </div>
      </div>
    </form>
  );
}
