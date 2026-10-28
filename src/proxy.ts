import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'aboet_admin';

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-only-secret-ganti-di-production');
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secretKey());
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (pathname === '/admin/login') {
    return valid ? NextResponse.redirect(new URL('/admin', req.url)) : NextResponse.next();
  }
  if (!valid) return NextResponse.redirect(new URL('/admin/login', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
