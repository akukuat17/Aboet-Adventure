import ExcelJS from 'exceljs';
import { getSesi } from '@/lib/auth';
import { getRekap } from '@/lib/queries';
import { tanggalPendek } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await getSesi())) return new Response('Unauthorized', { status: 401 });
  const b = new URL(req.url).searchParams.get('bulan') ?? '';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b)) return new Response('Bulan tidak valid', { status: 400 });
  const r = await getRekap(b);
  const s = r.ringkas;

  const wb = new ExcelJS.Workbook();
  const head = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A46' } };
  };
  const rp = '"Rp"#,##0';

  const a = wb.addWorksheet('Ringkasan');
  a.columns = [{ header: 'Keterangan', width: 34 }, { header: b, width: 22 }];
  head(a);
  [
    ['Total pemesanan', s.total], ['  Family', s.family], ['  Korporat', s.korporat],
    ['Status baru', s.baru], ['Status dikonfirmasi', s.dikonfirmasi], ['Status selesai', s.selesai], ['Status batal', s.batal],
    ['Peserta (dikonfirmasi/selesai)', s.peserta],
    ['Pendapatan total', s.pendapatan], ['  Pendapatan family', s.pendapatanFamily], ['  Pendapatan korporat', s.pendapatanKorporat],
    ['Klik WhatsApp korporat', r.klikKorporat],
  ].forEach((x) => a.addRow(x));
  [10, 11, 12].forEach((i) => (a.getRow(i).getCell(2).numFmt = rp));

  const k = wb.addWorksheet('Per Kategori');
  k.columns = [{ header: 'Kategori', width: 30 }, { header: 'Pesanan', width: 12 }, { header: 'Pendapatan', width: 18 }];
  head(k);
  r.perKategori.forEach((x) => k.addRow([x.nama, x.total, x.pendapatan]));
  k.getColumn(3).numFmt = rp;

  const p = wb.addWorksheet('Per Paket');
  p.columns = [{ header: 'Paket', width: 38 }, { header: 'Kategori', width: 28 }, { header: 'Pesanan', width: 10 }, { header: 'Peserta', width: 10 }, { header: 'Pendapatan', width: 18 }];
  head(p);
  r.perPaket.forEach((x) => p.addRow([x.nama, x.kategori, x.total, x.peserta, x.pendapatan]));
  p.getColumn(5).numFmt = rp;

  const d = wb.addWorksheet('Detail');
  d.columns = [
    { header: 'Tanggal', width: 14 }, { header: 'Kode', width: 16 }, { header: 'Tipe', width: 10 }, { header: 'Nama', width: 22 },
    { header: 'Perusahaan', width: 24 }, { header: 'WhatsApp', width: 16 }, { header: 'Paket', width: 36 }, { header: 'Jumlah', width: 8 },
    { header: 'Pendapatan', width: 16 }, { header: 'Status', width: 14 }, { header: 'Sumber', width: 10 },
  ];
  head(d);
  r.daftar.forEach((x) => d.addRow([tanggalPendek(x.createdAt), x.kode, x.tipe, x.nama, x.perusahaan ?? '', x.whatsapp, x.paket.nama, x.jumlah, x.hargaFinal ?? x.estimasiTotal, x.status, x.sumber]));
  d.getColumn(9).numFmt = rp;

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rekap-${b}.xlsx"`,
    },
  });
}
