export type QuizOutcome = 'perfect' | 'close' | 'beginning';

export function quizOutcome(correct: number, total: number): QuizOutcome {
  if (total <= 0) return 'beginning';
  if (correct === total) return 'perfect';
  return correct / total >= 0.5 ? 'close' : 'beginning';
}

export type FateKind = 'explorer' | 'keeper' | 'dreamer';

/** A tie follows the last choice: your next step still matters. */
export function getFateEnding(choices: number[]): FateKind {
  if (choices.length === 0) return 'explorer';
  const counts = [0, 0, 0];
  for (const choice of choices) {
    if (Number.isInteger(choice) && choice >= 0 && choice < counts.length) counts[choice]++;
  }
  const max = Math.max(...counts);
  const last = choices.at(-1) ?? 0;
  const winner = counts[last] === max ? last : counts.indexOf(max);
  return (['explorer', 'keeper', 'dreamer'] as const)[winner] ?? 'explorer';
}

export const hiddenStars = [
  { id: 'a', x: 14, y: 25, hint: '左上方，月光没有照到的角落', text: '最初，宇宙还没有方向。' },
  {
    id: 'b',
    x: 38,
    y: 15,
    hint: '夜空的高处，薄薄的星云之间',
    text: '一颗星星，开始等待另一个名字。',
  },
  { id: 'c', x: 73, y: 30, hint: '右上方，远方行星的旁边', text: '它穿过漫长的夜，留下一条微光。' },
  {
    id: 'd',
    x: 88,
    y: 63,
    hint: '最右边，山丘与天空相遇的地方',
    text: '有些相遇，让距离有了意义。',
  },
  {
    id: 'e',
    x: 56,
    y: 54,
    hint: '画面的中央偏下，一小片安静的天空',
    text: '于是，散落的光开始彼此靠近。',
  },
  { id: 'f', x: 30, y: 74, hint: '左下方，山脊上方的暗处', text: '每一颗星，都记住了回家的路。' },
  {
    id: 'g',
    x: 10,
    y: 56,
    hint: '最左边，第一座山峰的上方',
    text: '星图终于完整。它的名字，叫「我们」。',
  },
] as const;

export const fateScenes = [
  {
    title: '如果我们在宇宙尽头相遇',
    text: '一座只停留一夜的车站，三班列车即将出发。你会邀请对方去哪里？',
    choices: [
      { title: '去还没有名字的星球', detail: '带上一点勇气，把未知写成地图。', symbol: '✦' },
      { title: '去月亮上的小小房间', detail: '关上世界的声音，慢慢说说话。', symbol: '☾' },
      { title: '去能看见明天的云海', detail: '把未来折成纸飞机，一起放飞。', symbol: '⌁' },
    ],
  },
  {
    title: '旅途中，时间忽然停止',
    text: '所有星星都停在半空。只有你们还能走动。你想留住什么？',
    choices: [
      { title: '一起走过的那段路', detail: '再远的地方，也可以并肩到达。', symbol: '✦' },
      { title: '此刻握住的那只手', detail: '一个平凡的瞬间，已经足够珍贵。', symbol: '☾' },
      { title: '还没说完的那个愿望', detail: '让没有发生的故事，继续生长。', symbol: '⌁' },
    ],
  },
  {
    title: '你们得到一颗空白星球',
    text: '它只允许许下一个愿望。你会让这颗星球长出什么？',
    choices: [
      { title: '通往所有远方的路', detail: '故事很长，我们慢慢出发。', symbol: '✦' },
      { title: '一盏一直亮着的灯', detail: '无论何时，都有一个可以回来的地方。', symbol: '☾' },
      { title: '一整片永不落幕的星空', detail: '让每一个明天，都值得一起期待。', symbol: '⌁' },
    ],
  },
] as const;

export const fateEndings: Record<
  FateKind,
  { title: string; subtitle: string; story: string; symbol: string }
> = {
  explorer: {
    title: '一起奔赴远方的人',
    subtitle: 'THE EXPLORERS',
    symbol: '✦',
    story:
      '在这个平行宇宙，你们收集日落、追逐极光，把陌生的地方慢慢走成了回忆。目的地会改变，身边的位置一直为彼此留着。',
  },
  keeper: {
    title: '彼此的归途',
    subtitle: 'THE KEEPERS',
    symbol: '☾',
    story:
      '在这个平行宇宙，你们拥有一间看得见月亮的房子。没有惊天动地的冒险，却把平凡的一天过成了想珍藏的永远。',
  },
  dreamer: {
    title: '为明天点灯的人',
    subtitle: 'THE DREAMERS',
    symbol: '⌁',
    story:
      '在这个平行宇宙，你们把愿望种成一片发光的森林。还没有到来的日子不再遥远，因为每个未来的故事里，都有彼此。',
  },
};
