import assert from 'node:assert/strict';
import test from 'node:test';
import { fateEndings, fateScenes, getFateEnding, hiddenStars, quizOutcome } from '../src/lib/games';

test('quiz outcomes distinguish full score, a connection, and a new beginning', () => {
  assert.equal(quizOutcome(3, 3), 'perfect');
  assert.equal(quizOutcome(2, 3), 'close');
  assert.equal(quizOutcome(1, 3), 'beginning');
  assert.equal(quizOutcome(0, 0), 'beginning');
});

test('fate map has three reachable endings and resolves a tie using the final choice', () => {
  assert.equal(getFateEnding([0, 0, 2]), 'explorer');
  assert.equal(getFateEnding([1, 1, 0]), 'keeper');
  assert.equal(getFateEnding([2, 0, 2]), 'dreamer');
  assert.equal(getFateEnding([0, 1, 2]), 'dreamer');
  assert.equal(getFateEnding([1, 2, 0]), 'explorer');
  for (const a of [0, 1, 2])
    for (const b of [0, 1, 2])
      for (const c of [0, 1, 2]) {
        assert.ok(fateEndings[getFateEnding([a, b, c])]);
      }
  assert.equal(fateScenes.length, 3);
});

test('all seven stars fit inside touch-safe scene boundaries and have distinct identities', () => {
  assert.equal(hiddenStars.length, 7);
  assert.equal(new Set(hiddenStars.map((s) => s.id)).size, 7);
  for (const star of hiddenStars) {
    assert.ok(star.x >= 8 && star.x <= 92);
    assert.ok(star.y >= 8 && star.y <= 92);
    assert.ok(star.hint && star.text);
  }
});
