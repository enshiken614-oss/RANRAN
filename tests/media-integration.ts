/**
 * Production integration check. Run against a server with temporary QA-only
 * credentials: QA_ACCESS_CODE=... node --import tsx tests/media-integration.ts
 * Optional QA_BASE_URL defaults to http://127.0.0.1:3100.
 * Creates harmless synthetic fixtures only, and always removes them afterwards.
 */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function main() {
  const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3100';
  const code = process.env.QA_ACCESS_CODE;
  if (!code) throw new Error('Set QA_ACCESS_CODE to a temporary test server credential.');
  const name = `qa-media-${randomBytes(8).toString('hex')}`;
  const fixture = path.join(process.cwd(), 'private-media', name);
  const outside = await mkdtemp(path.join(os.tmpdir(), 'universe-media-'));
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR4sAAAAASUVORK5CYII=',
    'base64',
  );
  const video = Buffer.from(Array.from({ length: 1024 }, (_, index) => index % 256));
  let checks = 0;
  function ok(label: string) {
    checks++;
    console.log(`PASS ${label}`);
  }
  try {
    await mkdir(fixture, { recursive: true });
    await writeFile(path.join(fixture, 'pixel.png'), png);
    await writeFile(path.join(fixture, 'sample.mp4'), video);
    await writeFile(path.join(fixture, 'blocked.txt'), 'harmless integration fixture');
    await writeFile(path.join(outside, 'outside.png'), png);
    await symlink(path.join(outside, 'outside.png'), path.join(fixture, 'escape.png'));
    await symlink(outside, path.join(fixture, 'escape-directory'));
    const media = `${base}/api/media/${name}`;
    const anonymous = await fetch(`${media}/pixel.png`);
    assert.equal(anonymous.status, 401);
    ok('anonymous private image denied (401)');
    const forged = await fetch(`${media}/pixel.png`, {
      headers: { Cookie: 'her-universe-session=forged.invalid' },
    });
    assert.equal(forged.status, 401);
    ok('forged session denied (401)');
    const login = await fetch(`${base}/api/session`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get('set-cookie') ?? '';
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /Secure/i);
    assert.match(setCookie, /SameSite=strict/i);
    const cookie = setCookie.split(';')[0];
    assert.ok(cookie);
    ok('login succeeds; cookie HttpOnly, Secure and SameSite Strict');
    const headers = { Cookie: cookie };
    const image = await fetch(`${media}/pixel.png`, { headers });
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.match(image.headers.get('cache-control') ?? '', /private.*no-store/);
    assert.equal(image.headers.get('x-content-type-options'), 'nosniff');
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    ok('authenticated image bytes and private cache headers correct');
    const fullVideo = await fetch(`${media}/sample.mp4`, { headers });
    assert.equal(fullVideo.status, 200);
    assert.equal(fullVideo.headers.get('content-type'), 'video/mp4');
    assert.deepEqual(Buffer.from(await fullVideo.arrayBuffer()), video);
    ok('authenticated full video bytes correct');
    for (const [range, start, end] of [
      ['bytes=10-29', 10, 29],
      ['bytes=-10', 1014, 1023],
      ['bytes=1000-', 1000, 1023],
    ] as const) {
      const response = await fetch(`${media}/sample.mp4`, {
        headers: { ...headers, Range: range },
      });
      assert.equal(response.status, 206);
      assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/1024`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), video.subarray(start, end + 1));
      ok(`video ${range} returns correct range (206)`);
    }
    for (const range of ['bytes=2048-3000', 'bytes=30-10', 'bytes=0-1,4-5', 'bytes=-']) {
      const response = await fetch(`${media}/sample.mp4`, {
        headers: { ...headers, Range: range },
      });
      assert.equal(response.status, 416);
      ok(`invalid range ${range} rejected (416)`);
    }
    const missing = await fetch(`${media}/missing.png`, { headers });
    assert.equal(missing.status, 404);
    ok('missing image returns 404');
    const extension = await fetch(`${media}/blocked.txt`, { headers });
    assert.equal(extension.status, 415);
    ok('unsupported extension rejected (415)');
    for (const suffix of [
      'escape.png',
      'escape-directory/outside.png',
      '%2e%2e%2fescape.png',
      '%5c..%5coutside.png',
    ]) {
      const response = await fetch(`${media}/${suffix}`, { headers });
      assert.ok(
        [400, 403, 404].includes(response.status),
        `Unexpected traversal response: ${response.status}`,
      );
      assert.notDeepEqual(Buffer.from(await response.arrayBuffer()), png);
      ok(`path escape denied (${response.status})`);
    }
    const crossOrigin = await fetch(`${base}/api/session`, {
      method: 'DELETE',
      headers: { ...headers, Origin: 'https://untrusted.invalid' },
    });
    assert.equal(crossOrigin.status, 403);
    ok('cross-origin logout denied (403)');
    const logout = await fetch(`${base}/api/session`, {
      method: 'DELETE',
      headers: { ...headers, Origin: base },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get('set-cookie') ?? '', /Max-Age=0/i);
    ok('logout expires session cookie');
    console.log(`Media and session integration: ${checks} checks passed.`);
  } finally {
    await rm(fixture, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
    console.log('Synthetic private-media and external fixtures removed.');
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Media integration failed');
  process.exitCode = 1;
});
