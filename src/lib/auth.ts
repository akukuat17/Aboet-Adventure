import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'aboet_admin';

export type AdminSession = { id: number; nama: string; email: string };

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET belum diatur.');
    return new TextEncoder().encode('dev-only-secret-ganti-di-production');
  }
  return new TextEncoder().encode(s);
}

export async function buatSesi(admin: AdminSession, ingat: boolean): Promise<void> {
  const token = await new SignJWT({ ...admin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ingat ? '30d' : '12h')
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(ingat ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
}

export async function hapusSesi(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSesi(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { id: Number(payload.id), nama: String(payload.nama), email: String(payload.email) };
  } catch {
    return null;
  }
}

/** Dipanggil di setiap halaman & action admin (lapisan kedua setelah proxy.ts) */
export async function wajibAdmin(): Promise<AdminSession> {
  const s = await getSesi();
  if (!s) redirect('/admin/login');
  return s;
}
