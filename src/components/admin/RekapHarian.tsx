'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';

export default function RekapHarian({ labels, pendapatan, pesanan }: { labels: string[]; pendapatan: number[]; pesanan: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let chart: ChartType | null = null;
    let batal = false;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      if (batal || !ref.current) return;
      Chart.register(...registerables);
      chart = new Chart(ref.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Pendapatan (Rp)', data: pendapatan, backgroundColor: '#1f7a46', borderRadius: 4, yAxisID: 'y', order: 2 },
            { type: 'line', label: 'Pesanan', data: pesanan, borderColor: '#d4351c', backgroundColor: '#d4351c', tension: 0.3, pointRadius: 2, yAxisID: 'y1', order: 1 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (v) => (Number(v) >= 1000000 ? Number(v) / 1000000 + ' jt' : Number(v) >= 1000 ? Number(v) / 1000 + ' rb' : String(v)) } },
            y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { precision: 0 } },
            x: { grid: { display: false } },
          },
        },
      });
    })();
    return () => { batal = true; chart?.destroy(); };
  }, [labels, pendapatan, pesanan]);
  return <div style={{ height: 260 }}><canvas ref={ref} /></div>;
}
