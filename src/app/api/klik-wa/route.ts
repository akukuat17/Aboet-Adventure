import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

/** Mencatat klik tombol "Hubungi via WhatsApp" (korporat). Dipanggil lewat sendBeacon. */
export async function POST(req: Request) {
  let slug = '';
  try {
    const body = await req.json();
    slug = String(body?.slug ?? '').slice(0, 255);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const db = await getDb();
  const [p] = await db
    .select({ id: schema.paket.id })
    .from(schema.paket)
    .where(and(eq(schema.paket.slug, slug), eq(schema.paket.aktif, true)))
    .limit(1);
  if (!p) return NextResponse.json({ ok: false }, { status: 404 });

  await db.insert(schema.klikWa).values({ paketId: p.id, tipe: 'korporat' });
  return NextResponse.json({ ok: true });
}
