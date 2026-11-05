'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  RotateCcw,
  Sparkles,
  Star,
  Telescope,
  WandSparkles,
} from 'lucide-react';
import { useStory } from '@/components/StoryProvider';
import { fateEndings, fateScenes, getFateEnding, hiddenStars, quizOutcome } from '@/lib/games';
import './games.css';

type GameId = 'quiz' | 'stars' | 'fate';
type GamePlanetProps = { onComplete: (gameId: string) => void };

const gameInfo = [
  {
    id: 'quiz' as const,
    number: '01',
    icon: Compass,
    title: '我们的默契测试',
    english: 'IN PERFECT ORBIT',
    description: '答案或许不同，靠近的心意却一样。',
    note: '约 2 分钟 · 可自定义题库',
  },
  {
    id: 'stars' as const,
    number: '02',
    icon: Telescope,
    title: '寻找遗失的星星',
    english: 'A LITTLE STARDUST',
    description: '在安静的夜色中，找回七颗微光。',
    note: '探索游戏 · 解锁一段星空寓言',
  },
  {
    id: 'fate' as const,
    number: '03',
    icon: WandSparkles,
    title: '我们的命运星图',
    english: 'WRITTEN IN THE STARS',
    description: '选择一个平行宇宙，看看故事的另一种可能。',
    note: '互动叙事 · 3 种结局',
  },
];

export function GamePlanet({ onComplete }: GamePlanetProps) {
  const [game, setGame] = useState<GameId | null>(null);
  return (
    <div className="games-planet">
      {!game ? (
        <>
          <p className="games-intro">
            把宇宙暂时留在身后。
            <br />
            这一小会儿，只和你一起玩。
          </p>
          <div className="game-library">
            {gameInfo.map(({ id, number, icon: Icon, title, english, description, note }) => (
              <button
                key={id}
                className={`game-choice game-choice-${id}`}
                onClick={() => setGame(id)}
              >
                <span className="game-choice-number">{number} / JUST US</span>
                <span className="game-orbit-art">
                  <span />
                  <Icon size={32} strokeWidth={1} />
                </span>
                <span className="game-choice-english">{english}</span>
                <strong>{title}</strong>
                <span className="game-choice-description">{description}</span>
                <span className="game-choice-bottom">
                  <small>{note}</small>
                  <ArrowRight size={18} />
                </span>
              </button>
            ))}
          </div>
          <p className="game-data-note">题库中的内容是可替换示例；游戏记录只保存在当前浏览器。</p>
        </>
      ) : (
        <>
          <button className="game-back" onClick={() => setGame(null)}>
            <ArrowLeft size={15} /> 返回游戏星球
          </button>
          {game === 'quiz' && <QuizGame onComplete={() => onComplete('quiz')} />}
          {game === 'stars' && <StarGame onComplete={() => onComplete('stars')} />}
          {game === 'fate' && <FateGame onComplete={() => onComplete('fate')} />}
        </>
      )}
    </div>
  );
}

