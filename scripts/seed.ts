import './_env';
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '../src/db';
import { SEED_KATEGORI, SEED_PAKET, ringkasTier } from '../src/db/seed-data';
import { SETTING_DEFAULTS } from '../src/lib/settings';

const { kategori, paket, pengaturan, adminUsers, pemesanan } = schema;

/** Aman dijalankan berulang: data yang sudah ada tidak ditimpa. Tambah --demo untuk 25 pemesanan contoh. */
async function main() {
  const db = await getDb();
  const demo = process.argv.includes('--demo');

  for (const k of SEED_KATEGORI) await db.insert(kategori).values(k).onConflictDoNothing({ target: kategori.slug });
  const kats = await db.select().from(kategori);
  const idKategori = new Map(kats.map((k) => [k.slug, k.id]));

  for (const [slugKat, daftar] of Object.entries(SEED_PAKET)) {
    for (const [i, p] of daftar.entries()) {
      const [nama0, harga0, min0] = p.tiers[0];
      void nama0;
      await db
        .insert(paket)
        .values({
          kategoriId: idKategori.get(slugKat)!,
          nama: p.nama,
          slug: p.slug,
          hargaMulai: harga0,
          satuanHarga: p.satuan ?? 'Orang',
          lokasi: p.lokasi,
          deskripsi: `${p.deskripsi} ${ringkasTier(p.tiers, p.satuan ?? 'Orang')}`.trim(),
          ikon: p.ikon,
          durasi: p.durasi,
          medan: p.medan,
          minPeserta: min0,
          termasuk: p.termasuk,
          foto: `/paket/${p.slug}.webp`,
          urutan: i + 1,
        })
        .onConflictDoNothing({ target: paket.slug });
      // isi foto bawaan untuk paket lama yang belum punya foto (tidak menimpa foto yang diupload admin)
      await db.update(paket).set({ foto: `/paket/${p.slug}.webp` }).where(and(eq(paket.slug, p.slug), isNull(paket.foto)));
    }
  }

  for (const [kunci, def] of Object.entries(SETTING_DEFAULTS)) {
    await db.insert(pengaturan).values({ kunci, nilai: def.nilai, tipe: def.tipe, label: def.label }).onConflictDoNothing({ target: pengaturan.kunci });
  }

  const email = process.env.ADMIN_EMAIL || 'admin@aboet.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const ada = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  if (!ada.length) {
    await db.insert(adminUsers).values({ nama: process.env.ADMIN_NAMA || 'Admin Aboet', email, password: await bcrypt.hash(password, 10) });
    console.log(`✓ Admin dibuat: ${email}` + (process.env.ADMIN_PASSWORD ? '' : '  (password default "password123" — segera ganti via ADMIN_PASSWORD)'));
  }

  if (demo) {
    const semua = await db.select().from(paket);
    const status = ['baru', 'dikonfirmasi', 'selesai', 'batal'] as const;
    const nama = ['Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Maya', 'Joko', 'Putri', 'Agus', 'Lina'];
    for (let i = 0; i < 25; i++) {
      const p = semua[Math.floor(Math.random() * semua.length)];
      const jumlah = p.minPeserta + Math.floor(Math.random() * 10);
      const s = status[Math.floor(Math.random() * status.length)];
      const dibuat = new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000);
      const kunjungan = new Date(dibuat.getTime() + (1 + Math.floor(Math.random() * 30)) * 86400000).toISOString().slice(0, 10);
      const estimasi = p.hargaMulai * jumlah;
      await db.insert(pemesanan).values({
        kode: `AB-DEMO-${i.toString().padStart(3, '0')}`,
        paketId: p.id,
        nama: nama[i % nama.length],
        whatsapp: '628' + Math.floor(1e9 + Math.random() * 9e9).toString().slice(0, 10),
        tanggalKunjungan: kunjungan,
        jumlah,
        estimasiTotal: estimasi,
        hargaFinal: s === 'dikonfirmasi' || s === 'selesai' ? estimasi + (Math.floor(Math.random() * 15) - 5) * 10000 : null,
        status: s,
        tanggalKonfirmasi: s === 'dikonfirmasi' || s === 'selesai' ? dibuat : null,
        createdAt: dibuat,
      }).onConflictDoNothing({ target: pemesanan.kode });
    }
    console.log('✓ 25 pemesanan contoh ditambahkan');
  }

  console.log('✓ Seed selesai');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
