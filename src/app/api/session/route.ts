import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authSettings } from '@/lib/auth';
import { isSameOriginRequest } from '@/lib/auth-origin';
import {
  createSession,
  isConfigured,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  verifyAccessCode,
} from '@/lib/auth-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// One process / instance. Put a durable shared limiter in front of this endpoint
// before exposing an installation to significant or untrusted traffic.
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 8;

function json(body: object, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function sameOrigin(request: NextRequest): boolean {
  // The bound hostname (0.0.0.0) can differ from the browser's address.
  return isSameOriginRequest(
    request.headers.get('origin'),
    request.url,
    request.headers.get('host'),
    process.env.UNIVERSE_SITE_URL,
  );
}

function clientKey(request: NextRequest): string {
  const address =
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'shared-instance';
  return createHash('sha256').update(address).digest('hex');
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: '请从本站重新打开入口。' }, 403);
  const settings = authSettings();
  if (!isConfigured(settings)) {
    return json({ error: '私人宇宙尚未开启。请先在服务器配置访问口令和会话密钥。' }, 503);
  }
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  // Bound memory even if an upstream proxy accepts arbitrary forwarded addresses.
  if (attempts.size >= 10000)
    return json({ error: '入口暂时繁忙，请稍后再试。' }, 429, { 'Retry-After': '60' });
  const key = clientKey(request);
  const previous = attempts.get(key);
  if (previous && previous.count >= LIMIT) {
    return json({ error: '尝试次数较多，请在 15 分钟后重试。' }, 429, {
      'Retry-After': String(Math.ceil((previous.until - now) / 1000)),
    });
  }
  const length = Number(request.headers.get('content-length') || '0');
  if (length > 4096) return json({ error: '请求内容过长。' }, 413);
  let code: unknown;
  try {
    const body = await request.text();
    if (body.length > 4096) return json({ error: '请求内容过长。' }, 413);
    code = (JSON.parse(body) as { code?: unknown }).code;
  } catch {
    return json({ error: '请填写访问口令。' }, 400);
  }
  if (
    typeof code !== 'string' ||
    code.length > 512 ||
    !verifyAccessCode(code, settings.accessCode)
  ) {
    attempts.set(key, {
      count: (previous?.count ?? 0) + 1,
      until: previous?.until ?? now + WINDOW_MS,
    });
    return json({ error: '这把钥匙还没有找到对应的星门，请再试一次。' }, 401);
  }
  attempts.delete(key);
  const response = json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSession(settings), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: '请求来源无效。' }, 403);
  const response = json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
