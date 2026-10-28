/** Normalisasi nomor WA: 08xx → 628xx, tanpa 62 → ditambah 62 */
export function normalisasiWa(raw: string): string {
  const clean = raw.replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.startsWith('08')) return '62' + clean.slice(1);
  if (!clean.startsWith('62')) return '62' + clean;
  return clean;
}

export const WA_REGEX = /^628[0-9]{9,11}$/;
