'use client';

import { useActionState } from 'react';
import { importPemesanan, type HasilImport } from '@/actions/pemesananBaru';
import SubmitButton from './SubmitButton';

export default function ImportForm() {
  const [hasil, action] = useActionState(importPemesanan, null as HasilImport);
  return (
    <form action={action}>
      <div className="form-group mb-4">
        <label className="label">File Excel (.xlsx) atau CSV</label>
        <input type="file" name="file" accept=".xlsx,.csv" className="input" required />
      </div>
      <SubmitButton className="btn btn-primary" pendingText="Mengimpor…">Import Sekarang</SubmitButton>

      {hasil?.error && <div className="alert alert-error mt-4" role="alert"><span className="material-symbols-outlined icon">error</span>{hasil.error}</div>}
      {hasil && !hasil.error && (
        <div className="mt-4" data-testid="hasil-import">
          <div className={'alert ' + (hasil.ok ? 'alert-success' : 'alert-error')}>
            <span className="material-symbols-outlined icon">{hasil.ok ? 'check_circle' : 'error'}</span>
            {hasil.ok} baris berhasil diimport, {hasil.gagal.length} dilewati.
          </div>
          {hasil.gagal.length > 0 && (
            <ul className="mt-3 text-sm space-y-1">
              {hasil.gagal.map((g) => <li key={g.baris}><b>Baris {g.baris}:</b> {g.alasan}</li>)}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
