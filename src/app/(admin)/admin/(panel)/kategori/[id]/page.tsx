import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKategori } from '@/lib/queries';
import KategoriForm from '@/components/admin/KategoriForm';

export const metadata: Metadata = { title: 'Edit Kategori' };

export default async function KategoriEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const k = await getKategori(id);
  if (!k) notFound();
  return <KategoriForm kategori={k} />;
}
