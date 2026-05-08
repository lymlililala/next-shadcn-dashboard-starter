import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 小时

/**
 * 生成 session token
 * 格式: base64url(payload|signature)
 * payload: username:timestamp
 * signature: base64url(secret + payload).slice(0,16)
 */
function createToken(username: string, secret: string): string {
  const payload = `${username}:${Date.now()}`;
  const sig = Buffer.from(secret + payload)
    .toString('base64url')
    .slice(0, 16);
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

/** 恒定时间字符串比较，防止时序攻击 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // 仍然执行比较以保证恒定时间
    let diff = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// POST /api/admin/auth — 登录
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const { username, password } = body;

    const expectedUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
    const secret = process.env.ADMIN_SESSION_SECRET ?? '';

    if (!username || !password) {
      return NextResponse.json({ error: '请输入账号和密码' }, { status: 400 });
    }

    const usernameOk = safeEqual(username, expectedUsername);
    const passwordOk = safeEqual(password, expectedPassword);

    if (!usernameOk || !passwordOk) {
      // 添加延迟防止暴力破解
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
    }

    const token = createToken(username, secret);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });

    return response;
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/admin/auth — 登出
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
