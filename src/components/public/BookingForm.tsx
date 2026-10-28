'use client';

import { useActionState, useEffect, useState } from 'react';
import { buatPemesanan } from '@/app/(public)/booking/actions';
import { s } from '@/lib/css';
import { rupiah } from '@/lib/format';
import { normalisasiWa, WA_REGEX } from '@/lib/validation';

type Props = {
  paket: { slug: string; satuanHarga: string; minPeserta: number; hargaMulai: number; nama: string };
  waKorporatUrl: string;
};

type Tipe = 'family' | 'korporat';
const FIELD = 'width:100%; padding:12px 14px; border:1px solid var(--border); border-radius:var(--radius-md); font-family:inherit; font-size:16px;';
const LABEL = 'display:block; font-size:13px; font-weight:700; color:var(--text-muted); margin-bottom:6px;';
const ERR = 'color:var(--destructive, #dc2626); font-size:12px; margin-top:4px; display:block;';
const RADIO = 'display:flex; align-items:center; gap:8px; cursor:pointer; flex:1; min-width:140px; padding:12px; background:var(--surface-soft); border:2px solid var(--border); border-radius:var(--radius-md); transition:all .2s;';
const STEP_BTN = 'width:44px; height:44px; border-radius:50%; border:2px solid var(--primary); background:var(--surface); color:var(--primary-dark); font-size:20px; font-weight:800; display:flex; align-items:center; justify-content:center;';

