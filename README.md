# Aboet Adventure — Next.js (siap Vercel)

Rewrite dari Laravel (web-utama + web-admin) jadi **satu project Next.js 16** (App Router, TypeScript, Tailwind v4, Drizzle + Postgres). Tampilan sama; publik di `/`, admin di `/admin`.

## Jalan di lokal
```bash
npm install
npm run db:setup      # buat tabel + seed kategori, 17 wahana, pengaturan, akun admin
npm run dev           # http://localhost:3000
```
- Tanpa `DATABASE_URL` otomatis pakai DB tertanam (PGlite, folder `.data/`) — tidak perlu install Postgres.
- Login admin default: `admin@aboet.com` / `password123` (atau sesuai `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
- `npm run db:seed -- --demo` menambah 25 pemesanan contoh.
- Foto 17 wahana bawaan ada di `public/paket/` (dari PDF katalog) dan diisi otomatis oleh seed. Foto yang diupload admin lokal masuk `public/uploads`.

## Deploy ke Vercel
1. Push ke GitHub, import di Vercel (framework terdeteksi otomatis).
2. Buat database Postgres (Neon / Vercel Postgres / Supabase) → isi env `DATABASE_URL` (connection string *pooled*).
3. Isi env `AUTH_SECRET` (`openssl rand -base64 32`).
4. Tab **Storage** → buat **Blob** store dan hubungkan ke project (otomatis mengisi `BLOB_READ_WRITE_TOKEN`). Wajib untuk upload foto, karena filesystem Vercel read-only.
5. Dari komputer, isi `.env` dengan `DATABASE_URL` produksi + `ADMIN_EMAIL` + `ADMIN_PASSWORD` (kuat), lalu `npm run db:setup` sekali.
6. Deploy. Login di `/admin`, lalu cek Pengaturan (nomor WA, template).

## Catatan
- Korporat: tombol WhatsApp langsung (tanpa form, tidak masuk tabel pemesanan, tapi kliknya dicatat di tabel `klik_wa` untuk statistik). Family: form → simpan → redirect ke `wa.me` dengan template.
- Statistik dashboard = jumlah orang yang sampai klik konfirmasi ke WhatsApp (family + korporat). Statistik pengunjung web belum dipasang.
- Setelah update kode yang mengubah tabel, jalankan `npm run db:setup` lagi ke database produksi (aman diulang).
- Semua halaman dinamis (selalu baca DB terbaru). Build tidak butuh DB.
- Sesi admin: cookie JWT `aboet_admin` (12 jam, 30 hari bila "Ingat saya"); dijaga `src/proxy.ts` + pengecekan di tiap halaman/action.
- Bulan ditampilkan dalam bahasa Indonesia, zona waktu WIB.

## Pembaruan: Korporat, Import Excel & Rekap Bulanan

- **Migrasi baru** (`0001`, `0002`): setelah deploy jalankan sekali `npm run db:setup` ke database produksi (aman diulang).
- **Pemesanan** punya kolom **Tipe** (Family / Korporat), **Perusahaan**, dan **Sumber** (web / manual / import). Bisa difilter per tipe.
- **Family** masuk otomatis dari form situs. **Korporat yang sudah deal** dicatat lewat Admin → Pemesanan → *Tambah Korporat (Deal)* agar masuk statistik.
- **Export Excel**: tombol *Export Excel* di Pemesanan (family + korporat, ikut filter). **Import Excel** menerima keduanya lewat kolom Tipe.
- **Import Excel**: Admin → Pemesanan → *Import Excel*. Unduh template, isi, upload. Baris yang salah dilewati dan alasannya ditampilkan.
- **Rekap Bulanan**: Admin → *Rekap Bulanan* (ringkasan, pie chart per kategori, grafik harian, per paket, daftar) + tombol **Excel** untuk unduh.
- Form Kategori & Paket kini punya bar **Simpan / Batal** di bawah.
