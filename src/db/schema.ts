import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const kategori = pgTable('kategori', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  ikon: varchar('ikon', { length: 255 }).notNull().default('water'),
  warnaBg: varchar('warna_bg', { length: 255 }).notNull().default('#dcf0e2'),
  warnaIkon: varchar('warna_ikon', { length: 255 }).notNull().default('#2f9e58'),
  urutan: integer('urutan').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
  ...timestamps,
});

export const paket = pgTable(
  'paket',
  {
    id: serial('id').primaryKey(),
    kategoriId: integer('kategori_id')
      .notNull()
      .references(() => kategori.id, { onDelete: 'cascade' }),
    nama: varchar('nama', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    hargaMulai: bigint('harga_mulai', { mode: 'number' }).notNull(),
    satuanHarga: varchar('satuan_harga', { length: 50 }).notNull().default('Orang'),
    lokasi: varchar('lokasi', { length: 255 }).notNull().default('Sentul, Bogor'),
    deskripsi: text('deskripsi'),
    /** URL penuh (Vercel Blob) atau path /uploads/... saat dev lokal */
    foto: text('foto'),
    ikon: varchar('ikon', { length: 255 }),
    durasi: varchar('durasi', { length: 255 }),
    medan: varchar('medan', { length: 255 }),
    minPeserta: integer('min_peserta').notNull().default(1),
    termasuk: jsonb('termasuk').$type<string[]>(),
    aktif: boolean('aktif').notNull().default(true),
    urutan: integer('urutan').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('paket_kategori_aktif_idx').on(t.kategoriId, t.aktif)],
);

export const STATUS_PEMESANAN = ['baru', 'dikonfirmasi', 'selesai', 'batal'] as const;
export type StatusPemesanan = (typeof STATUS_PEMESANAN)[number];

/**
 * Pemesanan hanya untuk tipe Family (isi form).
 * Korporat/PT langsung ke WhatsApp tanpa disimpan ke database.
 */
export const pemesanan = pgTable(
  'pemesanan',
  {
    id: serial('id').primaryKey(),
    kode: varchar('kode', { length: 255 }).notNull().unique(),
    paketId: integer('paket_id')
      .notNull()
      .references(() => paket.id, { onDelete: 'cascade' }),
    nama: varchar('nama', { length: 255 }).notNull(),
    whatsapp: varchar('whatsapp', { length: 255 }).notNull(),
    tanggalKunjungan: date('tanggal_kunjungan', { mode: 'string' }).notNull(),
    jumlah: integer('jumlah').notNull(),
    catatan: text('catatan'),
    estimasiTotal: bigint('estimasi_total', { mode: 'number' }).notNull(),
    hargaFinal: bigint('harga_final', { mode: 'number' }),
    status: varchar('status', { length: 20 }).$type<StatusPemesanan>().notNull().default('baru'),
    tanggalKonfirmasi: timestamp('tanggal_konfirmasi', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('pemesanan_status_created_idx').on(t.status, t.createdAt),
    index('pemesanan_paket_status_idx').on(t.paketId, t.status),
  ],
);

export const pengaturan = pgTable('pengaturan', {
  id: serial('id').primaryKey(),
  kunci: varchar('kunci', { length: 255 }).notNull().unique(),
  nilai: text('nilai'),
  tipe: varchar('tipe', { length: 50 }).notNull().default('text'),
  label: varchar('label', { length: 255 }),
  ...timestamps,
});

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  ...timestamps,
});

export type Kategori = typeof kategori.$inferSelect;
export type Paket = typeof paket.$inferSelect;
export type Pemesanan = typeof pemesanan.$inferSelect;