export default function BookingForm({ paket, waKorporatUrl }: Props) {
  const [state, formAction, pending] = useActionState(buatPemesanan, null);
  const [tipe, setTipe] = useState<Tipe>('family');
  const [form, setForm] = useState({ nama: '', whatsapp: '', tanggal_kunjungan: '', jumlah: paket.minPeserta, catatan: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [today, setToday] = useState('');
  const satuan = paket.satuanHarga.toLowerCase();

  useEffect(() => setToday(new Date().toLocaleDateString('en-CA')), []);
  useEffect(() => { if (state?.errors) setErrors(state.errors); }, [state]);

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const clearError = (k: string) => setErrors((e) => ({ ...e, [k]: '' }));

  function cek(field: string, f = form): string {
    switch (field) {
      case 'nama': return f.nama.trim() ? '' : 'Nama wajib diisi';
      case 'whatsapp': return WA_REGEX.test(normalisasiWa(f.whatsapp)) ? '' : 'Format: 628xxxxxxxxxx';
      case 'tanggal_kunjungan':
        if (!f.tanggal_kunjungan) return 'Tanggal wajib diisi';
        return today && f.tanggal_kunjungan < today ? 'Tidak boleh masa lalu' : '';
      case 'jumlah': return Number(f.jumlah) < paket.minPeserta ? `Minimum ${paket.minPeserta} ${satuan}` : '';
      default: return '';
    }
  }
  const validate = (field: string) => setErrors((e) => ({ ...e, [field]: cek(field) }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const hasil: Record<string, string> = {};
    for (const f of ['nama', 'whatsapp', 'tanggal_kunjungan', 'jumlah']) hasil[f] = cek(f);
    setErrors(hasil);
    if (Object.values(hasil).some(Boolean)) {
      e.preventDefault();
      const pertama = Object.keys(hasil).find((k) => hasil[k]);
      (e.currentTarget.elements.namedItem(pertama!) as HTMLElement | null)?.focus();
    }
  }

  const estimasi = Number(form.jumlah || 0) * paket.hargaMulai;
  const inv = (f: string) => (errors[f] ? 'true' : 'false');

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="paket_slug" value={paket.slug} />

      {/* Tipe Pemesan */}
      <div className="section-card">
        <h3 style={s('font-size:16px; margin-bottom:16px;')}>Tipe Pemesan</h3>
        <div style={s('display:flex; gap:16px; flex-wrap:wrap;')}>
          <label style={s(RADIO)} className={tipe === 'family' ? 'border-primary bg-primary-soft' : ''} onClick={() => setTipe('family')}>
            <input type="radio" name="tipe" value="family" checked={tipe === 'family'} onChange={() => setTipe('family')} style={s('accent-color:var(--primary);')} aria-label="Family / Perorangan" />
            <span style={s('font-weight:700;')}>Family / Perorangan</span>
          </label>
          <label style={s(RADIO)} className={tipe === 'korporat' ? 'border-primary bg-primary-soft' : ''} onClick={() => setTipe('korporat')}>
            <input type="radio" name="tipe" value="korporat" checked={tipe === 'korporat'} onChange={() => setTipe('korporat')} style={s('accent-color:var(--primary);')} aria-label="Korporat" />
            <span style={s('font-weight:700;')}>Korporat</span>
          </label>
        </div>
      </div>

      {/* ===== FAMILY: form lengkap ===== */}
      <div style={tipe === 'family' ? undefined : { display: 'none' }}>
        <div className="section-card">
          <div style={s('margin-bottom:16px;')}>
            <label htmlFor="nama" style={s(LABEL)}>Nama Lengkap</label>
            <input type="text" id="nama" name="nama" required value={form.nama} onChange={(e) => { set('nama', e.target.value); clearError('nama'); }} onBlur={() => validate('nama')} autoComplete="name" style={s(FIELD)} className={errors.nama ? 'input-error' : ''} aria-describedby="nama-error" aria-invalid={inv('nama')} />
            {errors.nama && <span id="nama-error" style={s(ERR)} role="alert">{errors.nama}</span>}
          </div>

          <div style={s('margin-bottom:16px;')}>
            <label htmlFor="whatsapp" style={s(LABEL)}>WhatsApp</label>
            <input type="tel" id="whatsapp" name="whatsapp" required value={form.whatsapp} onChange={(e) => { set('whatsapp', e.target.value); clearError('whatsapp'); }} onBlur={() => validate('whatsapp')} placeholder="628xxxxxxxxxx" inputMode="numeric" autoComplete="tel" style={s(FIELD)} className={errors.whatsapp ? 'input-error' : ''} aria-describedby="whatsapp-error" aria-invalid={inv('whatsapp')} />
            {errors.whatsapp && <span id="whatsapp-error" style={s(ERR)} role="alert">{errors.whatsapp}</span>}
          </div>

          <div style={s('margin-bottom:16px;')}>
            <label htmlFor="tanggal_kunjungan" style={s(LABEL)}>Tanggal Kunjungan</label>
            <input type="date" id="tanggal_kunjungan" name="tanggal_kunjungan" required value={form.tanggal_kunjungan} onChange={(e) => { set('tanggal_kunjungan', e.target.value); clearError('tanggal_kunjungan'); }} onBlur={() => validate('tanggal_kunjungan')} min={today || undefined} style={s(FIELD)} className={errors.tanggal_kunjungan ? 'input-error' : ''} aria-describedby="tanggal-error" aria-invalid={inv('tanggal_kunjungan')} />
            {errors.tanggal_kunjungan && <span id="tanggal-error" style={s(ERR)} role="alert">{errors.tanggal_kunjungan}</span>}
          </div>

          <div style={s('margin-bottom:16px;')}>
            <label style={s(LABEL)}>Jumlah ({satuan})</label>
            <div className="stepper" style={s('display:flex; align-items:center; gap:14px;')}>
              <button type="button" onClick={() => form.jumlah > paket.minPeserta && set('jumlah', form.jumlah - 1)} disabled={form.jumlah <= paket.minPeserta} aria-disabled={form.jumlah <= paket.minPeserta} aria-label="Kurangi jumlah" style={{ ...s(STEP_BTN), opacity: form.jumlah <= paket.minPeserta ? 0.35 : 1 }}>−</button>
              <input type="number" id="jumlah" name="jumlah" value={form.jumlah} min={paket.minPeserta} required onChange={(e) => { set('jumlah', e.target.value === '' ? 0 : Number(e.target.value)); clearError('jumlah'); }} onBlur={() => validate('jumlah')} style={s('font-size:17px; font-weight:800; min-width:50px; text-align:center; border:none; background:transparent; -moz-appearance:textfield;')} aria-describedby="jumlah-error" aria-invalid={inv('jumlah')} />
              <button type="button" onClick={() => set('jumlah', form.jumlah + 1)} aria-label="Tambah jumlah" style={s(STEP_BTN)}>+</button>
            </div>
            <p style={s('font-size:12px; color:var(--text-muted); margin-top:4px;')}>Minimum: {paket.minPeserta} {satuan}</p>
            {errors.jumlah && <span id="jumlah-error" style={s(ERR)} role="alert">{errors.jumlah}</span>}
          </div>

          <div style={s('margin-bottom:16px;')}>
            <label htmlFor="catatan" style={s(LABEL)}>Catatan Tambahan</label>
            <textarea id="catatan" name="catatan" value={form.catatan} onChange={(e) => set('catatan', e.target.value)} rows={3} style={s('width:100%; padding:12px 14px; border:1px solid var(--border); border-radius:var(--radius-md); font-family:inherit; font-size:14px; resize:vertical;')} />
            {errors.catatan && <span style={s(ERR)} role="alert">{errors.catatan}</span>}
          </div>
          {errors.paket_slug && <span style={s(ERR)} role="alert">{errors.paket_slug}</span>}
        </div>

        {/* Total Estimasi */}
        <div className="total-box" style={s('display:flex; align-items:center; justify-content:space-between; background:var(--primary-soft); border-radius:var(--radius-md); padding:16px; margin:14px 18px 0;')}>
          <div>
            <div className="lbl" style={s('font-size:13px; font-weight:700; color:var(--text-muted);')}>Total Estimasi</div>
            <div className="val" style={s('font-size:22px; font-weight:800; color:var(--primary-dark);')}>{rupiah(estimasi)}</div>
            <p style={s('font-size:11px; color:var(--text-muted); margin-top:2px;')}>Harga final dikonfirmasi via WhatsApp</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky-bar bk-bar">
          <div className="bk-bar-total"><span className="lbl">Total Estimasi</span><span className="val">{rupiah(estimasi)}</span></div>
          <button type="submit" className={'btn-primary-full' + (pending ? ' btn-loading' : '')} disabled={pending} style={s('flex:1; background:var(--primary); color:#fff; border:none; cursor:pointer; font-size:16px; font-weight:800; padding:16px; border-radius:999px; min-height:54px; box-shadow:0 8px 18px rgba(31,122,70,.28);')}>
            {!pending && <span>Kirim ke WhatsApp</span>}
            {pending && <span style={s('display:flex; align-items:center; justify-content:center; gap:8px;')}><span>Mengirim...</span></span>}
          </button>
        </div>
      </div>

      {/* ===== KORPORAT / PT: langsung ke WhatsApp (tanpa form) ===== */}
      <div style={tipe === 'korporat' ? undefined : { display: 'none' }}>
        <div className="section-card" style={s('background:var(--primary-soft); border-radius:var(--radius-lg); margin:14px 18px; padding:16px; box-shadow:var(--shadow); border:1px solid var(--primary);')}>
          <h3 style={s('font-size:16px; margin-bottom:8px; color:var(--primary-dark);')}>Pemesanan Korporat / PT</h3>
          <p style={s('font-size:14px; color:var(--text-muted); line-height:1.5;')}>Untuk korporat / PT, penawaran khusus diberikan langsung oleh tim kami lewat WhatsApp. Tanpa isi form, cukup tekan tombol di bawah untuk mulai chat.</p>
          <p style={s('font-size:13px; font-weight:700; color:var(--primary-dark); margin-top:12px;')}>{paket.nama}</p>
        </div>

        <div className="sticky-bar bk-bar">
          <a href={waKorporatUrl} target="_blank" rel="noopener noreferrer" className="btn-primary-full" style={s('flex:1; display:flex; align-items:center; justify-content:center; text-decoration:none; background:var(--primary); color:#fff; font-size:16px; font-weight:800; padding:16px; border-radius:999px; min-height:54px; box-shadow:0 8px 18px rgba(31,122,70,.28);')}>Hubungi via WhatsApp</a>
        </div>
      </div>
    </form>
  );
}
