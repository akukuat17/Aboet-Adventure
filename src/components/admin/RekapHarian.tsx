/** Grafik harian (SVG murni, tanpa JS klien): batang = pendapatan, garis = jumlah pesanan. */
const ringkas = (v: number) => (v >= 1_000_000 ? `${+(v / 1_000_000).toFixed(1)} jt` : v >= 1000 ? `${+(v / 1000).toFixed(0)} rb` : String(v));

export default function RekapHarian({ labels, pendapatan, pesanan }: { labels: string[]; pendapatan: number[]; pesanan: number[] }) {
  const W = 700, H = 260, L = 50, Rr = 34, T = 14, B = 30;
  const iw = W - L - Rr, ih = H - T - B;
  const n = labels.length;
  const maxP = Math.max(1, ...pendapatan);
  const maxQ = Math.max(1, ...pesanan);
  const yP = (v: number) => T + ih - (v / maxP) * ih;
  const yQ = (v: number) => T + ih - (v / maxQ) * ih;
  const slot = iw / n;
  const x = (i: number) => L + slot * i + slot / 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const garis = pesanan.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${yQ(v).toFixed(1)}`).join(' ');
  const adaData = pendapatan.some((v) => v > 0) || pesanan.some((v) => v > 0);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label="Grafik pendapatan dan pesanan per hari">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - Rr} y1={T + ih - t * ih} y2={T + ih - t * ih} stroke="#e5e7eb" />
            <text x={L - 6} y={T + ih - t * ih + 4} textAnchor="end" fontSize="14" fill="#6b7d70">{ringkas(Math.round(maxP * t))}</text>
            <text x={W - Rr + 6} y={T + ih - t * ih + 4} fontSize="14" fill="#d4351c">{Math.round(maxQ * t * 10) / 10 % 1 === 0 ? Math.round(maxQ * t) : ''}</text>
          </g>
        ))}
        {pendapatan.map((v, i) => v > 0 && (
          <rect key={i} x={x(i) - Math.min(slot * 0.32, 10)} y={yP(v)} width={Math.min(slot * 0.64, 20)} height={T + ih - yP(v)} rx="3" fill="#1f7a46">
            <title>{`Tgl ${labels[i]}: Rp${v.toLocaleString('id-ID')}`}</title>
          </rect>
        ))}
        {adaData && <path d={garis} fill="none" stroke="#d4351c" strokeWidth="2" strokeLinejoin="round" />}
        {pesanan.map((v, i) => v > 0 && (
          <circle key={i} cx={x(i)} cy={yQ(v)} r="3" fill="#d4351c"><title>{`Tgl ${labels[i]}: ${v} pesanan`}</title></circle>
        ))}
        {labels.map((l, i) => (i % 3 === 0 || i === n - 1) && <text key={l} x={x(i)} y={H - 10} textAnchor="middle" fontSize="14" fill="#6b7d70">{l}</text>)}
      </svg>
      <div className="flex justify-center gap-5 text-xs text-gray-600 mt-2">
        <span className="flex items-center gap-1.5"><i style={{ width: 10, height: 10, background: '#1f7a46', borderRadius: 2, display: 'inline-block' }} /> Pendapatan (Rp)</span>
        <span className="flex items-center gap-1.5"><i style={{ width: 10, height: 3, background: '#d4351c', display: 'inline-block' }} /> Pesanan</span>
      </div>
    </div>
  );
}
