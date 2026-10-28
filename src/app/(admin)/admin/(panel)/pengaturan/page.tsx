import type { Metadata } from 'next';
import { getSettings } from '@/lib/queries';
import { simpanPengaturan } from '@/actions/pengaturan';
import SubmitButton from '@/components/admin/SubmitButton';

export const metadata: Metadata = { title: 'Pengaturan' };

const KEYS = ['wa_number', 'wa_template_family', 'wa_template_korporat', 'profil_tentang', 'profil_alamat', 'profil_jam', 'profil_telepon', 'profil_instagram', 'profil_facebook', 'profil_foto'] as const;

export default async function Pengaturan() {
  const s = await getSettings(KEYS);
  const v = (k: (typeof KEYS)[number]) => s[k] ?? '';
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Konfigurasi nomor WhatsApp, template pesan, dan profil Aboet</p>
      </div>

      <form action={simpanPengaturan} className="space-y-6">
        <div className="card animate-fade-in">
          <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">WhatsApp Integration</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="wa_number" className="label">Nomor WhatsApp <span className="text-primary">*</span></label>
              <input type="text" id="wa_number" name="wa_number" defaultValue={v('wa_number')} required className="input" placeholder="628xxxxxxxxxx" />
            </div>
            <div className="form-group">
              <label htmlFor="wa_template_family" className="label">Template Family <span className="text-primary">*</span></label>
              <textarea id="wa_template_family" name="wa_template_family" rows={4} required defaultValue={v('wa_template_family')} className="input textarea font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Placeholder: {'{paket}, {nama}, {tanggal}, {jumlah}, {satuan}, {estimasi}, {catatan}'}</p>
            </div>
            <div className="form-group">
              <label htmlFor="wa_template_korporat" className="label">Template Korporat <span className="text-primary">*</span></label>
              <textarea id="wa_template_korporat" name="wa_template_korporat" rows={5} required defaultValue={v('wa_template_korporat')} className="input textarea font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Placeholder: {'{paket}'} (korporat langsung ke WhatsApp tanpa form)</p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Profil Aboet Adventure</h3></div>
          <div className="card-body">
            <div className="form-group"><label htmlFor="profil_tentang" className="label">Tentang Kami</label><textarea id="profil_tentang" name="profil_tentang" rows={4} defaultValue={v('profil_tentang')} className="input textarea" /></div>
            <div className="form-group"><label htmlFor="profil_alamat" className="label">Alamat</label><input type="text" id="profil_alamat" name="profil_alamat" defaultValue={v('profil_alamat')} className="input" /></div>
            <div className="form-group"><label htmlFor="profil_jam" className="label">Jam Operasional</label><textarea id="profil_jam" name="profil_jam" rows={3} defaultValue={v('profil_jam')} className="input textarea" /></div>
            <div className="form-row cols-2">
              <div className="form-group"><label htmlFor="profil_telepon" className="label">Telepon</label><input type="text" id="profil_telepon" name="profil_telepon" defaultValue={v('profil_telepon')} className="input" /></div>
              <div className="form-group"><label htmlFor="profil_instagram" className="label">Instagram URL</label><input type="url" id="profil_instagram" name="profil_instagram" defaultValue={v('profil_instagram')} className="input" placeholder="https://instagram.com/..." /></div>
              <div className="form-group"><label htmlFor="profil_facebook" className="label">Facebook URL</label><input type="url" id="profil_facebook" name="profil_facebook" defaultValue={v('profil_facebook')} className="input" placeholder="https://facebook.com/..." /></div>
              <div className="form-group">
                <label htmlFor="profil_foto" className="label">Foto Profil</label>
                {s.profil_foto && (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.profil_foto} alt="Foto profil" className="max-h-32 rounded-lg border" />
                  </div>
                )}
                <input type="file" id="profil_foto" name="profil_foto" accept="image/*" className="input" />
              </div>
            </div>
          </div>
        </div>

        <SubmitButton className="btn btn-primary btn-lg w-full animate-slide-up">Simpan Pengaturan</SubmitButton>
      </form>
    </div>
  );
}
