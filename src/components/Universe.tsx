'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Compass,
  Heart,
  LockKeyhole,
  LogOut,
  Orbit,
  Play,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStory } from './StoryProvider';
import { Starfield } from './Starfield';
import { PlanetArt } from './PlanetArt';
import { Modal } from './Modal';
import { MemoryPlanet } from './MemoryPlanet';
import { LetterPlanet } from './LetterPlanet';
import { DreamPlanet } from './DreamPlanet';
import { TimePlanet } from './TimePlanet';
import { GamePlanet } from './GamePlanet';
import {
  emptyExploration,
  finaleUnlocked,
  parseExploration,
  secretUnlocked,
  type Exploration,
} from '@/lib/exploration';
import { getElapsedTime, isAnniversaryToday } from '@/lib/time';

const planets = [
  {
    id: 'memory',
    name: '记忆星球',
    en: 'OUR MEMORIES',
    description: '让每个瞬间，永远有迹可循',
    note: '收藏那些闪光的日常',
    number: '01',
  },
  {
    id: 'time',
    name: '时间星球',
    en: 'OUR TIME',
    description: '和你一起，赋予时间意义',
    note: '每一秒，都算数',
    number: '02',
  },
  {
    id: 'game',
    name: '游戏星球',
    en: 'JUST US',
    description: '穿越星海，找到心动的默契',
    note: '一场只属于我们的冒险',
    number: '03',
  },
  {
    id: 'letter',
    name: '情书星球',
    en: 'LETTERS TO YOU',
    description: '有些心事，只想慢慢说给你听',
    note: '见字如面，字字是你',
    number: '04',
  },
  {
    id: 'dream',
    name: '梦境星球',
    en: 'OUR FUTURE',
    description: '把未完成的梦，种成未来',
    note: '下一站，依然和你',
    number: '05',
  },
  {
    id: 'secret',
    name: '秘密星球',
    en: 'SECRET UNIVERSE',
    description: '宇宙深处，藏着一点小偏爱',
    note: '等待被你发现的惊喜',
    number: '06',
  },
] as const;
type PlanetId = (typeof planets)[number]['id'];

function useExploration() {
  const [progress, setProgress] = useState<Exploration>(emptyExploration);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('her-universe-exploration-v1');
      if (raw) setProgress(parseExploration(JSON.parse(raw)));
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem('her-universe-exploration-v1', JSON.stringify(progress));
      } catch {
        setStorageError(true);
      }
  }, [progress, ready]);
  return { progress, setProgress, storageError };
}

