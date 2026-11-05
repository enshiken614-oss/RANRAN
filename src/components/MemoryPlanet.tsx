'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Expand,
  FlipHorizontal,
  Grid2X2,
  ImageOff,
  List,
  Play,
  X,
} from 'lucide-react';
import type { Memory } from '@/config/ourStory';
import { useStory } from '@/components/StoryProvider';
import { isStringArray, useLocalData } from '@/lib/useLocalData';
import './story-panels.css';

function MemoryImage({ memory, large = false }: { memory: Memory; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed || !memory.src)
    return (
      <div className="memory-fallback">
        <ImageOff size={26} />
        <span>这段回忆，等你放进来</span>
      </div>
    );
  if (memory.type === 'video') {
    if (large)
      return (
        <video
          className="memory-media"
          src={memory.src}
          poster={memory.poster}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
          你的浏览器不支持播放这段视频。
        </video>
      );
    return (
      <div className="memory-video-preview">
        {memory.poster ? (
          <img src={memory.poster} alt="" loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <div className="memory-video-gradient" />
        )}
        <Play size={32} />
        <span>视频回忆</span>
      </div>
    );
  }
  return (
    <img
      className="memory-media"
      src={memory.src}
      alt={memory.title}
      loading={large ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  );
}

export function MemoryPlanet({ onExplore }: { onExplore?: () => void }) {
  const story = useStory();
  const [category, setCategory] = useState('全部');
  const [timeline, setTimeline] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [favorites, setFavorites, storage] = useLocalData<string[]>(
    'hu:memory-favorites:v1',
    [],
    isStringArray,
  );
  const categories = ['全部', ...new Set(story.memories.map((memory) => memory.category))];
  const memories = story.memories
    .filter(
      (memory) =>
        (category === '全部' || memory.category === category) &&
        (!onlyFavorites || favorites.includes(memory.id)),
    )
    .sort((a, b) => (timeline ? (a.date ?? '9999').localeCompare(b.date ?? '9999') : 0));
  const selected = memories.find((memory) => memory.id === active);
  const selectedIndex = memories.findIndex((memory) => memory.id === active);
  function toggleFavorite(id: string) {
    setFavorites((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }
  function open(id: string) {
    setActive(id);
    setZoom(false);
    onExplore?.();
  }

  if (selected)
    return (
      <section className="story-panel memory-detail" aria-label="回忆故事">
        <div className="story-toolbar">
          <button className="story-text-button" onClick={() => setActive(null)}>
            <ArrowLeft size={16} /> 回到长廊
          </button>
          <span>
            {selectedIndex + 1} / {memories.length}
          </span>
        </div>
        <div className={`memory-detail-art ${zoom ? 'is-zoomed' : ''}`}>
          <MemoryImage key={selected.id} memory={selected} large />
          {selected.type !== 'video' && (
            <button
              className="memory-expand"
              onClick={() => setZoom(!zoom)}
              aria-label={zoom ? '缩小照片' : '放大照片'}
            >
              {zoom ? <X size={18} /> : <Expand size={18} />}
            </button>
          )}
        </div>
        <div className="memory-story-heading">
          <div>
            <p className="story-eyebrow">A MOMENT, FOREVER</p>
            <h3>{selected.title}</h3>
          </div>
          <button
            className={`story-icon-button ${favorites.includes(selected.id) ? 'is-active' : ''}`}
            aria-label={favorites.includes(selected.id) ? '取消收藏' : '收藏回忆'}
            aria-pressed={favorites.includes(selected.id)}
            disabled={!storage.ready}
            onClick={() => toggleFavorite(selected.id)}
          >
            <Bookmark size={19} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="story-muted">
          {selected.date || '日期待填写'} <span aria-hidden="true">·</span>{' '}
          {selected.location || '地点待填写'}
        </p>
        <p className="memory-story-text">{selected.story}</p>
        <div className="memory-switcher">
          <button
            className="story-text-button"
            disabled={memories.length < 2}
            onClick={() =>
              open(memories[(selectedIndex - 1 + memories.length) % memories.length].id)
            }
          >
            <ArrowLeft size={16} /> 上一段回忆
          </button>
          <button
            className="story-text-button"
            disabled={memories.length < 2}
            onClick={() => open(memories[(selectedIndex + 1) % memories.length].id)}
          >
            下一段回忆 <ArrowRight size={16} />
          </button>
        </div>
      </section>
    );

  return (
    <section className="story-panel" aria-label="记忆博物馆">
      <div className="story-intro">
        <p>有些瞬间很轻，却值得被好好收藏。</p>
        <span>
          {story.memories.some((memory) => memory.isExample)
            ? '以下为原创插画与待填写示例，等待换成我们的回忆。'
            : '在这里，让我们的照片、声音与故事慢慢生长。'}
        </span>
      </div>
      <div className="memory-controls">
        <div className="story-tabs" aria-label="相册分类">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'is-selected' : ''}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="memory-view-controls">
          <button
            className={`story-icon-button ${onlyFavorites ? 'is-active' : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            aria-label="只看收藏"
            aria-pressed={onlyFavorites}
          >
            <Bookmark size={17} />
          </button>
          <button
            className="story-icon-button"
            onClick={() => setTimeline(!timeline)}
            aria-label={timeline ? '切换照片墙' : '切换时间长廊'}
            aria-pressed={timeline}
          >
            {timeline ? <Grid2X2 size={17} /> : <List size={17} />}
          </button>
        </div>
      </div>
      <div className={timeline ? 'memory-timeline' : 'memory-masonry'}>
        {memories.map((memory, index) => (
          <article
            key={memory.id}
            className={`memory-polaroid ${flipped.includes(memory.id) ? 'is-flipped' : ''}`}
            style={{ '--tilt': `${index % 2 === 0 ? -1.4 : 1.3}deg` } as React.CSSProperties}
          >
            {timeline && <p className="memory-date">{memory.date || '等待记录的某一天'}</p>}
            <button
              className="memory-photo-button"
              onClick={() => open(memory.id)}
              aria-label={`查看${memory.title}的故事`}
            >
              <MemoryImage memory={memory} />
              <div className="memory-back">
                <span>THE STORY BEHIND</span>
                <p>{memory.story}</p>
                <span>点击读完整故事 ↗</span>
              </div>
            </button>
            <div className="memory-caption">
              <button onClick={() => open(memory.id)}>
                <h3>{memory.title}</h3>
                <p>{memory.location || '地点待填写'}</p>
              </button>
              <div>
                <button
                  onClick={() =>
                    setFlipped((previous) =>
                      previous.includes(memory.id)
                        ? previous.filter((id) => id !== memory.id)
                        : [...previous, memory.id],
                    )
                  }
                  aria-label={`翻转${memory.title}`}
                  aria-pressed={flipped.includes(memory.id)}
                >
                  <FlipHorizontal size={16} />
                </button>
                <button
                  disabled={!storage.ready}
                  onClick={() => toggleFavorite(memory.id)}
                  aria-label={`${favorites.includes(memory.id) ? '取消收藏' : '收藏'}${memory.title}`}
                  aria-pressed={favorites.includes(memory.id)}
                >
                  {favorites.includes(memory.id) ? <Check size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {memories.length === 0 && (
        <div className="story-empty">
          <Bookmark size={25} />
          <p>
            {onlyFavorites
              ? '还没有收藏，去留住一个喜欢的瞬间吧。'
              : '这间展厅正在等待第一段回忆。'}
          </p>
        </div>
      )}
      <p className="story-footnote">
        收藏仅保存在当前浏览器。{storage.error && <span role="status"> {storage.error}</span>}
      </p>
    </section>
  );
}