function QuizGame({ onComplete }: { onComplete: () => void }) {
  const story = useStory();
  const questions = story.quiz;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const correct = answers.filter((answer, i) => answer === questions[i].answer).length;
  const outcome = quizOutcome(correct, questions.length);
  const current = questions[index];

  function reset() {
    setStarted(false);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setRevealed(false);
    setFinished(false);
  }
  function next() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    if (index === questions.length - 1) {
      setFinished(true);
      onComplete();
    } else {
      setIndex(index + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  if (!questions.length)
    return (
      <div className="game-interstitial">
        <Compass />
        <h3>等待属于你们的题目</h3>
        <p>请在 ourStory.ts 的 quiz 中添加问题、选项与答案。</p>
      </div>
    );
  if (!started)
    return (
      <div className="game-interstitial">
        <span className="game-large-symbol">
          <Compass size={36} strokeWidth={1} />
        </span>
        <span className="game-eyebrow">IN PERFECT ORBIT</span>
        <h3>我们，会有一样的答案吗？</h3>
        <p>
          一共 {questions.length} 道题，每题选择一个答案。
          <br />
          没有标准的爱情，只有更多了解彼此的机会。
        </p>
        <span className="game-example-label">当前为可替换的宇宙示例题库</span>
        <button className="game-primary" onClick={() => setStarted(true)}>
          开始默契测试 <ArrowRight size={16} />
        </button>
      </div>
    );
  if (finished)
    return (
      <div className={`game-interstitial game-result game-result-${outcome}`} aria-live="polite">
        <span className="game-large-symbol">
          <Sparkles size={38} strokeWidth={1} />
        </span>
        <span className="game-eyebrow">OUR LITTLE CONNECTION</span>
        <h3>
          {outcome === 'perfect'
            ? '原来，我们一直在同一条轨道'
            : outcome === 'close'
              ? '相似的频率，正在靠近'
              : '关于你，还有好多想慢慢了解'}
        </h3>
        <div className="quiz-result-score">
          {correct}
          <span> / {questions.length}</span>
        </div>
        <p>
          {outcome === 'perfect'
            ? '满分彩蛋：两颗星星的轨道，恰好在这一刻交汇。✦'
            : '答案不同，也会有新的故事。这是一次轻松的游戏，不是感情的评分。'}
        </p>
        <div className="quiz-answer-review">
          {questions.map((q, i) => (
            <div key={i}>
              <span>
                {i + 1}. {q.question}
              </span>
              <small>
                {answers[i] === q.answer ? '✦ 心意相通' : `示例答案：${q.options[q.answer]}`}
              </small>
            </div>
          ))}
        </div>
        <button className="game-primary" onClick={reset}>
          <RotateCcw size={15} /> 再玩一次
        </button>
      </div>
    );
  return (
    <div className="quiz-play">
      <div className="game-progress-header">
        <span>我们的默契测试</span>
        <span>
          QUESTION {String(index + 1).padStart(2, '0')} /{' '}
          {String(questions.length).padStart(2, '0')}
        </span>
      </div>
      <div className="game-progress-track">
        <span style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <h3 key={index}>{current.question}</h3>
      <div className="quiz-options">
        {current.options.map((option, i) => (
          <button
            key={`${index}-${i}`}
            className={`quiz-option ${selected === i ? 'is-selected' : ''} ${revealed && current.answer === i ? 'is-answer' : ''}`}
            disabled={revealed}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
          >
            <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
            <span>{option}</span>
            {selected === i && <Check size={16} />}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="quiz-explanation" role="status">
          {selected === current.answer ? '✦ 这一次，我们想到一起了。' : '✧ 又多了解了一点点。'}
          <br />
          {current.explanation}
        </p>
      )}
      <div className="quiz-footer">
        <small>{revealed ? '每一个答案，都是一次靠近。' : '跟随直觉，选择此刻的答案。'}</small>
        {revealed ? (
          <button className="game-primary" onClick={next}>
            {index === questions.length - 1 ? '打开结果' : '下一道题'}
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="game-primary"
            disabled={selected === null}
            onClick={() => setRevealed(true)}
          >
            确认答案 <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function StarGame({ onComplete }: { onComplete: () => void }) {
  const [started, setStarted] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [lastStory, setLastStory] = useState('七颗星星散落在夜色里。仔细看看，微光正在等待你。');
  const complete = found.length === hiddenStars.length;
  function collect(id: string) {
    if (found.includes(id)) return;
    const next = [...found, id];
    setFound(next);
    setHint(null);
    setLastStory(hiddenStars[next.length - 1].text);
    if (next.length === hiddenStars.length) onComplete();
  }
  function reset() {
    setFound([]);
    setHint(null);
    setStarted(false);
    setLastStory('七颗星星散落在夜色里。仔细看看，微光正在等待你。');
  }
  if (!started)
    return (
      <div className="game-interstitial">
        <span className="game-large-symbol">
          <Telescope size={38} strokeWidth={1} />
        </span>
        <span className="game-eyebrow">A LITTLE STARDUST</span>
        <h3>有些微光，要靠近才能看见</h3>
        <p>
          在星空场景中找到 7 颗四芒星，点击收集。
          <br />
          每一颗，都会让一段星空寓言慢慢完整。
        </p>
        <span className="game-example-label">原创虚构星空寓言 · 可使用键盘 Tab 寻找</span>
        <button className="game-primary" onClick={() => setStarted(true)}>
          进入夜色 <ArrowRight size={16} />
        </button>
      </div>
    );
  return (
    <div className="star-game">
      <div className="game-progress-header">
        <span>寻找遗失的星星</span>
        <span>
          <Star size={13} /> {found.length} / {hiddenStars.length}
        </span>
      </div>
      <div
        className={`star-search-scene ${complete ? 'is-complete' : ''}`}
        aria-label="寻找七颗星星的夜空场景"
      >
        <div className="search-moon" />
        <div className="search-nebula" />
        {Array.from({ length: 37 }, (_, i) => (
          <span
            key={i}
            className="search-background-star"
            style={{
              left: `${(i * 29.7 + 7) % 97}%`,
              top: `${(i * 13.3 + 5) % 86}%`,
              opacity: 0.12 + (i % 4) * 0.1,
            }}
          />
        ))}
        <div className="search-mountain search-mountain-back" />
        <div className="search-mountain search-mountain-front" />
        {complete && (
          <svg
            className="search-constellation"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={hiddenStars.map((star) => `${star.x},${star.y}`).join(' ')}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
        {hiddenStars.map((star, i) => (
          <button
            key={star.id}
            className={`search-target ${found.includes(star.id) ? 'is-found' : ''} ${hint === star.id ? 'is-hinted' : ''}`}
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            onClick={() => collect(star.id)}
            disabled={found.includes(star.id)}
            aria-label={`${found.includes(star.id) ? '已找到' : '寻找'}第 ${i + 1} 颗星星`}
          >
            <span>✦</span>
          </button>
        ))}
        {complete && (
          <div className="search-complete-caption">
            <span>THE CONSTELLATION OF US</span>
            <strong>散落的光，终于有了彼此。</strong>
          </div>
        )}
      </div>
      <div className="star-story" aria-live="polite">
        <Sparkles size={17} />
        <p>{lastStory}</p>
      </div>
      {hint && (
        <p className="star-hint" role="status">
          微光提示：{hiddenStars.find((s) => s.id === hint)?.hint}。
        </p>
      )}
      <div className="quiz-footer">
        <small>
          {complete ? '七段寓言已解锁 · 游戏星球又亮了一点' : '寻找细小的四芒星 ✦，轻轻点亮它们。'}
        </small>
        {complete ? (
          <button className="game-primary" onClick={reset}>
            <RotateCcw size={15} /> 再找一次
          </button>
        ) : (
          <button
            className="game-secondary"
            onClick={() => setHint(hiddenStars.find((s) => !found.includes(s.id))?.id ?? null)}
          >
            <Sparkles size={15} /> 给我一点提示
          </button>
        )}
      </div>
      {complete && (
        <details className="star-story-full">
          <summary>
            把完整的星空寓言收起来 <ChevronRight size={14} />
          </summary>
          {hiddenStars.map((star) => (
            <p key={star.id}>{star.text}</p>
          ))}
        </details>
      )}
    </div>
  );
}

function FateGame({ onComplete }: { onComplete: () => void }) {
  const [started, setStarted] = useState(false);
  const [choices, setChoices] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const complete = choices.length === fateScenes.length;
  const scene = fateScenes[Math.min(choices.length, fateScenes.length - 1)];
  const ending = fateEndings[getFateEnding(choices)];
  function choose() {
    if (selected === null) return;
    const next = [...choices, selected];
    setChoices(next);
    setSelected(null);
    if (next.length === fateScenes.length) onComplete();
  }
  function reset() {
    setStarted(false);
    setChoices([]);
    setSelected(null);
  }
  if (!started)
    return (
      <div className="game-interstitial">
        <span className="game-large-symbol">
          <WandSparkles size={38} strokeWidth={1} />
        </span>
        <span className="game-eyebrow">WRITTEN IN THE STARS</span>
        <h3>如果，故事重新开始</h3>
        <p>
          三个选择，三种平行宇宙。
          <br />
          没有对错，只是看看你会把故事写向哪里。
        </p>
        <span className="game-example-label">原创虚构互动故事 · 不预测真实命运</span>
        <button className="game-primary" onClick={() => setStarted(true)}>
          让故事开始 <ArrowRight size={16} />
        </button>
      </div>
    );
  if (complete)
    return (
      <div className="game-interstitial fate-result" aria-live="polite">
        <span className="fate-ending-symbol">{ending.symbol}</span>
        <span className="game-eyebrow">{ending.subtitle}</span>
        <h3>{ending.title}</h3>
        <p>{ending.story}</p>
        <div className="fate-path" aria-label="你的选择路径">
          {choices.map((choice, i) => (
            <span key={i}>
              {fateScenes[i].choices[choice].symbol}
              {i < choices.length - 1 && <i />}
            </span>
          ))}
        </div>
        <blockquote>
          在无数个平行宇宙里，
          <br />
          我依然会选择遇见你。
        </blockquote>
        <small className="game-example-label">
          这是一次虚构的星际旅程，留给你们填写真实的未来。
        </small>
        <button className="game-primary" onClick={reset}>
          <RotateCcw size={15} /> 探索另一种可能
        </button>
      </div>
    );
  return (
    <div className="fate-play">
      <div className="game-progress-header">
        <span>我们的命运星图</span>
        <span>CHAPTER 0{choices.length + 1} / 03</span>
      </div>
      <div className="fate-chapter-orbit">
        {fateScenes.map((_, i) => (
          <span key={i} className={i <= choices.length ? 'is-lit' : ''}>
            {i < choices.length ? '✦' : String(i + 1).padStart(2, '0')}
          </span>
        ))}
      </div>
      <h3>{scene.title}</h3>
      <p className="fate-scene-text">{scene.text}</p>
      <div className="fate-options">
        {scene.choices.map((choice, i) => (
          <button
            key={`${choices.length}-${i}`}
            className={`fate-option ${selected === i ? 'is-selected' : ''}`}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
          >
            <span className="fate-choice-symbol">{choice.symbol}</span>
            <span>
              <strong>{choice.title}</strong>
              <small>{choice.detail}</small>
            </span>
            {selected === i && <Check size={16} />}
          </button>
        ))}
      </div>
      <div className="quiz-footer">
        <small>跟随心里的那一点光。</small>
        <button className="game-primary" disabled={selected === null} onClick={choose}>
          {choices.length === fateScenes.length - 1 ? '展开命运星图' : '继续旅程'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
