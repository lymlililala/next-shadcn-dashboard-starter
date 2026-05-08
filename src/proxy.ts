import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';
const LOGIN_PATH = '/admin/login';
const ADMIN_ROOT = '/admin';

/**
 * 验证 session token（时间恒定比较，防止时序攻击）
 */
function verifyToken(token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [payload, sig] = decoded.split('|');
    if (!payload || !sig) return false;
    const expected = Buffer.from(secret + payload)
      .toString('base64url')
      .slice(0, 16);
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只处理 /admin 路由
  if (!pathname.startsWith(ADMIN_ROOT)) {
    return NextResponse.next();
  }

  // 登录页不需要认证
  if (pathname === LOGIN_PATH || pathname.startsWith(LOGIN_PATH + '/')) {
    return NextResponse.next();
  }

  // API 认证路由不需要认证
  if (pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  const sessionCookie = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!verifyToken(sessionCookie, secret)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
