import type { Metadata } from 'next';
import { s } from '@/lib/css';
import { getSettings, getWaNumber } from '@/lib/queries';

export const metadata: Metadata = { title: 'Profil' };
export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const [p, wa] = await Promise.all([
    getSettings(['profil_tentang', 'profil_alamat', 'profil_jam', 'profil_telepon', 'profil_instagram', 'profil_facebook', 'profil_foto']),
    getWaNumber(),
  ]);
  const foto = p.profil_foto || 'https://picsum.photos/seed/aboet-profil/800/600';
  const telepon = p.profil_telepon || '0857-9900-1985';

  return (
    <>
      <div className="hero-banner" style={{ backgroundImage: `url(${foto})` }}>
        <div className="hero-text">
          <h2>Aboet Adventure</h2>
          <p>Berpengalaman sejak 2015 di Sentul, Bogor</p>
        </div>
      </div>

      <div className="detail-sheet" style={s('margin-top:-22px; border-radius:22px 22px 0 0; background:var(--surface); padding:24px 18px;')}>
        <h2 style={s('margin-bottom:16px;')}>Tentang Kami</h2>
        <div style={s('color:var(--text-muted); line-height:1.7; white-space:pre-line;')}>{p.profil_tentang}</div>

        <div style={s('margin-top:24px; padding-top:16px; border-top:1px solid var(--border);')}>
          <h3 style={s('font-size:16px; margin-bottom:12px;')}>Informasi Kontak</h3>
          <div style={s('display:flex; flex-direction:column; gap:12px;')}>
            <div style={s('display:flex; align-items:center; gap:12px;')}>
              <span className="material-symbols-outlined" style={s('color:var(--primary);')}>location_on</span>
              <div>{p.profil_alamat}</div>
            </div>
            <div style={s('display:flex; align-items:center; gap:12px;')}>
              <span className="material-symbols-outlined" style={s('color:var(--primary);')}>schedule</span>
              <div style={s('white-space:pre-line;')}>{p.profil_jam}</div>
            </div>
            <a href={`tel:${telepon.replace(/[^0-9+]/g, '')}`} style={s('display:flex; align-items:center; gap:12px; color:var(--primary-dark); font-weight:700; text-decoration:none;')}>
              <span className="material-symbols-outlined" style={s('color:var(--primary);')}>phone</span>
              <span>{telepon}</span>
            </a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" style={s('display:flex; align-items:center; gap:12px; color:var(--primary-dark); font-weight:700; text-decoration:none;')}>
              <span className="material-symbols-outlined" style={s('color:#25D366;')}>chat</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div style={s('margin-top:24px; padding-top:16px; border-top:1px solid var(--border);')}>
          <h3 style={s('font-size:16px; margin-bottom:12px;')}>Media Sosial</h3>
          <div style={s('display:flex; gap:16px;')}>
            {p.profil_instagram && (
              <a href={p.profil_instagram} target="_blank" rel="noopener noreferrer" style={s('display:flex; align-items:center; gap:6px; color:var(--text-muted); text-decoration:none; font-weight:600;')}>
                <span className="material-symbols-outlined">camera_alt</span> Instagram
              </a>
            )}
            {p.profil_facebook && (
              <a href={p.profil_facebook} target="_blank" rel="noopener noreferrer" style={s('display:flex; align-items:center; gap:6px; color:var(--text-muted); text-decoration:none; font-weight:600;')}>
                <span className="material-symbols-outlined">facebook</span> Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
