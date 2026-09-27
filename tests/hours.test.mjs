// node --test tests/
// Opening-hours logic behind the live "Open now" status. Published hours:
// Saturday–Thursday 08:00–20:00, closed Fridays; classes 08:00–10:00 and
// 16:00–18:00. All in Bangkok time (UTC+7, no daylight saving).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { status } = createRequire(import.meta.url)('../assets/hours.js');

/* A Bangkok wall-clock time as the instant it really is (UTC−7h). */
const bkk = (y, mo, d, h, mi) => new Date(Date.UTC(y, mo - 1, d, h - 7, mi));

// 2026-10-01 is a Thursday.
test('Thursday 07:59 — closed, opens this morning', () => {
  const s = status(bkk(2026, 10, 1, 7, 59));
  assert.equal(s.open, false);
  assert.equal(s.dayIndex, 3);
  assert.equal(s.gym, 'Closed now, opens at 08:00');
  assert.equal(s.classes, 'Next class today at 08:00');
});

test('Thursday 08:00 — open, first class running', () => {
  const s = status(bkk(2026, 10, 1, 8, 0));
  assert.equal(s.open, true);
  assert.equal(s.classNow, true);
  assert.equal(s.gym, 'Open now until 20:00');
  assert.equal(s.classes, 'Class on now until 10:00');
});

test('Thursday 10:30 — open between classes', () => {
  const s = status(bkk(2026, 10, 1, 10, 30));
  assert.equal(s.open, true);
  assert.equal(s.classNow, false);
  assert.equal(s.classes, 'Next class today at 16:00');
});

test('Thursday 19:59 — still open, next class skips Friday', () => {
  const s = status(bkk(2026, 10, 1, 19, 59));
  assert.equal(s.open, true);
  assert.equal(s.classes, 'Next class Saturday at 08:00');
});

test('Thursday 20:00 — closed until Saturday', () => {
  const s = status(bkk(2026, 10, 1, 20, 0));
  assert.equal(s.open, false);
  assert.equal(s.gym, 'Closed now, opens Saturday at 08:00');
  assert.equal(s.classes, 'Next class Saturday at 08:00');
});

test('Friday midday — closed all day', () => {
  const s = status(bkk(2026, 10, 2, 12, 0));
  assert.equal(s.open, false);
  assert.equal(s.dayIndex, 4);
  assert.equal(s.gym, 'Closed on Fridays, opens tomorrow at 08:00');
  assert.equal(s.classes, 'Next class tomorrow at 08:00');
});

test('Saturday 16:15 — afternoon class running', () => {
  const s = status(bkk(2026, 10, 3, 16, 15));
  assert.equal(s.open, true);
  assert.equal(s.classNow, true);
  assert.equal(s.dayIndex, 5);
  assert.equal(s.classes, 'Class on now until 18:00');
});

test('Saturday 18:00 — class just ended, next one tomorrow', () => {
  const s = status(bkk(2026, 10, 3, 18, 0));
  assert.equal(s.open, true);
  assert.equal(s.classNow, false);
  assert.equal(s.classes, 'Next class tomorrow at 08:00');
});

test('Sunday 23:30 — closed, opens Monday', () => {
  const s = status(bkk(2026, 10, 4, 23, 30));
  assert.equal(s.open, false);
  assert.equal(s.dayIndex, 6);
  assert.equal(s.gym, 'Closed now, opens tomorrow at 08:00');
});

test('Wednesday 20:30 — closed, opens Thursday', () => {
  const s = status(bkk(2026, 9, 30, 20, 30));
  assert.equal(s.open, false);
  assert.equal(s.gym, 'Closed now, opens tomorrow at 08:00');
});

test('Thursday 00:30 in Bangkok is still Wednesday in UTC', () => {
  const s = status(bkk(2026, 10, 1, 0, 30));
  assert.equal(s.dayIndex, 3);
  assert.equal(s.gym, 'Closed now, opens at 08:00');
});
