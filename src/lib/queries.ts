import 'server-only';
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { SETTING_DEFAULTS } from '@/lib/settings';
import { WA_DEFAULT } from '@/lib/wa';
import { TZ } from '@/lib/format';
import type { StatusPemesanan } from '@/db/schema';

const { kategori, paket, pemesanan, pengaturan, klikWa } = schema;

export const PER_PAGE = 20;

export type Page<T> = { rows: T[]; total: number; page: number; perPage: number; lastPage: number };

function halaman(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/* ───────────────────────── Pengaturan ───────────────────────── */

export async function getSettings<K extends string>(keys: readonly K[]): Promise<Record<K, string | null>> {
  const db = await getDb();
  const rows = await db.select().from(pengaturan).where(inArray(pengaturan.kunci, [...keys]));
  const map = new Map(rows.map((r) => [r.kunci, r.nilai]));
  const out = {} as Record<K, string | null>;
  for (const k of keys) {
    if (map.has(k)) out[k] = map.get(k) ?? null;
    else out[k] = SETTING_DEFAULTS[k]?.nilai ?? null;
  }
  return out;
}

export async function getWaNumber(): Promise<string> {
  const { wa_number } = await getSettings(['wa_number']);
  return wa_number || WA_DEFAULT;
}

export async function setSetting(kunci: string, nilai: string | null): Promise<void> {
  const db = await getDb();
  const def = SETTING_DEFAULTS[kunci];
  await db
    .insert(pengaturan)
    .values({ kunci, nilai, tipe: def?.tipe ?? 'text', label: def?.label ?? kunci })
    .onConflictDoUpdate({ target: pengaturan.kunci, set: { nilai, updatedAt: new Date() } });
}

/* ───────────────────────── Publik ───────────────────────── */

export type KategoriRow = typeof kategori.$inferSelect;
export type PaketRow = typeof paket.$inferSelect;
export type KategoriDenganPaket = KategoriRow & { paket: PaketRow[] };

export async function getKategoriDenganPaket(search?: string): Promise<KategoriDenganPaket[]> {
  const db = await getDb();
  const kats = await db.select().from(kategori).where(eq(kategori.aktif, true)).orderBy(asc(kategori.urutan), asc(kategori.nama));
  if (!kats.length) return [];

  const conds = [eq(paket.aktif, true), inArray(paket.kategoriId, kats.map((k) => k.id))];
  if (search?.trim()) conds.push(ilike(paket.nama, `%${search.trim()}%`));
  const pakets = await db.select().from(paket).where(and(...conds)).orderBy(asc(paket.urutan), asc(paket.nama));

  return kats.map((k) => ({ ...k, paket: pakets.filter((p) => p.kategoriId === k.id) }));
}

export async function getPaketAktif(slug: string) {
  const db = await getDb();
  const [row] = await db
    .select({ paket, kategori })
    .from(paket)
    .innerJoin(kategori, eq(paket.kategoriId, kategori.id))
    .where(and(eq(paket.slug, slug), eq(paket.aktif, true)))
    .limit(1);
  return row ? { ...row.paket, kategori: row.kategori } : null;
}

export async function getPemesananPublik(id: number) {
  const db = await getDb();
  const [row] = await db
    .select({ pemesanan, paket })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .where(eq(pemesanan.id, id))
    .limit(1);
  return row ? { ...row.pemesanan, paket: row.paket } : null;
}

/* ───────────────────────── Admin: kategori ───────────────────────── */

export async function listKategori(pageRaw?: string): Promise<Page<KategoriRow>> {
  const db = await getDb();
  const page = halaman(pageRaw);
  const [{ total }] = await db.select({ total: count() }).from(kategori);
  const rows = await db
    .select()
    .from(kategori)
    .orderBy(asc(kategori.urutan), asc(kategori.nama))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);
  return { rows, total, page, perPage: PER_PAGE, lastPage: Math.max(1, Math.ceil(total / PER_PAGE)) };
}

export async function getKategori(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(kategori).where(eq(kategori.id, id)).limit(1);
  return row ?? null;
}

