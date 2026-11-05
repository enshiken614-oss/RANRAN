import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLocalId } from '../src/lib/localId';

test('LAN HTTP preview creates distinct valid local IDs without randomUUID', () => {
  const insecureContextCrypto = {
    getRandomValues: (bytes: Uint8Array) => webcrypto.getRandomValues(bytes),
  };
  const ids = Array.from({ length: 100 }, () => createLocalId(insecureContextCrypto));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
});

test('secure contexts use their native randomUUID implementation', () => {
  const expected = '865256a0-c667-45e5-b087-f19a8819428c';
  assert.equal(
    createLocalId({
      randomUUID: () => expected,
      getRandomValues: () => {
        throw new Error('Native UUID path should not request fallback bytes');
      },
    }),
    expected,
  );
});
