/** Browser Origin must match the canonical site, or the actual HTTP Host. */
export function isSameOriginRequest(
  origin: string | null,
  requestUrl: string,
  host: string | null,
  canonicalUrl?: string,
): boolean {
  if (!origin) return false;
  try {
    const url = new URL(requestUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const authority = host || url.host;
    // A Host header is an authority, never a URL, path, or userinfo.
    if (/[\s/\\?#@]/.test(authority)) return false;
    const expected = new URL(canonicalUrl || `${url.protocol}//${authority}`);
    if (!['http:', 'https:'].includes(expected.protocol)) return false;
    return new URL(origin).origin === expected.origin;
  } catch {
    return false;
  }
}
