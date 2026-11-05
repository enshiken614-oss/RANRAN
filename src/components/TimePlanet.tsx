'use client';

import { useEffect, useState } from 'react';
import { useStory } from '@/components/StoryProvider';
import {
  addCalendarDays,
  calendarKey,
  calendarMidnight,
  durationParts,
  formatDate,
  getElapsedTime,
  getZonedParts,
  isValidTimeZone,
  nextAnniversary,
  nextAnnualOccurrence,
  parseCalendarDate,
  type DurationParts,
} from '@/lib/time';
import './time.css';

function Timer({ value, compact = false }: { value: DurationParts | null; compact?: boolean }) {
  const entries = [
    [value?.days, '天'],
    [value?.hours, '小时'],
    [value?.minutes, '分钟'],
    [value?.seconds, '秒'],
  ] as const;
  return (
    <div
      className={`time-digits ${compact ? 'time-digits--compact' : ''}`}
      aria-label={
        value
          ? `${value.days} 天 ${value.hours} 小时 ${value.minutes} 分 ${value.seconds} 秒`
          : '日期待填写'
      }
    >
      {entries.map(([number, label], index) => (
        <div className="time-unit" key={label}>
          {index > 0 && (
            <span className="time-separator" aria-hidden="true">
              :
            </span>
          )}
          <span className="time-number">
            {number === undefined ? '—' : String(number).padStart(2, '0')}
          </span>
          <span className="time-unit-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function OrbitMark() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="time-orbit-mark" aria-hidden="true">
      <circle cx="80" cy="80" r="49" stroke="currentColor" strokeOpacity=".25" />
      <circle cx="80" cy="80" r="67" stroke="currentColor" strokeOpacity=".1" />
      <ellipse
        cx="80"
        cy="80"
        rx="77"
        ry="24"
        transform="rotate(-32 80 80)"
        stroke="currentColor"
        strokeOpacity=".45"
      />
      <circle cx="80" cy="80" r="23" fill="url(#time-orb)" />
      <circle cx="139" cy="40" r="3" fill="#e3cfac" />
      <defs>
        <radialGradient id="time-orb">
          <stop stopColor="#ead9b8" />
          <stop offset="1" stopColor="#73635a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function TimePlanet() {
  const story = useStory();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const zoneValid = isValidTimeZone(story.timezone);
  const zone = zoneValid ? story.timezone : 'Asia/Shanghai';
  const start = parseCalendarDate(story.identity.startDate);
  const futureStart = now && start && calendarMidnight(start, zone) > now.getTime();
  const elapsed = now ? getElapsedTime(story.identity.startDate, now, zone) : null;
  const anniversary = now ? nextAnniversary(story.identity.startDate, now, zone) : null;
  const birthday = now ? nextAnnualOccurrence(story.identity.herBirthday, now, zone) : null;
  const remaining = (epoch: number | null) =>
    epoch !== null && now ? durationParts(epoch - now.getTime()) : null;
  const milestones = [100, 365, 1000];
  return (
    <section className="time-planet" aria-label="时间星球">
      <div className="planet-panel-intro">
        <span className="eyebrow">OUR TIME · 时间星球</span>
        <h2>因为你，时间有了意义。</h2>
        <p>把每一秒，慢慢写成我们的故事。</p>
      </div>
      {!zoneValid && (
        <p className="time-config-note" role="status">
          时区配置无效，当前使用 Asia/Shanghai。请检查 ourStory.ts。
        </p>
      )}
      <div className="time-main-card">
        <OrbitMark />
        <div className="time-main-heading">
          <span className="eyebrow">EVERY SECOND WITH YOU</span>
          <h3>我们一起走过了</h3>
        </div>
        <Timer value={elapsed} />
        <p className="time-origin">
          {start
            ? futureStart
              ? '我们的故事即将开始 · ' + formatDate(story.identity.startDate, zone)
              : '故事始于 ' + formatDate(story.identity.startDate, zone)
            : '在配置中填下相爱的第一天，时间便会开始记录。'}
        </p>
        <div className="time-live-caption">
          <span className="time-live-dot" aria-hidden="true" />
          {now
            ? new Intl.DateTimeFormat('zh-CN', {
                timeZone: zone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hourCycle: 'h23',
              }).format(now)
            : '正在与星光对时'}
          <span>{zone}</span>
        </div>
      </div>
      <div className="time-countdown-grid">
        <article className="time-countdown-card">
          <span className="time-small-symbol" aria-hidden="true">
            ✧
          </span>
          <span className="eyebrow">OUR NEXT CHAPTER</span>
          <h3>下一次相爱周年</h3>
          <Timer compact value={remaining(anniversary)} />
          <p>
            {anniversary !== null
              ? new Intl.DateTimeFormat('zh-CN', {
                  timeZone: zone,
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(anniversary)
              : '等待填写恋爱开始日期'}
          </p>
        </article>
        <article className="time-countdown-card">
          <span className="time-small-symbol" aria-hidden="true">
            ☾
          </span>
          <span className="eyebrow">THE DAY YOU ARRIVED</span>
          <h3>{story.identity.herName}的生日</h3>
          <Timer compact value={remaining(birthday)} />
          <p>
            {birthday !== null
              ? new Intl.DateTimeFormat('zh-CN', {
                  timeZone: zone,
                  month: 'long',
                  day: 'numeric',
                }).format(birthday)
              : '等待填写她的生日'}
          </p>
        </article>
      </div>
      {story.anniversaries.length > 0 && (
        <div className="time-dates">
          <div className="time-section-heading">
            <h3>值得记住的日子</h3>
            <span>OUR LITTLE LANDMARKS</span>
          </div>
          {story.anniversaries.map((item) => {
            const parsed = parseCalendarDate(item.date);
            const target =
              now && parsed
                ? item.recurring
                  ? nextAnnualOccurrence(item.date, now, zone)
                  : calendarMidnight(parsed, zone)
                : null;
            const passed =
              target !== null && now !== null && target < now.getTime() && !item.recurring;
            const sameDay =
              target !== null &&
              now !== null &&
              calendarKey(getZonedParts(target, zone)) === calendarKey(getZonedParts(now, zone));
            return (
              <article className="time-date-row" key={item.id}>
                <span className="time-date-icon" aria-hidden="true">
                  ✦
                </span>
                <div>
                  <h4>{item.title}</h4>
                  <p>
                    {formatDate(item.date, zone)}
                    {item.recurring && parsed ? ' · 每年纪念' : ''}
                  </p>
                </div>
                <span className="time-date-distance">
                  {target === null || !now
                    ? '待填写'
                    : sameDay
                      ? '就是今天'
                      : passed
                        ? '已珍藏'
                        : target <= now.getTime()
                          ? '就是今天'
                          : `${Math.ceil((target - now.getTime()) / 86_400_000)} 天后`}
                </span>
              </article>
            );
          })}
        </div>
      )}
      <div className="time-milestones">
        <div className="time-section-heading">
          <h3>时间的纪念章</h3>
          <span>SMALL DAYS, ENDLESS MEANING</span>
        </div>
        <div className="time-milestone-grid">
          {milestones.map((days) => {
            const date = story.identity.startDate
              ? addCalendarDays(story.identity.startDate, days)
              : null;
            const reached =
              now && date && parseCalendarDate(date)
                ? calendarMidnight(parseCalendarDate(date)!, zone) <= now.getTime()
                : false;
            return (
              <article className={`time-milestone ${reached ? 'is-reached' : ''}`} key={days}>
                <span className="time-milestone-star" aria-hidden="true">
                  ✧
                </span>
                <strong>{days}</strong>
                <span>个一起走过的日夜</span>
                <small>{date ? formatDate(date, zone) : '等待故事开始'}</small>
                {reached && <em>已点亮</em>}
              </article>
            );
          })}
        </div>
      </div>
      <p className="time-footnote">
        日期依照 {zone} 计算 · 2 月 29 日的周年与生日在平年于 2 月 28 日纪念。
      </p>
    </section>
  );
}

export default TimePlanet;
