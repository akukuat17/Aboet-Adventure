import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** Ubah string style inline ala HTML ("display:flex; gap:8px") menjadi objek style React. */
export function s(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/^-(webkit|moz|ms)-/, (_m, v: string) => (v === 'ms' ? 'ms' : v[0].toUpperCase() + v.slice(1)) + '-').replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[key] = val;
  }
  cache.set(css, out as CSSProperties);
  return out as CSSProperties;
}
