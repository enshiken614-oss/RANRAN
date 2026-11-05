import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyExploration,
  finaleUnlocked,
  parseExploration,
  secretUnlocked,
} from '../src/lib/exploration';

test('corrupt saved progress is rejected or normalized without crashing', () => {
  assert.deepEqual(parseExploration(null), emptyExploration);
  assert.deepEqual(
    parseExploration({ visited: ['memory', 'memory', 4], games: 'wrong', starClicks: -7 }),
    { visited: ['memory'], games: [], starClicks: 0, memories: [] },
  );
});
test('configured secret conditions require their exact progress thresholds', () => {
  const rule = {
    id: 'custom',
    trigger: 'star-clicks' as const,
    target: 7,
    reward: { title: 'x', message: 'y' },
  };
  assert.equal(secretUnlocked(rule, { ...emptyExploration, starClicks: 6 }), false);
  assert.equal(secretUnlocked(rule, { ...emptyExploration, starClicks: 7 }), true);
  assert.equal(secretUnlocked({ ...rule, trigger: 'anniversary' }, emptyExploration, false), false);
  assert.equal(secretUnlocked({ ...rule, trigger: 'anniversary' }, emptyExploration, true), true);
});
test('final constellation requires exploration, games, memory and hidden star together', () => {
  const progress = {
    visited: ['memory', 'time', 'game', 'letter', 'dream', 'secret'],
    games: ['quiz', 'stars', 'fate'],
    starClicks: 5,
    memories: ['explored'],
  };
  assert.equal(finaleUnlocked(progress), true);
  assert.equal(finaleUnlocked({ ...progress, games: ['quiz', 'stars'] }), false);
  assert.equal(finaleUnlocked({ ...progress, memories: [] }), false);
  assert.equal(finaleUnlocked({ ...progress, starClicks: 4 }), false);
});
