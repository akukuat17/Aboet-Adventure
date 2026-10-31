'use client';

import { useEffect, useRef, useState } from 'react';

/** Slider foto geser ke samping (scroll-snap, bisa swipe di HP) + tombol panah + titik. */
export default function FotoSlider({ fotos, alt }: { fotos: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setIdx(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const ke = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const n = Math.max(0, Math.min(fotos.length - 1, i));
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };
  const banyak = fotos.length > 1;

  return (
    <div className="foto-slider">
      <div className="fs-track" ref={ref} tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`Foto ${alt}`}>
        {fotos.map((src, i) => (
          <div className="fs-slide" key={src + i} role="group" aria-label={`Foto ${i + 1} dari ${fotos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={i === 0 ? alt : `${alt} (foto ${i + 1})`} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
          </div>
        ))}
      </div>
      {banyak && (
        <>
          <button type="button" className="fs-nav prev" onClick={() => ke(idx - 1)} disabled={idx === 0} aria-label="Foto sebelumnya">
            <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
          <button type="button" className="fs-nav next" onClick={() => ke(idx + 1)} disabled={idx === fotos.length - 1} aria-label="Foto berikutnya">
            <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          </button>
          <div className="fs-count" aria-hidden="true">{idx + 1}/{fotos.length}</div>
          <div className="fs-dots">
            {fotos.map((_, i) => (
              <button type="button" key={i} className={i === idx ? 'on' : ''} onClick={() => ke(i)} aria-label={`Ke foto ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
