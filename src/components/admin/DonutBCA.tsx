export type DonutItem = { nama: string; ikon: string; warnaBg: string; warnaIkon: string; nilai: number };

const idr = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const persen = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

/**
 * Donut tipis bergaya aplikasi bank (SVG murni, tanpa JavaScript klien supaya selalu tampil):
 * cincin bersegmen, lencana ikon di tiap segmen, total di tengah, lalu daftar kategori.
 */
export default function DonutBCA({ items, judulTengah, nilaiTengah, satuan = 'rupiah' }: { items: DonutItem[]; judulTengah: string; nilaiTengah: string; satuan?: 'rupiah' | 'jumlah' }) {
  const aktif = items.filter((i) => i.nilai > 0);
  const total = aktif.reduce((a, b) => a + b.nilai, 0);
  const fmt = (n: number) => (satuan === 'rupiah' ? idr(n) : `${n} pesanan`);

  // geometri cincin (viewBox 100×100)
  const R = 43, TEBAL = 8, C = 2 * Math.PI * R, CELAH = aktif.length > 1 ? 1.2 : 0;
  let akum = 0;
  const segmen = aktif.map((it) => {
    const awal = akum / total;
    akum += it.nilai;
    const frac = it.nilai / total;
    const tengah = awal + frac / 2;
    const sudut = tengah * 2 * Math.PI;
    const panjang = Math.max(frac * C - CELAH, 0.01);
    return { it, panjang, offset: -(awal * C + CELAH / 2), left: 50 + Math.sin(sudut) * R, top: 50 - Math.cos(sudut) * R };
  });


  return (
    <div>
      <div className="relative mx-auto" style={{ maxWidth: 320 }}>
        <svg viewBox="0 0 100 100" className="block w-full h-auto" role="img" aria-label={`Diagram lingkaran ${judulTengah}`}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="#e5e7eb" strokeWidth={TEBAL} />
          <g transform="rotate(-90 50 50)">
            {segmen.map(({ it, panjang, offset }) => (
              <circle key={it.nama} cx="50" cy="50" r={R} fill="none" stroke={it.warnaIkon} strokeWidth={TEBAL} strokeDasharray={`${panjang} ${C - panjang}`} strokeDashoffset={offset}>
                <title>{`${it.nama}: ${fmt(it.nilai)} (${persen(it.nilai, total)}%)`}</title>
              </circle>
            ))}
          </g>
        </svg>
        {segmen.map(({ it, left, top }) => (
          <span key={it.nama} title={it.nama} className="absolute flex items-center justify-center rounded-full bg-white shadow-md" style={{ width: 34, height: 34, left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 2px 8px rgba(0,0,0,.22)' }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: it.warnaBg }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: it.warnaIkon, lineHeight: 1 }}>{it.ikon}</span>
            </span>
          </span>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none" style={{ padding: '24%' }}>
          <span className="text-gray-500" style={{ fontSize: 13 }}>{judulTengah}</span>
          <span className="font-heading font-extrabold text-gray-900" style={{ fontSize: 'clamp(15px, 4.6vw, 22px)', lineHeight: 1.2, marginTop: 4, wordBreak: 'break-word' }}>{nilaiTengah}</span>
        </div>
      </div>

      <div className="mt-5" role="list">
        {(items.length ? items : []).map((it) => (
          <div key={it.nama} role="listitem" className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-b-0">
            <span className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 40, height: 40, background: it.warnaBg }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: it.warnaIkon }}>{it.ikon}</span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-primary-dark" style={{ fontSize: 15 }}>{it.nama}</div>
              <div className="flex items-baseline gap-3 text-gray-700">
                <span style={{ fontSize: 13 }}>{fmt(it.nilai)}</span>
                <span className="font-bold" style={{ fontSize: 13, color: it.warnaIkon }}>{persen(it.nilai, total)}%</span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-500 py-6">Belum ada data untuk periode ini</p>}
      </div>
    </div>
  );
}
