'use client';

import { STATUS_PEMESANAN } from '@/db/schema';

const LABEL: Record<string, string> = { baru: 'Baru', dikonfirmasi: 'Dikonfirmasi', selesai: 'Selesai', batal: 'Batal' };

export default function StatusSelect({ action, value }: { action: (fd: FormData) => void | Promise<void>; value: string }) {
  return (
    <form action={action}>
      <select name="status" defaultValue={value} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="input select">
        {STATUS_PEMESANAN.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
      </select>
    </form>
  );
}
