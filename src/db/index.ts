import { mkdirSync } from 'node:fs';
import postgres from 'postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type DB = PgDatabase<any, typeof schema>;

const globalForDb = globalThis as unknown as { __abtDb?: Promise<DB> };

/**
 * Production / Vercel : DATABASE_URL (Postgres apa saja, pakai connection string pooled).
 * Development lokal   : tanpa DATABASE_URL → PGlite (Postgres tertanam, data di folder .data/).
 */
async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL;

  if (url) {
    // prepare:false → kompatibel dengan pooler (Neon/Supabase pgbouncer)
    const client = postgres(url, { prepare: false, max: 1, idle_timeout: 20 });
    return drizzlePg(client, { schema }) as unknown as DB;
  }

  if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && !process.env.ALLOW_PGLITE) {
    throw new Error('DATABASE_URL belum diatur. Isi di Vercel → Settings → Environment Variables.');
  }

  // Specifier disusun dinamis supaya bundler/tracer Vercel tidak ikut membundel PGlite
  const pgliteDriver = ['drizzle-orm', 'pglite'].join('/');
  const pglitePkg = ['@electric-sql', 'pglite'].join('/');
  const { PGlite } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pglitePkg);
  const { drizzle } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pgliteDriver);
  const dir = process.env.PGLITE_DIR ?? '.data/pglite';
  mkdirSync(dir, { recursive: true }); // PGlite tidak membuat folder induk (.data) sendiri, terutama di Windows
  return drizzle(new PGlite(dir), { schema }) as unknown as DB;
}

export function getDb(): Promise<DB> {
  if (!globalForDb.__abtDb) globalForDb.__abtDb = connect();
  return globalForDb.__abtDb;
}

export { schema };
