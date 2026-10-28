import 'server-only';
import { redirect } from 'next/navigation';

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
export const intOr = (v: string, d: number) => (v === '' ? d : Number(v));

export function flash(path: string, tipe: 'success' | 'error', pesan: string): never {
  redirect(`${path}?${tipe}=${encodeURIComponent(pesan)}`);
}

export type FormState = { error?: string; values?: Record<string, string | boolean> } | null;
