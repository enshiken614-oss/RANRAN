import { NextRequest, NextResponse } from 'next/server';
import { verifyEdgeSession } from '@/lib/auth-edge';
import { SESSION_COOKIE } from '@/lib/auth-core-types';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const demo = process.env.NODE_ENV === 'development' && !process.env.UNIVERSE_ACCESS_CODE;
  // Root has a server-side content gate. Its anonymous HTML contains only the
  // generic entry screen; anonymous RSC requests go through the identical gate.
  const entry = pathname === '/' || pathname === '/api/session';
  const publicAsset =
    pathname.startsWith('/_next/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname.startsWith('/art/') ||
    pathname.startsWith('/fonts/');
  const authenticated =
    demo ||
    entry ||
    publicAsset ||
    (await verifyEdgeSession(request.cookies.get(SESSION_COOKIE)?.value, {
      accessCode: process.env.UNIVERSE_ACCESS_CODE ?? '',
      sessionSecret: process.env.UNIVERSE_SESSION_SECRET ?? '',
    }));
  const response = authenticated
    ? NextResponse.next()
    : new NextResponse('Private universe. Please enter through the home page.', { status: 401 });
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (!publicAsset) response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/((?!_next/webpack-hmr).*)'] };
