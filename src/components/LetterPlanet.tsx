'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Feather,
  LockKeyhole,
  Mail,
  Moon,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useStory } from '@/components/StoryProvider';
import { isDateUnlocked } from '@/lib/time';
import { useLocalData } from '@/lib/useLocalData';
import './story-panels.css';

type DraftLetter = { id: string; title: string; body: string; unlockDate: string };
const isDraftLetters = (value: unknown): value is DraftLetter[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      ['id', 'title', 'body', 'unlockDate'].every((key) => typeof item[key] === 'string'),
  );

export function LetterPlanet() {
  const story = useStory();
  const [drafts, setDrafts, storage] = useLocalData<DraftLetter[]>(
    'hu:future-letters:v1',
    [],
    isDraftLetters,
  );
  const [active, setActive] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [notice, setNotice] = useState('');
  const [revealed, setRevealed] = useState(0);
  const [hiddenNote, setHiddenNote] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const allLetters = [
    ...story.letters,
    ...drafts.map((letter) => ({ ...letter, preview: '一封留给未来的信', mood: 'future' })),
  ];
  const selected = allLetters.find((letter) => letter.id === active);
  const selectedBody = selected?.body ?? '';
  const selectedNote = selected && 'hiddenNote' in selected ? selected.hiddenNote : undefined;
  useEffect(() => {
    setRevealed(0);
    if (!selectedBody) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(selectedBody.length);
      return;
    }
    const timer = setInterval(
      () => setRevealed((previous) => Math.min(previous + 3, selectedBody.length)),
      28,
    );
    const stop = setTimeout(
      () => clearInterval(timer),
      Math.ceil(selectedBody.length / 3) * 28 + 50,
    );
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [selectedBody, active]);

  function beginWriting() {
    setWriting(true);
    setActive(null);
    setNotice('');
  }
  function saveDraft(event: React.FormEvent) {
    event.preventDefault();
    const letter = {
      id: `future-${crypto.randomUUID()}`,
      title: title.trim(),
      body: body.trim(),
      unlockDate,
    };
    if (!letter.title || !letter.body || !unlockDate) return;
    setDrafts((previous) => [...previous, letter]);
    setTitle('');
    setBody('');
    setUnlockDate('');
    setWriting(false);
    setNotice('已保存到这台设备。记得另行备份这封信。');
  }

  if (writing)
    return (
      <section className="story-panel">
        <button className="story-text-button" onClick={() => setWriting(false)}>
          <ArrowLeft size={16} /> 回到信箱
        </button>
        <div className="letter-compose-intro">
          <Feather size={30} />
          <p className="story-eyebrow">A LETTER TO THE FUTURE</p>
          <h3>把今天的话，寄给未来。</h3>
        </div>
        <form className="story-form" onSubmit={saveDraft}>
          <label>
            信的名字
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={80}
              placeholder="例如：写给一年后的你"
            />
          </label>
          <label>
            想在哪一天打开
            <input
              type="date"
              value={unlockDate}
              onChange={(event) => setUnlockDate(event.target.value)}
              required
            />
          </label>
          <label>
            慢慢写，我在听
            <textarea
              rows={9}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              maxLength={12000}
              placeholder="从一句想对她说的话开始……"
            />
          </label>
          <p className="story-footnote">
            仅保存在当前浏览器，不会自动同步。日期锁只提供仪式感，不加密内容；请勿用于保存敏感秘密。
          </p>
          <button type="submit" className="story-primary-button" disabled={!storage.ready}>
            <Save size={16} /> 保存未来的信
          </button>
        </form>
        {storage.error && (
          <p className="story-storage-error" role="status">
            {storage.error}
          </p>
        )}
      </section>
    );

  if (selected && isDateUnlocked(selected.unlockDate, now, story.timezone))
    return (
      <section className="story-panel">
        <div className="story-toolbar">
          <button className="story-text-button" onClick={() => setActive(null)}>
            <ArrowLeft size={16} /> 回到信箱
          </button>
          <span>只想写给你</span>
        </div>
        <article className="letter-paper" data-mood={selected.mood}>
          <span className="letter-paper-mark">HER UNIVERSE · PRIVATE CORRESPONDENCE</span>
          <h3>{selected.title}</h3>
          <p className="letter-salutation">
            亲爱的{story.identity.herNickname || story.identity.herName || '你'}：
          </p>
          <div className="letter-body">
            <p aria-hidden="true">
              {selectedBody.slice(0, revealed)}
              {revealed < selectedBody.length && <span className="letter-caret" />}
            </p>
            <p className="story-sr-only">{selectedBody}</p>
          </div>
          <div className="letter-signature">
            <span>
              {story.identity.myNickname || story.identity.myName || '写信的人（待填写）'}
            </span>
            <Feather size={22} />
          </div>
          {selectedNote && (
            <button
              className="letter-moon"
              aria-label="看看月亮背后的留言"
              onClick={() => setHiddenNote(!hiddenNote)}
              aria-expanded={hiddenNote}
            >
              <Moon size={16} />
            </button>
          )}
          {hiddenNote && selectedNote && <p className="letter-hidden-note">{selectedNote}</p>}
        </article>
        {revealed < selectedBody.length && (
          <button
            className="story-text-button letter-skip"
            onClick={() => setRevealed(selectedBody.length)}
          >
            显示全文 <ArrowRight size={15} />
          </button>
        )}
      </section>
    );

  return (
    <section className="story-panel">
      <div className="story-intro">
        <p>有些话适合轻轻说，有些话值得写下来。</p>
        <span>每一封信，都是一颗只朝你亮起的星。</span>
      </div>
      <div className="letter-list">
        {allLetters.map((letter, index) => {
          const locked = !isDateUnlocked(letter.unlockDate, now, story.timezone);
          const isLocal = drafts.some((draft) => draft.id === letter.id);
          return (
            <article
              key={letter.id}
              className={`letter-envelope ${locked ? 'is-locked' : ''}`}
              data-mood={letter.mood}
            >
              <button
                className="letter-envelope-open"
                onClick={() => {
                  setActive(letter.id);
                  setNotice(
                    locked ? `这封信将在 ${letter.unlockDate} 按 ${story.timezone} 日期打开。` : '',
                  );
                }}
                aria-label={`${locked ? '查看解锁日期：' : '打开信件：'}${letter.title}`}
              >
                <span className="letter-number">0{index + 1}</span>
                <div className="letter-envelope-icon">
                  {locked ? <LockKeyhole size={25} /> : <Mail size={27} />}
                </div>
                <div className="letter-envelope-copy">
                  <h3>{letter.title}</h3>
                  <p>{locked ? `${letter.unlockDate} · 等待开启` : letter.preview}</p>
                  <span>
                    {isLocal
                      ? '本机未来信件'
                      : letter.body.includes('[待填写') || letter.body.includes('[未来信件示例')
                        ? '待填写的信件示例'
                        : '只写给你的信'}
                  </span>
                </div>
                <ArrowRight size={18} className="letter-envelope-arrow" />
              </button>
              {isLocal && (
                <button
                  className="letter-delete"
                  aria-label={`删除${letter.title}`}
                  onClick={() => {
                    setDrafts((previous) => previous.filter((draft) => draft.id !== letter.id));
                    if (active === letter.id) setActive(null);
                    setNotice('已删除本机信件。');
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </article>
          );
        })}
      </div>
      <button className="story-add-button" onClick={beginWriting}>
        <Plus size={19} />
        <span>写一封信，给未来的她</span>
        <Feather size={18} />
      </button>
      {notice && (
        <p className="story-inline-notice" role="status">
          <Check size={15} />
          {notice}
        </p>
      )}
      <p className="story-footnote">
        日期锁依据设备时间，仅作阅读提示，不是保密措施。真正私密的访问由服务端验证保护。
        {storage.error && <span role="status"> {storage.error}</span>}
      </p>
    </section>
  );
}
