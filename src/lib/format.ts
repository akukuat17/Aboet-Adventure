const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const TZ = 'Asia/Jakarta';

export function rupiah(n: number | null | undefined): string {
  const v = Math.round(Number(n ?? 0));
  return 'Rp' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** '2026-10-30' → '30 Oktober 2026' */
export function tanggalPanjang(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${BULAN_PANJANG[m - 1]} ${y}`;
}

function partsJakarta(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { y: get('year'), m: Number(get('month')), d: get('day'), h: get('hour'), mi: get('minute') };
}

/** → '24 Okt 2026' (WIB) */
export function tanggalPendek(date: Date): string {
  const p = partsJakarta(date);
  return `${p.d} ${BULAN_PENDEK[p.m - 1]} ${p.y}`;
}

/** → '24 Okt 2026 14:05' (WIB) */
export function tanggalJam(date: Date): string {
  const p = partsJakarta(date);
  return `${p.d} ${BULAN_PENDEK[p.m - 1]} ${p.y} ${p.h}:${p.mi}`;
}

/** Tanggal hari ini (WIB) format YYYY-MM-DD */
export function hariIniISO(offsetBulan = 0): string {
  const p = partsJakarta(new Date());
  const d = new Date(Date.UTC(Number(p.y), p.m - 1 + offsetBulan, Number(p.d)));
  return d.toISOString().slice(0, 10);
}

export function awalBulanISO(): string {
  const p = partsJakarta(new Date());
  return `${p.y}-${String(p.m).padStart(2, '0')}-01`;
}

export function akhirBulanISO(): string {
  const p = partsJakarta(new Date());
  const d = new Date(Date.UTC(Number(p.y), p.m, 0));
  return d.toISOString().slice(0, 10);
}

export function labelBulan(isoYYYYMM: string): string {
  const [y, m] = isoYYYYMM.split('-').map(Number);
  return `${BULAN_PENDEK[m - 1]} ${y}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function randomKode(len = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** URL gambar paket: foto upload, atau placeholder yang sama seperti versi Laravel */
export function fotoPaket(foto: string | null | undefined, slug: string, size = '700/360'): string {
  return foto ? foto : `https://picsum.photos/seed/${slug}/${size}`;
}
