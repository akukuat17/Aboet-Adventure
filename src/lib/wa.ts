export const WA_DEFAULT = process.env.WA_NUMBER || '6285799001985';

export function waUrl(nomor: string | null | undefined, pesan: string): string {
  return `https://wa.me/${nomor || WA_DEFAULT}?text=${encodeURIComponent(pesan)}`;
}

/** Ganti {placeholder} pada template; placeholder tak dikenal diganti '-' */
export function isiTemplate(template: string, data: Record<string, string | number>): string {
  const penuh = template.replace(/\r\n/g, '\n').replace(/\{([a-z_]+)\}/g, (_m, k: string) => (k in data ? String(data[k]) : '-'));
  return penuh;
}
