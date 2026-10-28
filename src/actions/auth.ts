'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/db';
import { buatSesi, hapusSesi } from '@/lib/auth';

export type LoginState = { error?: string; email?: string } | null;

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const ingat = fd.get('remember') === 'on';

  if (!email || !password) return { error: 'Email dan password wajib diisi.', email };

  const db = await getDb();
  const [admin] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email)).limit(1);
  const cocok = admin ? await bcrypt.compare(password, admin.password) : false;
  if (!admin || !cocok) {
    await new Promise((r) => setTimeout(r, 500)); // perlambat tebak-tebakan password
    return { error: 'Email atau password salah.', email };
  }

  await buatSesi({ id: admin.id, nama: admin.nama, email: admin.email }, ingat);
  redirect('/admin');
}

export async function logout() {
  await hapusSesi();
  redirect('/admin/login');
}
