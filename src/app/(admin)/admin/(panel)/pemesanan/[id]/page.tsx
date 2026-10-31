import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPemesananAdmin } from '@/lib/queries';
import { rupiah, tanggalJam, tanggalPanjang } from '@/lib/format';
import { ubahHargaFinal, ubahStatus } from '@/actions/pemesanan';
import StatusSelect from '@/components/admin/StatusSelect';
import { hapusPemesanan } from '@/actions/pemesananBaru';
import ConfirmForm from '@/components/admin/ConfirmForm';
import SubmitButton from '@/components/admin/SubmitButton';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Detail Pemesanan #${id}` };
}

export default async function PemesananShow({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();
  const p = await getPemesananAdmin(id);
  if (!p) notFound();

  const satuan = p.paket.satuanHarga.toLowerCase();
  const pendapatan = p.hargaFinal ?? p.estimasiTotal;
  const Row = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
    <div className={'form-group' + (full ? ' sm:col-span-2' : '')}><label className="label">{label}</label><p className="font-semibold">{children}</p></div>
  );

  return (
    <>
      <div className="mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-gray-900">Detail Pemesanan</h1>
            <p className="text-gray-600 mt-1">{p.kode}</p>
          </div>
          <div className="flex gap-2">
            <ConfirmForm action={hapusPemesanan.bind(null, p.id)} pesan="Hapus pemesanan ini permanen?">
              <button type="submit" className="btn btn-ghost" style={{ color: '#b91c1c' }}>Hapus</button>
            </ConfirmForm>
            <Link href="/admin/pemesanan" className="btn btn-ghost">&larr; Kembali</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card animate-fade-in">
            <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Informasi Paket</h3></div>
            <div className="card-body">
              <div className="form-row cols-2">
                <Row label="Paket">{p.paket.nama}</Row>
                <Row label="Kategori">{p.paket.kategori.nama}</Row>
                <Row label="Harga Satuan">{rupiah(p.paket.hargaMulai)}/{satuan}</Row>
                <Row label="Lokasi">{p.paket.lokasi}</Row>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
            <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Data Pemesan</h3></div>
            <div className="card-body">
              <div className="form-row cols-2">
                <Row label="Tipe"><span className={'badge ' + (p.tipe === 'korporat' ? 'badge-purple' : 'badge-info')}>{p.tipe === 'korporat' ? 'Korporat' : 'Family'}</span></Row>
                {p.perusahaan && <Row label="Perusahaan">{p.perusahaan}</Row>}
                <Row label={p.tipe === 'korporat' ? 'Nama PIC' : 'Nama'}>{p.nama}</Row>
                <Row label="Sumber">{p.sumber === 'web' ? 'Form situs' : p.sumber === 'manual' ? 'Input manual' : 'Import Excel'}</Row>
                <Row label="WhatsApp">{p.whatsapp}</Row>
                <Row label="Tanggal Kunjungan">{tanggalPanjang(p.tanggalKunjungan)}</Row>
                <Row label="Jumlah">{p.jumlah} {satuan}</Row>
                <Row label="Catatan" full>{p.catatan || '-'}</Row>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card animate-fade-in">
            <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Status &amp; Harga</h3></div>
            <div className="card-body">
              <div className="form-group mb-4">
                <label className="label">Status</label>
                <StatusSelect action={ubahStatus.bind(null, p.id)} value={p.status} />
              </div>

              <div className="form-group mb-4">
                <label className="label">Harga Final (Rp)</label>
                <form action={ubahHargaFinal.bind(null, p.id)}>
                  <div className="flex gap-2">
                    <input type="number" name="harga_final" defaultValue={p.hargaFinal ?? ''} placeholder="Kosongkan = pakai estimasi" className="input flex-1" min={0} step={1000} />
                    <SubmitButton className="btn btn-primary whitespace-nowrap" pendingText="…">Simpan</SubmitButton>
                  </div>
                </form>
                <p className="text-xs text-gray-500 mt-1">
                  {p.hargaFinal ? 'Pendapatan: ' : 'Pendapatan (estimasi): '}
                  <span className={'font-semibold' + (p.hargaFinal ? ' text-green-700' : '')}>{rupiah(pendapatan)}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Estimasi Total</span><span className="font-semibold">{rupiah(p.estimasiTotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Harga Final</span><span className="font-semibold">{p.hargaFinal ? rupiah(p.hargaFinal) : '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pendapatan Dihitung</span><span className="font-semibold text-green-700">{rupiah(pendapatan)}</span></div>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
            <div className="card-header"><h3 className="font-heading font-bold text-lg text-gray-900">Timeline</h3></div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-white text-sm">check</span></div>
                  <div><p className="font-medium">Pemesanan dibuat</p><p className="text-sm text-gray-500">{tanggalJam(p.createdAt)}</p></div>
                </div>
                {p.tanggalKonfirmasi && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-white text-sm">verified</span></div>
                    <div><p className="font-medium">Dikonfirmasi</p><p className="text-sm text-gray-500">{tanggalJam(p.tanggalKonfirmasi)}</p></div>
                  </div>
                )}
                {p.status === 'selesai' && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-white text-sm">task_alt</span></div>
                    <div><p className="font-medium">Selesai</p><p className="text-sm text-gray-500">{tanggalJam(p.updatedAt)}</p></div>
                  </div>
                )}
                {p.status === 'batal' && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-white text-sm">close</span></div>
                    <div><p className="font-medium">Dibatalkan</p><p className="text-sm text-gray-500">{tanggalJam(p.updatedAt)}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
