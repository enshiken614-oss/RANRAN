import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSession,
  isConfigured,
  SESSION_DURATION_SECONDS,
  verifyAccessCode,
  verifySession,
  type AuthSettings,
} from '../src/lib/auth-core';
import { verifyEdgeSession } from '../src/lib/auth-edge';
import { isSameOriginRequest } from '../src/lib/auth-origin';

test('same-origin fallback uses actual Host when Next binds to 0.0.0.0', () => {
  const requestUrl = 'http://0.0.0.0:3101/api/session';
  assert.equal(isSameOriginRequest('http://127.0.0.1:3101', requestUrl, '127.0.0.1:3101'), true);
  assert.equal(isSameOriginRequest('http://localhost:3101', requestUrl, 'localhost:3101'), true);
  assert.equal(isSameOriginRequest('https://outside.example', requestUrl, '127.0.0.1:3101'), false);
  assert.equal(isSameOriginRequest('http://127.0.0.1:3100', requestUrl, '127.0.0.1:3101'), false);
});

test('canonical URL wins; missing, malformed and injected authorities fail closed', () => {
  const requestUrl = 'http://0.0.0.0:3101/api/session';
  assert.equal(
    isSameOriginRequest('https://our.example', requestUrl, 'localhost:3101', 'https://our.example'),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      'http://localhost:3101',
      requestUrl,
      'localhost:3101',
      'https://our.example',
    ),
    false,
  );
  assert.equal(isSameOriginRequest(null, requestUrl, 'localhost:3101'), false);
  assert.equal(isSameOriginRequest('null', requestUrl, 'localhost:3101'), false);
  assert.equal(
    isSameOriginRequest('http://localhost:3101', requestUrl, 'evil.example@localhost:3101'),
    false,
  );
  assert.equal(
    isSameOriginRequest('http://localhost:3101', requestUrl, 'localhost:3101/path'),
    false,
  );
  assert.equal(
    isSameOriginRequest('http://localhost:3101', requestUrl, 'localhost:3101\\evil'),
    false,
  );
  assert.equal(
    isSameOriginRequest('http://localhost:3101', requestUrl, 'localhost:wrong-port'),
    false,
  );
  assert.equal(
    isSameOriginRequest('https://our.example', requestUrl, 'localhost:3101', 'not-a-url'),
    false,
  );
});

const settings: AuthSettings = {
  accessCode: 'test-access-code-only',
  sessionSecret: 'test-session-secret-of-at-least-32-characters',
};
const now = Date.UTC(2026, 10, 5, 3, 0);

test('private authentication fails closed with missing or short credentials', () => {
  assert.equal(isConfigured({ accessCode: '', sessionSecret: '' }), false);
  assert.equal(
    isConfigured({ accessCode: '1234567', sessionSecret: settings.sessionSecret }),
    false,
  );
  assert.equal(isConfigured({ accessCode: settings.accessCode, sessionSecret: 'short' }), false);
  assert.equal(verifySession(undefined, settings, now), false);
  assert.throws(() => createSession({ accessCode: '', sessionSecret: '' }, now));
});

test('correct code and signed session work, unrelated code does not', () => {
  assert.equal(verifyAccessCode(settings.accessCode, settings.accessCode), true);
  assert.equal(verifyAccessCode('wrong-code', settings.accessCode), false);
  const token = createSession(settings, now);
  assert.equal(verifySession(token, settings, now), true);
});

test('sessions expire exactly at the seven-day boundary', () => {
  const token = createSession(settings, now);
  assert.equal(verifySession(token, settings, now + SESSION_DURATION_SECONDS * 1000 - 1), true);
  assert.equal(verifySession(token, settings, now + SESSION_DURATION_SECONDS * 1000), false);
});

test('tampering, malformed payloads and credential rotations invalidate sessions', () => {
  const token = createSession(settings, now);
  const [payload, signature] = token.split('.');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  data.exp += 86400;
  const altered = Buffer.from(JSON.stringify(data)).toString('base64url') + '.' + signature;
  for (const candidate of [altered, 'invalid', token + '.extra', '.', 'x'.repeat(1025)])
    assert.equal(verifySession(candidate, settings, now), false);
  assert.equal(verifySession(token, { ...settings, accessCode: 'a-new-access-code' }, now), false);
  assert.equal(
    verifySession(
      token,
      { ...settings, sessionSecret: 'a-new-session-secret-longer-than-32-characters' },
      now,
    ),
    false,
  );
});

test('edge middleware agrees with the Node server on valid, expired and altered cookies', async () => {
  const token = createSession(settings, now);
  assert.equal(await verifyEdgeSession(token, settings, now), true);
  assert.equal(
    await verifyEdgeSession(token, settings, now + SESSION_DURATION_SECONDS * 1000),
    false,
  );
  assert.equal(await verifyEdgeSession(token.slice(0, -1), settings, now), false);
  assert.equal(
    await verifyEdgeSession(token, { ...settings, accessCode: 'rotated-access-code' }, now),
    false,
  );
  assert.equal(await verifyEdgeSession(undefined, settings, now), false);
});
