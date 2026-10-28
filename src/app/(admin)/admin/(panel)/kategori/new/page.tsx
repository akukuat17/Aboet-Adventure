import type { Metadata } from 'next';
import KategoriForm from '@/components/admin/KategoriForm';

export const metadata: Metadata = { title: 'Tambah Kategori' };

export default function KategoriBaru() {
  return <KategoriForm kategori={null} />;
}
