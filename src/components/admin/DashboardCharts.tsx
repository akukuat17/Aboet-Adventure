'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import DonutBCA, { type DonutItem } from './DonutBCA';

type Props = {
  bulananLabel: string[];
  bulananData: number[];
  kategori: DonutItem[];
  totalPendapatan: string;
  paketLabel: string[];
  paketData: number[];
  waFamily: number[];
  waKorporat: number[];
};

const idr = (v: number | string) => 'Rp' + Number(v).toLocaleString('id-ID');

export default function DashboardCharts(p: Props) {
  const r1 = useRef<HTMLCanvasElement>(null);
  const r3 = useRef<HTMLCanvasElement>(null);
  const r4 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let charts: ChartType[] = [];
    let batal = false;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      if (batal || !r1.current || !r3.current || !r4.current) return;
      Chart.register(...registerables);
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
      Chart.defaults.animation = { duration: 750, easing: 'easeOutQuart' };
      Chart.defaults.plugins.legend.display = false;

      charts.push(new Chart(r4.current, {
        type: 'bar',
        data: {
          labels: p.bulananLabel,
          datasets: [
            { label: 'Family', data: p.waFamily, backgroundColor: '#1f7a46', borderRadius: 4 },
            { label: 'Korporat', data: p.waKorporat, backgroundColor: '#e0793e', borderRadius: 4 },
          ],
        },
        options: {
          plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16 } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y} konfirmasi` } } },
          scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0f0f0' } } },
          interaction: { intersect: false, mode: 'index' },
        },
      }));

      charts.push(new Chart(r1.current, {
        type: 'bar',
        data: { labels: p.bulananLabel, datasets: [{ label: 'Pendapatan (Rp)', data: p.bulananData, backgroundColor: '#1f7a46', borderRadius: 6, borderSkipped: false }] },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => idr(c.parsed.y ?? 0) } } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (v) => idr(v), padding: 8 }, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false }, ticks: { padding: 8 } },
          },
          interaction: { intersect: false, mode: 'index' },
        },
      }));

      charts.push(new Chart(r3.current, {
        type: 'bar',
        data: { labels: p.paketLabel, datasets: [{ label: 'Jumlah Tiket', data: p.paketData, backgroundColor: '#1f7a46', borderRadius: 6, borderSkipped: false }] },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.x} tiket` } } },
          scales: {
            x: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { padding: 8 } },
            y: {
              grid: { display: false },
              ticks: {
                padding: 16,
                callback(value) {
                  const label = String(this.getLabelForValue(Number(value)));
                  return label.length > 25 ? label.substring(0, 25) + '...' : label;
                },
              },
            },
          },
          layout: { padding: { left: 24, right: 16, top: 16, bottom: 16 } },
        },
      }));
    })();
    return () => { batal = true; charts.forEach((c) => c.destroy()); charts = []; };
  }, [p.bulananLabel, p.bulananData, p.paketLabel, p.paketData, p.waFamily, p.waKorporat]);

  return (
    <>
      <div className="card animate-slide-up mb-6">
        <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Konfirmasi ke WhatsApp per Bulan (12 Bulan)</h3></div>
        <div className="card-body" style={{ padding: '1rem' }}><div style={{ position: 'relative', height: 300, width: '100%' }}><canvas ref={r4} /></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Pendapatan Bulanan (12 Bulan)</h3></div>
          <div className="card-body" style={{ padding: '1rem' }}><div style={{ position: 'relative', height: 300, width: '100%' }}><canvas ref={r1} /></div></div>
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Pendapatan per Kategori</h3></div>
          <div className="card-body"><DonutBCA items={p.kategori} judulTengah="Total Pendapatan" nilaiTengah={p.totalPendapatan} /></div>
        </div>
      </div>
      <div className="card animate-slide-up mb-6" style={{ animationDelay: '160ms' }}>
        <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Paket Terlaris (Top 5)</h3></div>
        <div className="card-body" style={{ padding: '1rem' }}><div style={{ position: 'relative', height: 350, width: '100%' }}><canvas ref={r3} /></div></div>
      </div>
    </>
  );
}
