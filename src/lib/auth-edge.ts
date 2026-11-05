import { SESSION_DURATION_SECONDS, type AuthSettings } from './auth-core-types';

// Web Crypto implementation for Edge middleware. No private configuration enters
// the browser bundle; the Node server remains the authority for the root and media.
export async function verifyEdgeSession(
  token: string | undefined,
  settings: AuthSettings,
  now = Date.now(),
): Promise<boolean> {
  if (
    !token ||
    token.length > 1024 ||
    settings.accessCode.length < 8 ||
    settings.sessionSecret.length < 32
  )
    return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return false;
  try {
    const [payload, supplied] = parts;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(settings.sessionSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const derived = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`her-universe\0${settings.accessCode}`),
    );
    const signingKey = await crypto.subtle.importKey(
      'raw',
      derived,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const fromBase64Url = (text: string) =>
      Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (character) =>
        character.charCodeAt(0),
      );
    if (
      !(await crypto.subtle.verify(
        'HMAC',
        signingKey,
        fromBase64Url(supplied),
        encoder.encode(payload),
      ))
    )
      return false;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      v?: number;
      exp?: number;
      nonce?: string;
    };
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
