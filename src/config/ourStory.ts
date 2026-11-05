import 'server-only';

/**
 * 她的宇宙 · 唯一的内容入口
 * 所有示例均明确标注，不代表你们的真实经历。把 null 日期改为 YYYY-MM-DD。
 * 私人照片请放在 private-media，再填写 /api/media/文件名，不要放 public。
 */
export interface Memory {
  id: string;
  /** 示例画作标记。换成真实回忆后删除或改为 false。 */
  isExample?: boolean;
  title: string;
  date: string | null;
  location: string;
  story: string;
  category: string;
  src: string;
  type: 'image' | 'video';
  poster?: string;
}

export interface Letter {
  id: string;
  title: string;
  preview: string;
  body: string;
  /** 信纸角落可发现的小留言，留空则不显示。 */
  hiddenNote?: string;
  /** 页面内的日期解锁是仪式感提示，并非服务端保密。请勿提前放入必须保密的正文。 */
  unlockDate: string | null;
  mood: 'moonlight' | 'dawn' | 'rose';
}

export interface Wish {
  id: string;
  /** 示例愿望标记。填写自己的愿望后删除或改为 false。 */
  isExample?: boolean;
  title: string;
  category: 'travel' | 'together' | 'small';
  completed: boolean;
}

export interface Anniversary {
  id: string;
  title: string;
  date: string | null;
  recurring: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** 正确选项的序号，从 0 开始。 */
  answer: number;
  explanation: string;
}

export interface SecretRule {
  id: string;
  trigger: 'star-clicks' | 'all-games' | 'all-planets' | 'anniversary';
  target: number | string | null;
  reward: { title: string; message: string };
}

export interface StoryConfig {
  identity: {
    herName: string;
    herNickname: string;
    myName: string;
    myNickname: string;
    startDate: string | null;
    herBirthday: string | null;
    myBirthday: string | null;
  };
  timezone: string;
  theme: { midnight: string; lavender: string; champagne: string };
  intro: { line: string; welcome: string };
  confession: string;
  music: { enabled: boolean };
  memories: Memory[];
  letters: Letter[];
  wishes: Wish[];
  anniversaries: Anniversary[];
  quiz: QuizQuestion[];
  secrets: SecretRule[];
}

