import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/public/BookingForm';
import { fotoPaket, rupiah } from '@/lib/format';
import { getPaketAktif, getSettings } from '@/lib/queries';
import { isiTemplate, waUrl } from '@/lib/wa';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const paket = await getPaketAktif(slug);
  return { title: paket ? `Pesan ${paket.nama}` : 'Paket tidak ditemukan' };
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params;
  const paket = await getPaketAktif(slug);
  if (!paket) notFound();

  // KORPORAT: tanpa form & tanpa simpan DB, langsung chat WhatsApp dengan template dari Pengaturan
  const set = await getSettings(['wa_number', 'wa_template_korporat']);
  const waKorporatUrl = waUrl(set.wa_number, isiTemplate(set.wa_template_korporat ?? '', { paket: paket.nama }));

  const satuan = paket.satuanHarga.toLowerCase();
  const foto = fotoPaket(paket.foto, paket.slug, '900/600');
  const tiles = [
    { ikon: 'schedule', label: 'Durasi', nilai: paket.durasi || '-' },
    { ikon: 'terrain', label: 'Medan', nilai: paket.medan || '-' },
    { ikon: 'groups', label: 'Min. peserta', nilai: `${paket.minPeserta} ${satuan}` },
    { ikon: 'sell', label: `Mulai / ${satuan}`, nilai: rupiah(paket.hargaMulai), aksen: true },
  ];

  return (
    <div className="bk-layout">
      <aside className="bk-photo-grid" aria-label={`Foto dan ringkasan ${paket.nama}`}>
        <figure className="bk-main">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt={paket.nama} />
          <figcaption>
            <h2>{paket.nama}</h2>
            <p><span className="material-symbols-outlined" aria-hidden="true">location_on</span>{paket.lokasi}</p>
          </figcaption>
        </figure>
        {tiles.map((t) => (
          <div key={t.label} className={'bk-tile' + (t.aksen ? ' accent' : '')}>
            <span className="ic"><span className="material-symbols-outlined" aria-hidden="true">{t.ikon}</span></span>
            <span className="tx"><span className="lbl">{t.label}</span><span className="val">{t.nilai}</span></span>
          </div>
        ))}
      </aside>

      <div className="bk-form">
        <BookingForm
          paket={{ slug: paket.slug, nama: paket.nama, satuanHarga: paket.satuanHarga, minPeserta: paket.minPeserta, hargaMulai: paket.hargaMulai }}
          waKorporatUrl={waKorporatUrl}
        />
      </div>
    </div>
  );
}
