import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPaketById, listKategoriAktif } from '@/lib/queries';
import PaketForm from '@/components/admin/PaketForm';

export const metadata: Metadata = { title: 'Edit Paket' };

export default async function PaketEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [p, kategori] = await Promise.all([getPaketById(id), listKategoriAktif()]);
  if (!p) notFound();
  return <PaketForm paket={p} kategori={kategori} />;
}
