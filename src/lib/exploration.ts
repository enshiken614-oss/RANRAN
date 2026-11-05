import type { SecretRule } from '@/config/ourStory';
export interface Exploration {
  visited: string[];
  games: string[];
  starClicks: number;
  memories: string[];
}
export const emptyExploration: Exploration = {
  visited: [],
  games: [],
  starClicks: 0,
  memories: [],
};
export function parseExploration(value: unknown): Exploration {
  if (!value || typeof value !== 'object') return { ...emptyExploration };
  const v = value as Record<string, unknown>;
  const strings = (a: unknown) =>
    Array.isArray(a)
      ? Array.from(new Set(a.filter((s): s is string => typeof s === 'string')))
      : [];
  return {
    visited: strings(v.visited),
    games: strings(v.games),
    memories: strings(v.memories),
    starClicks:
      typeof v.starClicks === 'number' && Number.isFinite(v.starClicks)
        ? Math.max(0, v.starClicks)
        : 0,
  };
}
export function secretUnlocked(
  rule: SecretRule,
  progress: Exploration,
  anniversary = false,
): boolean {
  const target = typeof rule.target === 'number' ? rule.target : 0;
  switch (rule.trigger) {
    case 'star-clicks':
      return progress.starClicks >= (target || 5);
    case 'all-games':
      return progress.games.length >= (target || 3);
    case 'all-planets':
      return progress.visited.length >= (target || 6);
    case 'anniversary':
      return anniversary;
    default:
      return false;
  }
}
export function finaleUnlocked(progress: Exploration): boolean {
  return (
    progress.visited.length >= 6 &&
    progress.games.length >= 3 &&
    progress.starClicks >= 5 &&
    progress.memories.length > 0
  );
}
