// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/chart.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const c = mod as any;

test("linearScale maps and handles a degenerate domain", () => {
  const s = c.linearScale(0, 2, 100, 0);
  assert.equal(s(0), 100);
  assert.equal(s(1), 50);
  assert.equal(s(2), 0);
  assert.equal(c.linearScale(1, 1, 7, 9)(5), 7);
});

test("niceYAxis: 0..max, at most 4 intervals", () => {
  assert.deepEqual(c.niceYAxis(0.8), { max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] });
  assert.deepEqual(c.niceYAxis(1.7).ticks, [0, 0.5, 1, 1.5, 2]);
  assert.deepEqual(c.niceYAxis(3.2).ticks, [0, 1, 2, 3, 4]);
  assert.equal(c.niceYAxis(0).max, 0.5);
  assert.equal(c.niceYAxis(NaN).max, 0.5);
});

test("buildLinePath breaks at null gaps", () => {
  const p = c.buildLinePath([
    { x: 0, y: 10 },
    { x: 10, y: 20 },
    { x: 20, y: null },
    { x: 30, y: 5 },
    { x: 40, y: 6 },
  ]);
  assert.equal((p.match(/M/g) ?? []).length, 2);
  assert.ok(p.startsWith("M0 10C"));
  assert.ok(p.includes("M30 5C"));
  assert.equal(c.buildLinePath([{ x: 0, y: null }]), "");
  assert.equal(c.buildLinePath([]), "");
});

test("buildLinePath: single point dot, and monotone (no overshoot)", () => {
  assert.equal(c.buildLinePath([{ x: 5, y: 7 }]), "M5 7L5 7");
  const p: string = c.buildLinePath([
    { x: 0, y: 10 },
    { x: 10, y: 10 },
    { x: 20, y: 0 },
  ]);
  const ys = [...p.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2]));
  assert.ok(ys.every((y) => y >= 0 && y <= 10));
});

test("buildAreaPath closes each run to the baseline and skips lone points", () => {
  const a = c.buildAreaPath(
    [
      { x: 0, y: 1 },
      { x: 10, y: 2 },
      { x: 20, y: null },
      { x: 30, y: 3 },
    ],
    100
  );
  assert.equal((a.match(/Z/g) ?? []).length, 1);
  assert.ok(a.includes("L10 100L0 100Z"));
});

test("nearestIndex picks the closest x", () => {
  const xs = [0, 10, 20, 30];
  assert.equal(c.nearestIndex(xs, -5), 0);
  assert.equal(c.nearestIndex(xs, 4), 0);
  assert.equal(c.nearestIndex(xs, 6), 1);
  assert.equal(c.nearestIndex(xs, 25), 2);
  assert.equal(c.nearestIndex(xs, 99), 3);
  assert.equal(c.nearestIndex([], 1), -1);
  assert.equal(c.nearestIndex([5], 1), 0);
});

test("arrowRotation: from + 180, normalized", () => {
  assert.equal(c.arrowRotation(0), 180); // from north -> travels south
  assert.equal(c.arrowRotation(270), 90); // from west -> travels east (onshore)
  assert.equal(c.arrowRotation(90), 270);
  assert.equal(c.arrowRotation(200), 20);
  assert.equal(c.arrowRotation(-90), 90);
});

test("dayLabel / groupDays use Asia/Jerusalem dates", () => {
  // 2026-10-29 22:30 UTC = 2026-10-30 00:30 Israel (UTC+2): "today" is already Friday there.
  const now = Date.parse("2026-10-29T22:30:00Z");
  assert.equal(c.israelDateKey(now), "2026-10-30");
  assert.equal(c.dayLabel("2026-10-30", "2026-10-30"), "היום");
  assert.equal(c.dayLabel("2026-10-31", "2026-10-30"), "מחר");
  assert.equal(c.dayLabel("2026-11-01", "2026-10-30"), "ראשון");
  assert.equal(c.dayLabel("2026-10-30", "2026-10-28"), "שישי");
  const times = ["2026-10-30T22:00+02:00", "2026-10-30T23:00+02:00", "2026-10-31T00:00+02:00", "2026-10-31T01:00+02:00"];
  assert.deepEqual(c.groupDays(times, now), [
    { key: "2026-10-30", label: "היום", start: 0, end: 1 },
    { key: "2026-10-31", label: "מחר", start: 2, end: 3 },
  ]);
  assert.equal(c.dayLabel("2027-01-01", "2026-12-31"), "מחר"); // month/year rollover
});

test("time substring helpers and startIndex", () => {
  assert.equal(c.hourOf("2026-10-29T14:00+02:00"), 14);
  assert.equal(c.hhmmOf("2026-10-29T14:00+02:00"), "14:00");
  const times = ["2026-10-29T10:00+02:00", "2026-10-29T11:00+02:00", "2026-10-29T12:00+02:00"];
  assert.equal(c.startIndex(times, Date.parse("2026-10-29T09:30:00+02:00")), 0);
  assert.equal(c.startIndex(times, Date.parse("2026-10-29T11:20:00+02:00")), 1);
  assert.equal(c.startIndex(times, Date.parse("2026-10-30T00:00:00+02:00")), 2);
  assert.equal(c.startIndex([], 0), -1);
});