function SecretPlanet({ progress, onStar }: { progress: Exploration; onStar: () => void }) {
  const story = useStory();
  const [finale, setFinale] = useState(false);
  const [today, setToday] = useState(false);
  useEffect(() => {
    setToday(isAnniversaryToday(story.identity.startDate, new Date(), story.timezone));
  }, [story]);
  const goals = [
    {
      label: '走过六颗星球',
      done: progress.visited.length >= 6,
      detail: `${progress.visited.length} / 6`,
    },
    {
      label: '完成三场星际冒险',
      done: progress.games.length >= 3,
      detail: `${progress.games.length} / 3`,
    },
    {
      label: '翻开一段记忆',
      done: progress.memories.length > 0,
      detail: progress.memories.length ? '已收藏在心里' : '等待探索',
    },
    {
      label: '向守候的星星问好五次',
      done: progress.starClicks >= 5,
      detail: `${Math.min(progress.starClicks, 5)} / 5`,
    },
  ];
  return (
    <div className="secret-space">
      <div className="secret-lead">
        <span className="eyebrow">SOME THINGS ARE ONLY FOR YOU</span>
        <h3>
          有些偏爱，
          <br />
          藏在星光看不到的地方。
        </h3>
        <button className="secret-star" onClick={onStar} aria-label="向守候的星星问好">
          <Star size={38} />
          <span>轻轻触碰，听听星星的回声</span>
        </button>
      </div>
      <div className="secret-rewards">
        {story.secrets.map((rule) => {
          const unlocked = secretUnlocked(rule, progress, today);
          return (
            <article key={rule.id} className={unlocked ? 'reward unlocked' : 'reward'}>
              <span className="reward-symbol">
                {unlocked ? <Sparkles size={20} /> : <LockKeyhole size={18} />}
              </span>
              <div>
                <h4>
                  {unlocked
                    ? rule.reward.title
                    : rule.trigger === 'anniversary'
                      ? '在属于我们的那一天'
                      : rule.trigger === 'all-games'
                        ? '三次命运的相遇'
                        : rule.trigger === 'all-planets'
                          ? '走过整个宇宙'
                          : '一颗星星的悄悄话'}
                </h4>
                <p>
                  {unlocked
                    ? rule.reward.message
                    : rule.trigger === 'anniversary'
                      ? '填写真实纪念日后，当天来看看。'
                      : rule.trigger === 'all-games'
                        ? '完成全部三款小游戏。'
                        : rule.trigger === 'all-planets'
                          ? '拜访每一颗星球，点亮所有坐标。'
                          : '向那颗守候的星星，多问几次好。'}
                </p>
              </div>
              {unlocked && <Check size={18} />}
            </article>
          );
        })}
      </div>
      <div className="finale-card">
        <span className="eyebrow">THE LAST CONSTELLATION</span>
        <h3>当所有星光，因你相连。</h3>
        <p className="muted">这一封告白，等你走过整个宇宙再打开。</p>
        <ul>
          {goals.map((g) => (
            <li key={g.label} className={g.done ? 'done' : ''}>
              <span>
                {g.done ? <Check size={15} /> : <span className="goal-dot" />}
                {g.label}
              </span>
              <small>{g.detail}</small>
            </li>
          ))}
        </ul>
        <button
          className="gold-button"
          disabled={!finaleUnlocked(progress)}
          onClick={() => setFinale(!finale)}
        >
          {finale ? '收起这片星图' : '让星光为你相连'}
          <Sparkles size={16} />
        </button>
        {finale && (
          <div className="final-confession" aria-live="polite">
            <svg viewBox="0 0 600 260" aria-label="相连的命运星图" role="img">
              <path
                className="constellation-line"
                d="M60 130 120 60 210 78 300 130 390 190 480 200 550 130 480 60 390 78 300 130 210 190 120 200 60 130"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              {[
                [60, 130],
                [120, 60],
                [210, 78],
                [300, 130],
                [390, 190],
                [480, 200],
                [550, 130],
                [480, 60],
                [390, 78],
                [210, 190],
                [120, 200],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={i === 3 ? 6 : 3} fill="currentColor" />
                  <circle cx={x} cy={y} r={i === 3 ? 16 : 9} fill="currentColor" opacity=".08" />
                </g>
              ))}
            </svg>
            <span className="eyebrow">IN EVERY UNIVERSE, ALWAYS YOU.</span>
            <p>{story.confession}</p>
            <Heart size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Universe({ demo }: { demo: boolean }) {
  const story = useStory();
  const [active, setActive] = useState<PlanetId | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [intro, setIntro] = useState(false);
  const [returning, setReturning] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audio = useRef<AudioContext | null>(null);
  const { progress, setProgress, storageError } = useExploration();
  const [now, setNow] = useState<Date | null>(null);
  const [toast, setToast] = useState('');
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem('her-universe-visited') === 'yes';
      localStorage.setItem('her-universe-visited', 'yes');
    } catch {}
    setReturning(seen);
    if (!seen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setIntro(true);
    const timeout = setTimeout(() => setIntro(false), 5200);
    setNow(new Date());
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(ticker);
      audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!intro) return;
    const previous = document.activeElement as HTMLElement | null;
    const buttons = introRef.current?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIntro(false);
      }
      if (event.key === 'Tab' && buttons?.length) {
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [intro]);
  const open = useCallback(
    (id: PlanetId) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setActive(id);
      setProgress((p) => ({ ...p, visited: Array.from(new Set([...p.visited, id])) }));
    },
    [setProgress],
  );
  const closePlanet = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);
  const onGame = useCallback(
    (id: string) => {
      setProgress((p) => ({ ...p, games: Array.from(new Set([...p.games, id])) }));
      setToast('一段冒险，已化作星图里的光。');
    },
    [setProgress],
  );
  const onMemory = useCallback(
    () => setProgress((p) => ({ ...p, memories: ['explored'] })),
    [setProgress],
  );
  const star = () => {
    setProgress((p) => ({ ...p, starClicks: p.starClicks + 1 }));
    setToast(
      progress.starClicks >= 4
        ? '星星听见了，你的悄悄话。'
        : `星光有了回声 · ${Math.min(progress.starClicks + 1, 5)} / 5`,
    );
  };
  const toggleSound = async () => {
    try {
      if (sound) {
        await audio.current?.close();
        audio.current = null;
        setSound(false);
        return;
      }
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      const master = context.createGain();
      master.gain.setValueAtTime(0, context.currentTime);
      master.gain.linearRampToValueAtTime(0.035, context.currentTime + 2);
      master.connect(context.destination);
      [130.81, 196, 261.63, 329.63].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index * 1.5;
        gain.gain.value = 0.32;
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start();
      });
      setSound(true);
      setAudioError('');
    } catch {
      setAudioError('当前浏览器暂时无法播放环境音。');
      setSound(false);
    }
  };
  const elapsed = now ? getElapsedTime(story.identity.startDate, now, story.timezone) : null;
  const current = planets.find((p) => p.id === active);
  const theme = {
    '--color-midnight': story.theme.midnight,
    '--color-lavender': story.theme.lavender,
    '--color-gold': story.theme.champagne,
  } as CSSProperties;
  return (
    <div className="universe" style={theme}>
      <Starfield />
      <a className="skip-link" href="#galaxy">
        跳至星系导航
      </a>
      <header className="site-header" inert={intro || !!active}>
        <a className="wordmark" href="#home" aria-label="HER UNIVERSE 首页">
          <Orbit size={31} strokeWidth={1} />
          <span>
            HER UNIVERSE<small>为她创造一整个宇宙</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          <a className="nav-active" href="#galaxy">
            她的星系
            <span />
          </a>
          <button onClick={() => open('memory')}>我们的故事</button>
          <button onClick={() => open('dream')}>未完的未来</button>
        </nav>
        <div className="header-actions">
          {story.music.enabled && (
            <button
              className={`sound-button ${sound ? 'playing' : ''}`}
              onClick={toggleSound}
              aria-label={sound ? '关闭环境音' : '开启环境音'}
              aria-pressed={sound}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
              <span>{sound ? '声音已开启' : '声音已关闭'}</span>
              <i />
              <i />
              <i />
            </button>
          )}
          <span className="header-divider" />
          <button className="tiny-star" onClick={star} aria-label="向守候的星星问好">
            <Sparkles size={19} />
          </button>
          {!demo && (
            <button
              className="icon-button logout-button"
              aria-label="锁上宇宙"
              onClick={async () => {
                const response = await fetch('/api/session', { method: 'DELETE' });
                if (response.ok) location.reload();
                else setToast('暂时无法锁定，请稍后重试。');
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>
      <main id="home" inert={intro || !!active}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="small-orbit" />
              <span>A LITTLE UNIVERSE, ALL FOR YOU</span>
            </div>
            <h1 id="hero-title">
              世界很大，
              <br />
              我的宇宙<span>是你。</span>
            </h1>
            <p className="hero-english">
              In every universe,
              <br />
              <em>I would still choose you.</em>
            </p>
            <p className="hero-description">
              在无数个平行宇宙里，我依然会选择遇见你。
              <br />
              这里的每一颗星，都藏着一份关于你的偏爱。
            </p>
            <div className="hero-ctas">
              <a href="#galaxy" className="gold-button">
                开始探索
                <ArrowUpRight size={17} />
              </a>
              <button className="text-button" onClick={() => open('letter')}>
                <span className="round-play">
                  <Play size={10} fill="currentColor" />
                </span>
                一封写给你的信
              </button>
            </div>
            <div className="dedication">
              <span className="dedication-line" />
              FOR {story.identity.herName === '她' ? 'YOU' : story.identity.herName} · ALWAYS &
              FOREVER
            </div>
          </div>
          <div className="hero-galaxy">
            <div className="galaxy-haze" />
            <div className="galaxy-coordinates">
              <span>R.A. 00h 00m ∞s</span>
              <span>DEC. + LOVE °</span>
            </div>
            <div className="orbital-path orbital-path-one" />
            <div className="orbital-path orbital-path-two" />
            <button
              className="hero-planet-button"
              onClick={() => open('time')}
              aria-label="进入时间星球"
            >
              <PlanetArt kind="time" className="hero-planet" />
            </button>
            <div className="planet-coordinate">
              <span className="coordinate-line" />
              <div>
                <span className="eyebrow">THE CENTER OF MY UNIVERSE</span>
                <p>
                  {story.identity.herName === '她'
                    ? '你，是一切的起点。'
                    : `${story.identity.herName}，你是一切的起点。`}
                </p>
                <small>唯一坐标 · 永久偏爱</small>
              </div>
            </div>
            <button
              className="satellite satellite-one"
              onClick={() => open('dream')}
              aria-label="进入梦境星球"
            >
              <PlanetArt kind="dream" />
              <span>Our future</span>
            </button>
            <button
              className="satellite satellite-two"
              onClick={() => open('secret')}
              aria-label="进入秘密星球"
            >
              <PlanetArt kind="secret" />
            </button>
            <button className="galaxy-secret-star" onClick={star} aria-label="向守候的星星问好">
              <Sparkles size={20} />
            </button>
            <div className="galaxy-caption">
              <span className="live-dot" />
              {returning ? 'WELCOME BACK, MY FAVORITE PERSON' : 'SOMEWHERE, ONLY WE KNOW'}
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              <span className="live-dot" />
              {returning ? '星光还在，欢迎回来。' : '一场关于爱与宇宙的漫游'}
            </span>
            <a href="#galaxy">
              SCROLL TO DISCOVER <ArrowDown size={12} />
            </a>
            <span className="hero-page">
              01 <i>/</i> ∞
            </span>
          </div>
        </section>

        <section id="galaxy" className="galaxy-section" aria-labelledby="galaxy-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="little-cross">✧</span> EXPLORE HER GALAXY
              </span>
              <h2 id="galaxy-title">
                每一颗星，<span>都是关于你。</span>
              </h2>
            </div>
            <p>
              选择一颗星球，开启一段属于我们的故事。<span>慢慢探索，不必着急。</span>
            </p>
          </div>
          <div className="planet-navigation" role="list">
            {planets.map((planet) => (
              <div role="listitem" key={planet.id}>
                <button
                  className={`planet-card planet-card--${planet.id}`}
                  onClick={() => open(planet.id)}
                  aria-label={planet.name}
                >
                  <div className="card-topline">
                    <span>{planet.number} /</span>
                    {progress.visited.includes(planet.id) ? (
                      <span className="visited-indicator">
                        <Check size={10} />
                        已抵达
                      </span>
                    ) : (
                      <ArrowUpRight size={15} />
                    )}
                  </div>
                  <PlanetArt kind={planet.id} />
                  <div className="planet-card-copy">
                    <span className="planet-en">{planet.en}</span>
                    <h3>{planet.name}</h3>
                    <p>{planet.note}</p>
                  </div>
                  <span className="card-bottom-line" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="time-ribbon" aria-label="我们的时间">
          <div className="time-ribbon-heading">
            <Orbit size={25} strokeWidth={1} />
            <div>
              <span className="eyebrow">EVERY SECOND WITH YOU</span>
              <h2>时间，因为你而有了意义。</h2>
            </div>
          </div>
          <div className="time-ribbon-count">
            <strong>{elapsed ? String(elapsed.days).padStart(3, '0') : '∞'}</strong>
            <span>{elapsed ? '一起走过的日子' : '等待写下我们的第一天'}</span>
          </div>
          <button className="ribbon-link" onClick={() => open('time')}>
            去看看我们的时间
            <ArrowRight size={16} />
          </button>
        </section>

        <section className="memory-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LITTLE MOMENTS, INFINITE MEANING</span>
              <h2>
                把平凡的瞬间，<span>藏进永恒。</span>
              </h2>
            </div>
            <button className="text-button" onClick={() => open('memory')}>
              走进记忆长廊
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="memory-preview">
            {story.memories.slice(0, 3).map((memory, index) => (
              <button
                className={`preview-card preview-card-${index}`}
                key={memory.id}
                onClick={() => open('memory')}
              >
                <div className="preview-image">
                  <img
                    src={memory.poster || memory.src}
                    alt={memory.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>0{index + 1} — A MOMENT TO KEEP</span>
                  <span className="preview-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
                <div className="preview-caption">
                  <h3>{memory.title}</h3>
                  <span>
                    {memory.isExample
                      ? '原创示例画作 · 等你填入真实回忆'
                      : `${memory.date || '属于我们的某一天'} · ${memory.location || '心动的坐标'}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="journey-banner">
          <div className="journey-symbol">
            <Compass size={36} strokeWidth={0.8} />
          </div>
          <div>
            <span className="eyebrow">YOUR LITTLE VOYAGE</span>
            <h2>宇宙的故事，正在被你点亮。</h2>
            <p>
              已抵达 {progress.visited.length} / 6 颗星球 · 完成 {progress.games.length} / 3 场冒险
            </p>
          </div>
          <button className="text-button" onClick={() => open('secret')}>
            寻找藏起来的偏爱
            <ArrowUpRight size={16} />
          </button>
        </section>
        <footer className="site-footer">
          <div className="footer-dedication">
            <Star size={15} strokeWidth={1} />
            <p>
              宇宙或许没有尽头，<span>但我的偏爱，始终有归处。</span>
            </p>
          </div>
          <div className="footer-bottom">
            <span>
              HER UNIVERSE <i>©</i> {new Date().getFullYear()}
            </span>
            <span>MADE OF STARDUST & A LITTLE LOVE</span>
            <span>
              <LockKeyhole size={11} />
              {demo ? '创作预览 · 所有内容为待填写示例' : '私密空间 · 仅限受邀访问'}
            </span>
          </div>
        </footer>
      </main>
      {current && (
        <Modal
          title={
            current.id === 'memory'
              ? '记忆博物馆'
              : current.id === 'time'
                ? '我们的时间'
                : current.id === 'game'
                  ? '只属于我们的冒险'
                  : current.id === 'letter'
                    ? '见字如面'
                    : current.id === 'dream'
                      ? '未来，慢慢一起实现'
                      : '秘密宇宙'
          }
          eyebrow={`${current.number} / ${current.en}`}
          onClose={closePlanet}
        >
          {active === 'memory' && <MemoryPlanet onExplore={onMemory} />}{' '}
          {active === 'time' && <TimePlanet />}
          {active === 'game' && <GamePlanet onComplete={onGame} />}{' '}
          {active === 'letter' && <LetterPlanet />}
          {active === 'dream' && <DreamPlanet />}
          {active === 'secret' && <SecretPlanet progress={progress} onStar={star} />}
        </Modal>
      )}
      {intro && (
        <div className="intro" ref={introRef} role="dialog" aria-modal="true" aria-label="宇宙开场">
          <div className="intro-orb">
            <PlanetArt kind="time" />
          </div>
          <span className="eyebrow">A UNIVERSE BEGINS WITH YOU</span>
          <p>{story.intro.line}</p>
          <small>
            {story.identity.herName}，{story.intro.welcome}
          </small>
          <button className="intro-enter" onClick={() => setIntro(false)}>
            进入我的宇宙
            <ArrowRight size={16} />
          </button>
          <button className="intro-skip" onClick={() => setIntro(false)}>
            跳过开场
            <ChevronRight size={14} />
          </button>
        </div>
      )}
      <div className="toast" role="status" aria-live="polite">
        {toast ||
          audioError ||
          (storageError ? '当前浏览器无法保存探索进度，本次仍可继续探索。' : '')}
      </div>
    </div>
  );
}
