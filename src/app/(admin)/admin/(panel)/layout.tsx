import { Suspense } from 'react';
import { wajibAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import Flash from '@/components/admin/Flash';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const sesi = await wajibAdmin();
  return (
    <AdminShell nama={sesi.nama} flash={<Suspense fallback={null}><Flash /></Suspense>}>
      {children}
    </AdminShell>
  );
}