export const ourStory: StoryConfig = {
  identity: {
    herName: '她',
    herNickname: '我的宇宙中心',
    myName: '我',
    myNickname: '你的同行者',
    startDate: null, // 例如 "2026-01-01"；请填写真实日期。
    herBirthday: null, // "MM-DD" 即可，不必填写出生年份。
    myBirthday: null,
  },
  timezone: 'Asia/Shanghai',
  theme: { midnight: '#090d18', lavender: '#b9a7d9', champagne: '#dbc5a0' },
  intro: {
    line: '宇宙有无数颗星星，但我只为你创造了这一颗。',
    welcome: '欢迎来到，属于你的宇宙。',
  },
  confession:
    '在无数个平行宇宙里，我依然会选择遇见你。\n\n[待填写：在这里，亲手写下只想对她说的最后一段话。]',
  // 开启后播放原创程序合成的轻柔环境音；不会自动播放。
  music: { enabled: true },
  memories: [
    {
      id: 'memory-moonlight',
      isExample: true,
      title: '把月光留在这里',
      date: null,
      location: '[待填写地点]',
      category: '日常碎片',
      src: '/art/moonlight.svg',
      type: 'image',
      story:
        '[示例画作 · 待替换]\n这里可以放一张你们的照片，写下那一天的小事、地点，和想珍藏的心情。',
    },
    {
      id: 'memory-horizon',
      isExample: true,
      title: '下一站，和你',
      date: null,
      location: '[待填写地点]',
      category: '一起远行',
      src: '/art/horizon.svg',
      type: 'image',
      story: '[示例画作 · 待替换]\n把一次真实的旅行放进这片风景，让记忆拥有自己的坐标。',
    },
    {
      id: 'memory-bloom',
      isExample: true,
      title: '平凡日子的光',
      date: null,
      location: '[待填写地点]',
      category: '日常碎片',
      src: '/art/bloom.svg',
      type: 'image',
      story:
        '[示例画作 · 待替换]\n不必等到特别的日子。一顿饭、一朵花、一句晚安，都值得被记住。请用你们真实的片段替换。',
    },
    {
      id: 'memory-tide',
      isExample: true,
      title: '时间会替我们收藏',
      date: null,
      location: '[待填写地点]',
      category: '心动瞬间',
      src: '/art/tide.svg',
      type: 'image',
      story:
        '[示例画作 · 待替换]\n为这一格填上你们真实的心动瞬间。支持继续添加图片或使用 type: video 放入视频回忆。',
    },
  ],
  letters: [
    {
      id: 'letter-first',
      title: '写给宇宙中心的你',
      preview: '有些话，想慢一点说给你听。',
      body: '亲爱的 [她的昵称]：\n\n[待填写：写下你想对她说的话。这里没有预设的爱情故事，只有等你亲手填满的一页。]\n\n[你的名字]',
      hiddenNote: '示例隐藏留言：愿你每次来到这里，都感到被认真在意。',
      unlockDate: null,
      mood: 'moonlight',
    },
    {
      id: 'letter-everyday',
      title: '关于往后每一个普通日子',
      preview: '把温柔写进平常，把喜欢留给你。',
      body: '[待填写：你期待怎样的一起生活？想怎样陪伴她度过普通的一天？把你的答案写在这里。]',
      unlockDate: null,
      mood: 'dawn',
    },
    {
      id: 'letter-future',
      title: '给未来的你',
      preview: '在未来某一天，再拆开这封信。',
      body: '[未来信件示例：请填写正文，并把 unlockDate 改为你选择的 YYYY-MM-DD。前端日期锁只用于仪式感；真正需要保密的未来内容不要提前写入客户端。]',
      unlockDate: '2099-01-01',
      mood: 'rose',
    },
  ],
  wishes: [
    {
      id: 'wish-sea',
      isExample: true,
      title: '[示例愿望] 一起去看一片新的海',
      category: 'travel',
      completed: false,
    },
    {
      id: 'wish-morning',
      isExample: true,
      title: '[示例愿望] 等一场完整的日出',
      category: 'together',
      completed: false,
    },
    {
      id: 'wish-food',
      isExample: true,
      title: '[示例愿望] 为对方做一道拿手菜',
      category: 'small',
      completed: false,
    },
  ],
  anniversaries: [
    { id: 'custom-first', title: '[待填写] 我们的重要日子', date: null, recurring: true },
  ],
  // 首次打开使用宇宙知识示例题。可替换成你们自己的问题与答案。
  quiz: [
    {
      id: 'quiz-one',
      question: '[示例题] 这个宇宙，是为谁而存在的？',
      options: ['每一颗路过的星星', '屏幕前的她', '一个偶然'],
      answer: 1,
      explanation: '宇宙因她而存在。替换为只有你们知道的答案，会更有意义。',
    },
    {
      id: 'quiz-two',
      question: '[示例题] 想把一段故事珍藏起来，应该去哪颗星球？',
      options: ['记忆星球', '时间星球', '游戏星球'],
      answer: 0,
      explanation: '记忆星球收藏照片与故事。你也可以把这道题改成你们共同的回忆。',
    },
    {
      id: 'quiz-three',
      question: '[示例题] 在另一个平行宇宙里，故事的最后会是？',
      options: ['独自远行', '不再相遇', '依然选择遇见你'],
      answer: 2,
      explanation: '在无数个平行宇宙里，我依然会选择遇见你。',
    },
  ],
  secrets: [
    {
      id: 'secret-star',
      trigger: 'star-clicks',
      target: 5,
      reward: { title: '你找到了一句悄悄话', message: '[待填写：一句只有你们懂的暗号。]' },
    },
    {
      id: 'secret-games',
      trigger: 'all-games',
      target: 3,
      reward: { title: '命运的同路人', message: '三场小小的冒险，都把我们带向同一个方向。' },
    },
    {
      id: 'secret-explorer',
      trigger: 'all-planets',
      target: 6,
      reward: {
        title: '整个宇宙，都在等你',
        message: '你已经走过每一颗星球。现在，让星光为你连成一幅地图。',
      },
    },
    {
      id: 'secret-anniversary',
      trigger: 'anniversary',
      target: null,
      reward: {
        title: '属于我们的今天',
        message: '[待填写：纪念日专属留言。填写真实恋爱日期后，于每年的同一天出现。]',
      },
    },
  ],
};
