'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';

export type DonutItem = { nama: string; ikon: string; warnaBg: string; warnaIkon: string; nilai: number };

const idr = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const persen = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

/**
 * Donut tipis bergaya aplikasi bank: cincin bersegmen, lencana ikon di tiap segmen,
 * total di tengah, lalu daftar kategori (ikon · nama · nominal · persen).
 */
export default function DonutBCA({ items, judulTengah, nilaiTengah, satuan = 'rupiah' }: { items: DonutItem[]; judulTengah: string; nilaiTengah: string; satuan?: 'rupiah' | 'jumlah' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const aktif = items.filter((i) => i.nilai > 0);
  const total = aktif.reduce((a, b) => a + b.nilai, 0);
  const fmt = (n: number) => (satuan === 'rupiah' ? idr(n) : `${n} pesanan`);

  useEffect(() => {
    let chart: ChartType | null = null;
    let batal = false;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      if (batal || !ref.current) return;
      Chart.register(...registerables);
      chart = new Chart(ref.current, {
        type: 'doughnut',
        data: {
          labels: total > 0 ? aktif.map((i) => i.nama) : ['Belum ada data'],
          datasets: [{ data: total > 0 ? aktif.map((i) => i.nilai) : [1], backgroundColor: total > 0 ? aktif.map((i) => i.warnaIkon) : ['#e5e7eb'], borderColor: '#fff', borderWidth: 4, hoverOffset: 4, borderRadius: 0 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '80%',
          animation: { duration: 700 },
          layout: { padding: 6 },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: total > 0, callbacks: { label: (c) => ` ${c.label}: ${fmt(Number(c.parsed))} (${persen(Number(c.parsed), total)}%)` } },
          },
        },
      });
    })();
    return () => { batal = true; chart?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(aktif), satuan]);

  // posisi lencana ikon di tengah ketebalan cincin (mulai dari atas, searah jarum jam)
  let akum = 0;
  const lencana = aktif.map((it) => {
    const tengah = (akum + it.nilai / 2) / total;
    akum += it.nilai;
    const sudut = tengah * 2 * Math.PI;
    const r = 0.45 * 0.9; // radius cincin (≈ 90% jari-jari) dalam satuan lebar kotak
    return { it, left: 50 + Math.sin(sudut) * r * 100, top: 50 - Math.cos(sudut) * r * 100 };
  });

  return (
    <div>
      <div className="relative mx-auto" style={{ maxWidth: 320 }}>
        <canvas ref={ref} aria-label={`Diagram lingkaran ${judulTengah}`} role="img" />
        {total > 0 && lencana.map(({ it, left, top }) => (
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
