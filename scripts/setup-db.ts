import './env';
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL belum diset (isi di .env.local)');

  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    if (process.argv.includes('--reset')) {
      await sql.unsafe('DROP TABLE IF EXISTS pemesanan, paket, kategori, pengaturan, admin_users CASCADE');
      console.log('Semua tabel dihapus');
    }
    await sql.unsafe(readFileSync('db/schema.sql', 'utf8'));
    console.log('Skema siap');
  } finally {
    await sql.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