export async function listKategoriAktif() {
  const db = await getDb();
  return db.select().from(kategori).where(eq(kategori.aktif, true)).orderBy(asc(kategori.urutan), asc(kategori.nama));
}

/* ───────────────────────── Admin: paket ───────────────────────── */

export async function listPaket(f: { kategoriId?: string; search?: string; aktif?: string; page?: string }) {
  const db = await getDb();
  const page = halaman(f.page);
  const conds = [];
  if (f.kategoriId) conds.push(eq(paket.kategoriId, Number(f.kategoriId)));
  if (f.search) conds.push(ilike(paket.nama, `%${f.search}%`));
  if (f.aktif === '1') conds.push(eq(paket.aktif, true));
  if (f.aktif === '0') conds.push(eq(paket.aktif, false));
  const where = conds.length ? and(...conds) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(paket).where(where);
  const rows = await db
    .select({ paket, kategori })
    .from(paket)
    .innerJoin(kategori, eq(paket.kategoriId, kategori.id))
    .where(where)
    .orderBy(desc(paket.createdAt), desc(paket.id))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);

  return {
    rows: rows.map((r) => ({ ...r.paket, kategori: r.kategori })),
    total,
    page,
    perPage: PER_PAGE,
    lastPage: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function getPaketById(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(paket).where(eq(paket.id, id)).limit(1);
  return row ?? null;
}

/* ───────────────────────── Admin: pemesanan ───────────────────────── */

/** Awal/akhir hari WIB sebagai timestamp */
const awalHari = (iso: string) => new Date(`${iso}T00:00:00+07:00`);
const akhirHari = (iso: string) => new Date(`${iso}T23:59:59.999+07:00`);

export async function listPemesanan(f: { status?: string; search?: string; dateFrom?: string; dateTo?: string; page?: string }) {
  const db = await getDb();
  const page = halaman(f.page);
  const conds = [];
  if (f.status) conds.push(eq(pemesanan.status, f.status as StatusPemesanan));
  if (f.search) {
    const q = `%${f.search}%`;
    conds.push(or(ilike(pemesanan.kode, q), ilike(pemesanan.nama, q), ilike(pemesanan.whatsapp, q))!);
  }
  if (f.dateFrom) conds.push(gte(pemesanan.createdAt, awalHari(f.dateFrom)));
  if (f.dateTo) conds.push(lte(pemesanan.createdAt, akhirHari(f.dateTo)));
  const where = conds.length ? and(...conds) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(pemesanan).where(where);
  const rows = await db
    .select({ pemesanan, paket })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .where(where)
    .orderBy(desc(pemesanan.createdAt), desc(pemesanan.id))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);

  return {
    rows: rows.map((r) => ({ ...r.pemesanan, paket: r.paket })),
    total,
    page,
    perPage: PER_PAGE,
    lastPage: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function getPemesananAdmin(id: number) {
  const db = await getDb();
  const [row] = await db
    .select({ pemesanan, paket, kategori })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .innerJoin(kategori, eq(paket.kategoriId, kategori.id))
    .where(eq(pemesanan.id, id))
    .limit(1);
  return row ? { ...row.pemesanan, paket: { ...row.paket, kategori: row.kategori } } : null;
}

/* ───────────────────────── Admin: dashboard ───────────────────────── */

// konstanta tepercaya (bukan input user) -> inline agar SELECT & GROUP BY identik
const TZ_SQL = sql.raw(`'${TZ}'`);
const pendapatanExpr = sql<number>`COALESCE(${pemesanan.hargaFinal}, ${pemesanan.estimasiTotal})`;
const statusPendapatan = inArray(pemesanan.status, ['dikonfirmasi', 'selesai']);

export async function getDashboard(start: string, end: string) {
  const db = await getDb();
  const rentang = and(gte(pemesanan.createdAt, awalHari(start)), lte(pemesanan.createdAt, akhirHari(end)));

  const [ringkas] = await db
    .select({
      total: count(),
      pendapatan: sql<number>`COALESCE(SUM(CASE WHEN ${pemesanan.status} IN ('dikonfirmasi','selesai') THEN ${pendapatanExpr} ELSE 0 END), 0)`,
      baru: sql<number>`COUNT(*) FILTER (WHERE ${pemesanan.status} = 'baru')`,
      selesai: sql<number>`COUNT(*) FILTER (WHERE ${pemesanan.status} = 'selesai')`,
    })
    .from(pemesanan)
    .where(rentang);

  // Konfirmasi WhatsApp korporat (tanpa form) dicatat di tabel klik_wa
  const [kor] = await db
    .select({ total: count() })
    .from(klikWa)
    .where(and(gte(klikWa.createdAt, awalHari(start)), lte(klikWa.createdAt, akhirHari(end))));

  // Konfirmasi WA per bulan (12 bulan, WIB): family + korporat
  const bulanFam = sql<string>`to_char(${pemesanan.createdAt} AT TIME ZONE ${TZ_SQL}, 'YYYY-MM')`;
  const bulanKor = sql<string>`to_char(${klikWa.createdAt} AT TIME ZONE ${TZ_SQL}, 'YYYY-MM')`;
  const batas = (kol: typeof pemesanan.createdAt | typeof klikWa.createdAt) =>
    gte(kol, sql`(date_trunc('month', now() AT TIME ZONE ${TZ_SQL}) - interval '11 months') AT TIME ZONE ${TZ_SQL}`);
  const waFamily = await db.select({ bulan: bulanFam, total: count() }).from(pemesanan).where(batas(pemesanan.createdAt)).groupBy(bulanFam);
  const waKorporat = await db.select({ bulan: bulanKor, total: count() }).from(klikWa).where(batas(klikWa.createdAt)).groupBy(bulanKor);

  // Pendapatan 12 bulan terakhir (per bulan WIB)
  const bulanSql = sql<string>`to_char(${pemesanan.createdAt} AT TIME ZONE ${TZ_SQL}, 'YYYY-MM')`;
  const bulanan = await db
    .select({ bulan: bulanSql, total: sql<number>`COALESCE(SUM(${pendapatanExpr}), 0)` })
    .from(pemesanan)
    .where(and(statusPendapatan, gte(pemesanan.createdAt, sql`(date_trunc('month', now() AT TIME ZONE ${TZ_SQL}) - interval '11 months') AT TIME ZONE ${TZ_SQL}`)))
    .groupBy(bulanSql);

  const perKategori = await db
    .select({ nama: kategori.nama, total: count() })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .innerJoin(kategori, eq(paket.kategoriId, kategori.id))
    .where(rentang)
    .groupBy(kategori.id, kategori.nama);

  const terlaris = await db
    .select({ nama: paket.nama, total: sql<number>`SUM(${pemesanan.jumlah})` })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .where(rentang)
    .groupBy(paket.id, paket.nama)
    .orderBy(desc(sql`SUM(${pemesanan.jumlah})`))
    .limit(5);

  const terbaru = await db
    .select({ pemesanan, paket })
    .from(pemesanan)
    .innerJoin(paket, eq(pemesanan.paketId, paket.id))
    .orderBy(desc(pemesanan.createdAt), desc(pemesanan.id))
    .limit(10);

  return {
    total: Number(ringkas.total),
    pendapatan: Number(ringkas.pendapatan),
    baru: Number(ringkas.baru),
    selesai: Number(ringkas.selesai),
    korporat: Number(kor.total),
    waBulanan: {
      family: waFamily.map((b) => ({ bulan: b.bulan, total: Number(b.total) })),
      korporat: waKorporat.map((b) => ({ bulan: b.bulan, total: Number(b.total) })),
    },
    bulanan: bulanan.map((b) => ({ bulan: b.bulan, total: Number(b.total) })),
    perKategori: perKategori.map((k) => ({ nama: k.nama, total: Number(k.total) })),
    terlaris: terlaris.map((p) => ({ nama: p.nama, total: Number(p.total) })),
    terbaru: terbaru.map((r) => ({ ...r.pemesanan, paket: r.paket })),
  };
}
