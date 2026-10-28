import type { Metadata } from 'next';
import { listKategoriAktif } from '@/lib/queries';
import PaketForm from '@/components/admin/PaketForm';

export const metadata: Metadata = { title: 'Tambah Paket' };

export default async function PaketBaru() {
  return <PaketForm paket={null} kategori={await listKategoriAktif()} />;
}
