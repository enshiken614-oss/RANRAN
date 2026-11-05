import 'server-only';
import { cookies } from 'next/headers';
import { isConfigured, SESSION_COOKIE, verifySession, type AuthSettings } from './auth-core';

export function authSettings(): AuthSettings {
  return {
    accessCode: process.env.UNIVERSE_ACCESS_CODE ?? '',
    sessionSecret: process.env.UNIVERSE_SESSION_SECRET ?? '',
  };
}

export function isDemoMode(): boolean {
  return process.env.NODE_ENV === 'development' && !process.env.UNIVERSE_ACCESS_CODE;
}

export function isAuthConfigured(): boolean {
  return isConfigured(authSettings());
}

export async function hasAccess(): Promise<boolean> {
  if (isDemoMode()) return true;
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value, authSettings());
}
