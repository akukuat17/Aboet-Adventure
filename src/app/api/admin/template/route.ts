import ExcelJS from 'exceljs';
import { getSesi } from '@/lib/auth';
import { getDb, schema } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await getSesi())) return new Response('Unauthorized', { status: 401 });
  const db = await getDb();
  const paket = await db.select({ nama: schema.paket.nama }).from(schema.paket);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Pemesanan');
  ws.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'Tipe', key: 'tipe', width: 12 },
    { header: 'Nama', key: 'nama', width: 24 },
    { header: 'Perusahaan', key: 'perusahaan', width: 26 },
    { header: 'WhatsApp', key: 'wa', width: 16 },
    { header: 'Paket', key: 'paket', width: 36 },
    { header: 'Jumlah', key: 'jumlah', width: 10 },
    { header: 'Harga Final', key: 'harga', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Catatan', key: 'catatan', width: 30 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A46' } };
  const contoh = paket[0]?.nama ?? 'Nama paket';
  ws.addRow({ tanggal: '2026-10-15', tipe: 'family', nama: 'Budi Santoso', perusahaan: '', wa: '081234567890', paket: contoh, jumlah: 4, harga: 800000, status: 'selesai', catatan: 'Contoh baris, hapus sebelum import' });
  ws.addRow({ tanggal: '2026-10-20', tipe: 'korporat', nama: 'Rina (HRD)', perusahaan: 'PT Contoh Maju', wa: '', paket: contoh, jumlah: 30, harga: 6000000, status: 'selesai', catatan: '' });

  const info = wb.addWorksheet('Petunjuk');
  info.columns = [{ width: 100 }];
  [
    'Kolom wajib: Tanggal (YYYY-MM-DD), Paket (persis seperti nama di daftar paket / slug), Jumlah.',
    'Tipe: family atau korporat. Jika kosong dan Perusahaan terisi → korporat. Perusahaan wajib untuk korporat.',
    'Catatan: family yang sudah masuk lewat situs tidak perlu diimport lagi (nanti dobel).',
    'Status: baru / dikonfirmasi / selesai / batal. Jika kosong → selesai.',
    'Harga Final kosong → pakai harga paket × jumlah.',
    'WhatsApp boleh kosong. Hapus 2 baris contoh sebelum import.',
    '',
    'Nama paket yang tersedia:',
    ...paket.map((p) => p.nama),
  ].forEach((t) => info.addRow([t]));

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-pemesanan.xlsx"',
    },
  });
}
