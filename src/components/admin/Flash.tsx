'use client';

import { useSearchParams } from 'next/navigation';

export default function Flash() {
  const sp = useSearchParams();
  const success = sp.get('success');
  const error = sp.get('error');
  if (!success && !error) return null;
  return (
    <div className={'alert animate-slide-down mb-6 ' + (error ? 'alert-error' : 'alert-success')} role="alert">
      <span className="material-symbols-outlined icon">{error ? 'error' : 'check_circle'}</span>
      {error ?? success}
    </div>
  );
}
