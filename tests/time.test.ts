import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addCalendarDays,
  calendarMidnight,
  durationParts,
  getElapsedTime,
  getZonedParts,
  isAnniversaryToday,
  isDateUnlocked,
  nextAnniversary,
  nextAnnualOccurrence,
  parseCalendarDate,
} from '../src/lib/time';

test('calendar parser rejects invalid dates instead of rolling into another month', () => {
  assert.equal(parseCalendarDate('2025-02-29'), null);
  assert.equal(parseCalendarDate('2026-13-01'), null);
  assert.equal(parseCalendarDate('2026-1-01'), null);
  assert.deepEqual(parseCalendarDate('2024-02-29'), { year: 2024, month: 2, day: 29 });
  assert.equal(parseCalendarDate(null), null);
});

test('relationship starts at Shanghai midnight, independent of the host timezone', () => {
  const now = new Date('2026-01-02T16:01:02Z');
  assert.deepEqual(getElapsedTime('2026-01-01', now), {
    days: 2,
    hours: 0,
    minutes: 1,
    seconds: 2,
    totalSeconds: 172862,
  });
  assert.equal(getElapsedTime(null, now), null);
  assert.equal(getElapsedTime('2027-01-01', now), null);
});

test('midnight conversion respects summer and winter DST offsets', () => {
  assert.equal(
    calendarMidnight({ year: 2026, month: 3, day: 8 }, 'America/New_York'),
    Date.parse('2026-03-08T05:00:00Z'),
  );
  assert.equal(
    calendarMidnight({ year: 2026, month: 3, day: 9 }, 'America/New_York'),
    Date.parse('2026-03-09T04:00:00Z'),
  );
  assert.equal(
    calendarMidnight({ year: 2026, month: 11, day: 2 }, 'America/New_York'),
    Date.parse('2026-11-02T05:00:00Z'),
  );
});

test('anniversary crosses New Year and never treats relationship start as year one', () => {
  assert.equal(
    nextAnniversary('2025-01-01', new Date('2026-12-31T16:00:00Z')),
    Date.parse('2026-12-31T16:00:00Z'),
  );
  assert.equal(
    nextAnniversary('2026-01-01', new Date('2025-12-31T16:00:00Z')),
    Date.parse('2026-12-31T16:00:00Z'),
  );
  assert.equal(
    nextAnniversary('2025-01-01', new Date('2027-01-01T16:00:00Z')),
    Date.parse('2027-12-31T16:00:00Z'),
  );
});

test('Feb 29 birthday and anniversary clamp to Feb 28 in non-leap years', () => {
  assert.equal(
    nextAnnualOccurrence('02-29', new Date('2026-02-27T00:00:00Z')),
    Date.parse('2026-02-27T16:00:00Z'),
  );
  assert.equal(
    nextAnnualOccurrence('02-29', new Date('2028-02-27T00:00:00Z')),
    Date.parse('2028-02-28T16:00:00Z'),
  );
  assert.equal(isAnniversaryToday('2024-02-29', new Date('2026-02-28T02:00:00Z')), true);
});

test('same-day birthday is today all day and next year after the configured day ends', () => {
  assert.equal(
    nextAnnualOccurrence('11-05', new Date('2026-11-05T15:59:59Z')),
    Date.parse('2026-11-04T16:00:00Z'),
  );
  assert.equal(
    nextAnnualOccurrence('11-05', new Date('2026-11-05T16:00:00Z')),
    Date.parse('2027-11-04T16:00:00Z'),
  );
});

test('letter date unlock uses Shanghai date boundary and rejects malformed dates', () => {
  assert.equal(isDateUnlocked('2026-11-06', new Date('2026-11-05T15:59:59Z')), false);
  assert.equal(isDateUnlocked('2026-11-06', new Date('2026-11-05T16:00:00Z')), true);
  assert.equal(isDateUnlocked('invalid', new Date()), false);
  assert.equal(isDateUnlocked(null), true);
});

test('calendar milestones preserve calendar days across leap year', () => {
  assert.equal(addCalendarDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addCalendarDays('2024-02-28', 2), '2024-03-01');
  assert.equal(addCalendarDays('2026-12-31', 1), '2027-01-01');
});

test('countdowns do not become negative and timezone parts match local boundary', () => {
  assert.deepEqual(durationParts(-1000), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  assert.deepEqual(getZonedParts(Date.parse('2026-11-05T16:00:00Z')), {
    year: 2026,
    month: 11,
    day: 6,
    hour: 0,
    minute: 0,
    second: 0,
  });
});
