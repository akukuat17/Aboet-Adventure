import ExcelJS from 'exceljs';
import { getSesi } from '@/lib/auth';
import { listPemesanan } from '@/lib/queries';
import { tanggalPendek } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Export semua pemesanan (family + korporat), mengikuti filter yang sedang aktif. */
export async function GET(req: Request) {
  if (!(await getSesi())) return new Response('Unauthorized', { status: 401 });
  const q = new URL(req.url).searchParams;
  const f = { status: q.get('status') ?? undefined, tipe: q.get('tipe') ?? undefined, search: q.get('search') ?? undefined, dateFrom: q.get('date_from') ?? undefined, dateTo: q.get('date_to') ?? undefined };

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Pemesanan');
  ws.columns = [
    { header: 'Tanggal', width: 14 }, { header: 'Kode', width: 16 }, { header: 'Tipe', width: 10 }, { header: 'Nama', width: 22 },
    { header: 'Perusahaan', width: 24 }, { header: 'WhatsApp', width: 16 }, { header: 'Paket', width: 36 }, { header: 'Jumlah', width: 8 },
    { header: 'Estimasi', width: 16 }, { header: 'Harga Final', width: 16 }, { header: 'Pendapatan', width: 16 }, { header: 'Status', width: 14 }, { header: 'Sumber', width: 10 }, { header: 'Catatan', width: 30 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A46' } };
  for (let page = 1; page <= 200; page++) {
    const d = await listPemesanan({ ...f, page: String(page) });
    for (const x of d.rows) {
      const dihitung = x.status === 'dikonfirmasi' || x.status === 'selesai';
      ws.addRow([tanggalPendek(x.createdAt), x.kode, x.tipe, x.nama, x.perusahaan ?? '', x.whatsapp, x.paket.nama, x.jumlah, x.estimasiTotal, x.hargaFinal ?? '', dihitung ? (x.hargaFinal ?? x.estimasiTotal) : 0, x.status, x.sumber, x.catatan ?? '']);
    }
    if (page >= d.lastPage) break;
  }
  [9, 10, 11].forEach((c) => (ws.getColumn(c).numFmt = '"Rp"#,##0'));

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="pemesanan.xlsx"',
    },
  });
}
