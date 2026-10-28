import type { Metadata } from 'next';
import HomeContent, { type KategoriKartu } from '@/components/public/HomeContent';
import { getKategoriDenganPaket } from '@/lib/queries';

export const metadata: Metadata = { title: 'Paket Wahana' };
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getKategoriDenganPaket();
  const kategori: KategoriKartu[] = data.map((k) => ({
    id: k.id, slug: k.slug, nama: k.nama, ikon: k.ikon, warnaBg: k.warnaBg, warnaIkon: k.warnaIkon,
    paket: k.paket.map((p) => ({ slug: p.slug, nama: p.nama, lokasi: p.lokasi, hargaMulai: p.hargaMulai, satuanHarga: p.satuanHarga, foto: p.foto })),
  }));
  return <HomeContent kategori={kategori} />;
}
