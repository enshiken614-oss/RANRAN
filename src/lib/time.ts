/** Calendar dates are interpreted in the configured IANA timezone, never browser local time. */
export const DEFAULT_TIME_ZONE = 'Asia/Shanghai';
const DAY = 86_400_000;

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}
export interface ZonedParts extends CalendarDate {
  hour: number;
  minute: number;
  second: number;
}
export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function utcDate(year: number, month: number, day: number): number {
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, day);
  result.setUTCHours(0, 0, 0, 0);
  return result.getTime();
}

export function parseCalendarDate(value: string | null | undefined): CalendarDate | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(utcDate(year, month, day));
  if (
    year < 1 ||
    year > 9999 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  )
    return null;
  return { year, month, day };
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getZonedParts(
  value: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(value)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, Number(p.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

export function calendarKey(value: CalendarDate): string {
  return `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
}

/** Resolve local midnight using timezone offsets, including DST on the target day. */
export function calendarMidnight(value: CalendarDate, timeZone = DEFAULT_TIME_ZONE): number {
  const desired = utcDate(value.year, value.month, value.day);
  let instant = desired;
  for (let i = 0; i < 6; i += 1) {
    const actual = getZonedParts(instant, timeZone);
    const wall =
      utcDate(actual.year, actual.month, actual.day) +
      actual.hour * 3_600_000 +
      actual.minute * 60_000 +
      actual.second * 1000;
    const correction = desired - wall;
    if (!correction) return instant;
    instant += correction;
  }
  // A few zones skip midnight during a historical transition. Use the first
  // valid instant on that local date instead of silently crossing a date boundary.
  const center = instant;
  let first: number | null = null;
  for (let delta = -180; delta <= 180; delta += 1) {
    const candidate = center + delta * 60_000;
    if (calendarKey(getZonedParts(candidate, timeZone)) === calendarKey(value))
      first = first === null ? candidate : Math.min(first, candidate);
  }
  if (first !== null) return first;
  throw new RangeError(`Calendar date ${calendarKey(value)} does not exist in ${timeZone}`);
}

export function durationParts(milliseconds: number): DurationParts {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

export function getElapsedTime(
  startDate: string | null,
  now: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): DurationParts | null {
  const parsed = parseCalendarDate(startDate);
  if (!parsed) return null;
  const beginning = calendarMidnight(parsed, timeZone);
  const current = Number(now);
  return current < beginning ? null : durationParts(current - beginning);
}

function daysInMonth(year: number, month: number): number {
  return new Date(utcDate(year, month + 1, 1) - DAY).getUTCDate();
}

/** Feb 29 anniversaries fall on Feb 28 in non-leap years. Same-day events remain "today" all day. */
export function nextAnnualOccurrence(
  value: string | null,
  now: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
  minimumYear = 1,
): number | null {
  if (!value) return null;
  const parsed = parseCalendarDate(value.length === 5 ? `2000-${value}` : value);
  if (!parsed) return null;
  const today = getZonedParts(now, timeZone);
  let year = Math.max(today.year, minimumYear);
  let candidate = {
    year,
    month: parsed.month,
    day: Math.min(parsed.day, daysInMonth(year, parsed.month)),
  };
  if (calendarKey(candidate) < calendarKey(today)) {
    year += 1;
    candidate = {
      year,
      month: parsed.month,
      day: Math.min(parsed.day, daysInMonth(year, parsed.month)),
    };
  }
  return calendarMidnight(candidate, timeZone);
}

export function nextAnniversary(
  startDate: string | null,
  now: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): number | null {
  const parsed = parseCalendarDate(startDate);
  return parsed ? nextAnnualOccurrence(startDate, now, timeZone, parsed.year + 1) : null;
}

export function isDateUnlocked(
  unlockDate: string | null,
  now: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): boolean {
  if (!unlockDate) return true;
  const parsed = parseCalendarDate(unlockDate);
  return parsed !== null && calendarKey(getZonedParts(now, timeZone)) >= calendarKey(parsed);
}

export function isAnniversaryToday(
  startDate: string | null,
  now: Date | number = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): boolean {
  const parsed = parseCalendarDate(startDate);
  if (!parsed) return false;
  const today = getZonedParts(now, timeZone);
  return (
    today.year > parsed.year &&
    today.month === parsed.month &&
    today.day === Math.min(parsed.day, daysInMonth(today.year, parsed.month))
  );
}

export function formatDate(value: string | null, timeZone = DEFAULT_TIME_ZONE): string {
  const parsed = parseCalendarDate(value);
  if (!parsed) return '日期待填写';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(calendarMidnight(parsed, timeZone));
}

export function addCalendarDays(date: string, days: number): string | null {
  const parsed = parseCalendarDate(date);
  if (!parsed) return null;
  const result = new Date(utcDate(parsed.year, parsed.month, parsed.day) + days * DAY);
  return calendarKey({
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  });
}
