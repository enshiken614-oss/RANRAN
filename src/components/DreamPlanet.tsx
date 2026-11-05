'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Circle,
  Compass,
  Leaf,
  LockKeyhole,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Sprout,
  Star,
  Trash2,
} from 'lucide-react';
import type { Wish } from '@/config/ourStory';
import { useStory } from '@/components/StoryProvider';
import { isDateUnlocked } from '@/lib/time';
import { isBooleanMap, useLocalData } from '@/lib/useLocalData';
import { createLocalId } from '@/lib/localId';
import './story-panels.css';

type Category = 'all' | 'travel' | 'together' | 'small';
type Capsule = { id: string; title: string; body: string; unlockDate: string };
const isWishes = (value: unknown): value is Wish[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      ['travel', 'together', 'small'].includes(item.category) &&
      typeof item.completed === 'boolean',
  );
const isCapsules = (value: unknown): value is Capsule[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      ['id', 'title', 'body', 'unlockDate'].every((key) => typeof item[key] === 'string'),
  );
const categoryLabels = { travel: '一起出发', together: '一起完成', small: '平凡小事' };

export function DreamPlanet() {
  const story = useStory();
  const [custom, setCustom, customStorage] = useLocalData<Wish[]>('hu:wishes:v1', [], isWishes);
  const [completion, setCompletion, completionStorage] = useLocalData<Record<string, boolean>>(
    'hu:wish-completion:v1',
    {},
    isBooleanMap,
  );
  const [capsules, setCapsules, capsuleStorage] = useLocalData<Capsule[]>(
    'hu:capsules:v1',
    [],
    isCapsules,
  );
  const [category, setCategory] = useState<Category>('all');
  const [wishTitle, setWishTitle] = useState('');
  const [wishCategory, setWishCategory] = useState<Wish['category']>('together');
  const [adding, setAdding] = useState(false);
  const [capsuleForm, setCapsuleForm] = useState(false);
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleBody, setCapsuleBody] = useState('');
  const [capsuleDate, setCapsuleDate] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [openCapsule, setOpenCapsule] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const wishes = [...story.wishes, ...custom].map((wish) => ({
    ...wish,
    completed: completion[wish.id] ?? wish.completed,
  }));
  const completed = wishes.filter((wish) => wish.completed);
  const ready = customStorage.ready && completionStorage.ready && capsuleStorage.ready;
  const errors = [
    ...new Set(
      [customStorage.error, completionStorage.error, capsuleStorage.error].filter(Boolean),
    ),
  ];
  function addWish(event: React.FormEvent) {
    event.preventDefault();
    if (!wishTitle.trim()) return;
    setCustom((previous) => [
      ...previous,
      {
        id: `wish-${createLocalId()}`,
        title: wishTitle.trim(),
        category: wishCategory,
        completed: false,
      },
    ]);
    setWishTitle('');
    setAdding(false);
    setNotice('一颗新愿望，已经种下。');
  }
  function saveCapsule(event: React.FormEvent) {
    event.preventDefault();
    if (!capsuleTitle.trim() || !capsuleBody.trim() || !capsuleDate) return;
    const capsule = {
      id: editing ?? `capsule-${createLocalId()}`,
      title: capsuleTitle.trim(),
      body: capsuleBody.trim(),
      unlockDate: capsuleDate,
    };
    setCapsules((previous) =>
      editing
        ? previous.map((item) => (item.id === editing ? capsule : item))
        : [...previous, capsule],
    );
    setCapsuleForm(false);
    setEditing(null);
    setCapsuleTitle('');
    setCapsuleBody('');
    setCapsuleDate('');
    setNotice('时间胶囊已保存到这台设备。');
  }
  function editCapsule(capsule: Capsule) {
    setEditing(capsule.id);
    setCapsuleTitle(capsule.title);
    setCapsuleBody(capsule.body);
    setCapsuleDate(capsule.unlockDate);
    setCapsuleForm(true);
  }

  return (
    <section className="story-panel">
      <div className="dream-garden">
        <div className="dream-orbit dream-orbit-one" />
        <div className="dream-orbit dream-orbit-two" />
        <div className="dream-seed">
          <Sprout size={48} strokeWidth={1} />
        </div>
        {Array.from({ length: Math.min(8, completed.length) }).map((_, index) => (
          <Star
            key={index}
            className={`dream-growing-star dream-star-${index}`}
            size={12}
            fill="currentColor"
          />
        ))}
        <p className="story-eyebrow">LITTLE DREAMS, A BIG UNIVERSE</p>
        <h3>未来很远，我们慢慢走。</h3>
        <p>
          {completed.length
            ? `${completed.length} 个愿望已开花，还有 ${wishes.length - completed.length} 颗种子等待一起长大。`
            : '每一个想和你一起的念头，都是一颗未来的种子。'}
        </p>
      </div>
      <div className="dream-section-heading">
        <h3>
          <Compass size={18} /> 我们的愿望清单
        </h3>
        <button
          className="story-text-button"
          onClick={() => setAdding(!adding)}
          aria-expanded={adding}
        >
          <Plus size={16} /> 种下愿望
        </button>
      </div>
      {adding && (
        <form className="story-form dream-wish-form" onSubmit={addWish}>
          <label>
            新的愿望
            <input
              autoFocus
              value={wishTitle}
              onChange={(event) => setWishTitle(event.target.value)}
              placeholder="一件想和她一起做的事"
              maxLength={160}
              required
            />
          </label>
          <label>
            愿望的种类
            <select
              value={wishCategory}
              onChange={(event) => setWishCategory(event.target.value as Wish['category'])}
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="story-primary-button" disabled={!ready} type="submit">
            <Leaf size={15} /> 种下这一颗
          </button>
        </form>
      )}
      <div className="story-tabs dream-tabs" aria-label="愿望分类">
        {(['all', 'travel', 'together', 'small'] as const).map((item) => (
          <button
            key={item}
            className={category === item ? 'is-selected' : ''}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item === 'all' ? '全部愿望' : categoryLabels[item]}
          </button>
        ))}
      </div>
      <div className="dream-wish-list">
        {wishes
          .filter((wish) => category === 'all' || wish.category === category)
          .map((wish) => (
            <article key={wish.id} className={`dream-wish ${wish.completed ? 'is-complete' : ''}`}>
              <button
                className="dream-wish-toggle"
                disabled={!ready}
                aria-label={`${wish.completed ? '标记未完成' : '完成愿望'}：${wish.title}`}
                aria-pressed={wish.completed}
                onClick={() => {
                  setCompletion((previous) => ({ ...previous, [wish.id]: !wish.completed }));
                  setNotice(
                    wish.completed
                      ? '这颗种子重新等待出发。'
                      : '一个愿望开花了，记得把这一天放进回忆里。',
                  );
                }}
              >
                {wish.completed ? (
                  <span className="dream-check">
                    <Check size={15} />
                  </span>
                ) : (
                  <Circle size={22} strokeWidth={1} />
                )}
                <span>
                  <strong>{wish.title}</strong>
                  <small>
                    {categoryLabels[wish.category]}
                    {custom.some((item) => item.id === wish.id)
                      ? ' · 本机愿望'
                      : wish.isExample
                        ? ' · 示例愿望'
                        : ' · 共同愿望'}
                  </small>
                </span>
              </button>
              {custom.some((item) => item.id === wish.id) && (
                <button
                  className="story-icon-button"
                  aria-label={`删除愿望：${wish.title}`}
                  onClick={() => {
                    setCustom((previous) => previous.filter((item) => item.id !== wish.id));
                    setNotice('已移除本机愿望。');
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </article>
          ))}
      </div>
      {completed.length > 0 && (
        <div className="dream-keepsake">
          <Sparkles size={20} />
          <div>
            <p>已经开花的愿望</p>
            <span>{completed.map((wish) => wish.title).join(' / ')}</span>
          </div>
        </div>
      )}
      <div className="dream-section-heading dream-capsule-heading">
        <h3>
          <LockKeyhole size={18} /> 寄给未来的时间胶囊
        </h3>
        <button
          className="story-text-button"
          onClick={() => {
            setCapsuleForm(!capsuleForm);
            setEditing(null);
            setCapsuleTitle('');
            setCapsuleBody('');
            setCapsuleDate('');
          }}
          aria-expanded={capsuleForm}
        >
          <Plus size={16} /> 新建
        </button>
      </div>
      {capsuleForm && (
        <form className="story-form dream-capsule-form" onSubmit={saveCapsule}>
          <label>
            胶囊的名字
            <input
              value={capsuleTitle}
              onChange={(event) => setCapsuleTitle(event.target.value)}
              required
              maxLength={80}
              placeholder="留给未来的一个小愿望"
            />
          </label>
          <label>
            打开的日期
            <input
              type="date"
              value={capsuleDate}
              onChange={(event) => setCapsuleDate(event.target.value)}
              required
            />
          </label>
          <label>
            想保存的此刻
            <textarea
              value={capsuleBody}
              onChange={(event) => setCapsuleBody(event.target.value)}
              rows={4}
              required
              maxLength={8000}
              placeholder="今天想象的未来，会长成什么模样？"
            />
          </label>
          <button className="story-primary-button" disabled={!ready}>
            <Save size={15} /> {editing ? '保存修改' : '封存这份期待'}
          </button>
        </form>
      )}
      {capsules.length === 0 && !capsuleForm && (
        <div className="dream-capsule-empty">
          <div>
            <LockKeyhole size={24} />
            <p>把一个此刻，留给未来的我们。</p>
          </div>
          <button
            className="story-text-button"
            onClick={() => setCapsuleForm(true)}
            aria-label="创建第一个时间胶囊"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
      <div className="dream-capsules">
        {capsules.map((capsule) => {
          const unlocked = isDateUnlocked(capsule.unlockDate, now, story.timezone);
          return (
            <article className="dream-capsule" key={capsule.id}>
              <div className="dream-capsule-top">
                <button
                  className="dream-capsule-open"
                  onClick={() => {
                    if (unlocked) setOpenCapsule(openCapsule === capsule.id ? null : capsule.id);
                    else
                      setNotice(`等待 ${capsule.unlockDate} 再来打开。你始终可以编辑自己的胶囊。`);
                  }}
                  aria-expanded={openCapsule === capsule.id}
                >
                  <LockKeyhole size={18} />
                  <span>
                    <strong>{capsule.title}</strong>
                    <small>
                      {capsule.unlockDate} · {unlocked ? '可以打开了' : '等待未来'}
                    </small>
                  </span>
                </button>
                <button
                  className="story-icon-button"
                  aria-label={`编辑胶囊：${capsule.title}`}
                  onClick={() => editCapsule(capsule)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="story-icon-button"
                  aria-label={`删除胶囊：${capsule.title}`}
                  onClick={() =>
                    setCapsules((previous) => previous.filter((item) => item.id !== capsule.id))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {unlocked && openCapsule === capsule.id && (
                <p className="dream-capsule-body">{capsule.body}</p>
              )}
            </article>
          );
        })}
      </div>
      {notice && (
        <p className="story-inline-notice" role="status">
          <Check size={15} />
          {notice}
        </p>
      )}
      <p className="story-footnote">
        愿望与胶囊仅保存在当前浏览器，不自动同步或备份。日期锁依赖设备时间，不加密内容；共同编辑与可信定时解锁需要数据库、身份验证和服务端时间校验。
      </p>
      {errors.map((error) => (
        <p key={error} className="story-storage-error" role="status">
          {error}
        </p>
      ))}
    </section>
  );
}
