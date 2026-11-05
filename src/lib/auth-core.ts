import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { SESSION_DURATION_SECONDS, type AuthSettings } from './auth-core-types';
export { SESSION_COOKIE, SESSION_DURATION_SECONDS, type AuthSettings } from './auth-core-types';

export function isConfigured(settings: AuthSettings): boolean {
  return settings.accessCode.length >= 8 && settings.sessionSecret.length >= 32;
}

export function verifyAccessCode(candidate: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(candidate), digest(expected));
}

function signature(payload: string, settings: AuthSettings): Buffer {
  // Rotating either credential invalidates every previous session.
  const key = createHmac('sha256', settings.sessionSecret)
    .update(`her-universe\0${settings.accessCode}`, 'utf8')
    .digest();
  return createHmac('sha256', key).update(payload, 'utf8').digest();
}

export function createSession(settings: AuthSettings, now = Date.now()): string {
  if (!isConfigured(settings)) throw new Error('Private access is not configured.');
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      exp: Math.floor(now / 1000) + SESSION_DURATION_SECONDS,
      nonce: randomBytes(24).toString('base64url'),
    }),
  ).toString('base64url');
  return `${payload}.${signature(payload, settings).toString('base64url')}`;
}

export function verifySession(
  token: string | undefined,
  settings: AuthSettings,
  now = Date.now(),
): boolean {
  if (!token || token.length > 1024 || !isConfigured(settings)) return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return false;
  const [payload, encodedSignature] = parts;
  try {
    const actual = Buffer.from(encodedSignature, 'base64url');
    const expected = signature(payload, settings);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || typeof data !== 'object') return false;
    const session = data as { v?: unknown; exp?: unknown; nonce?: unknown };
    return (
      session.v === 1 &&
      typeof session.exp === 'number' &&
      Number.isInteger(session.exp) &&
      session.exp > Math.floor(now / 1000) &&
      session.exp <= Math.floor(now / 1000) + SESSION_DURATION_SECONDS &&
      typeof session.nonce === 'string' &&
      session.nonce.length >= 24
    );
  } catch {
    return false;
  }
}
