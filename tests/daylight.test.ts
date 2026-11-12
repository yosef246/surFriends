// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/daylight.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const d = mod as any;

// Reference: https://api.sunrise-sunset.org/json?lat=32.08&lng=34.78&date=<date>&formatted=0 (fetched once, 2026-11-03).
const REF: Record<string, { sunrise: string; sunset: string }> = {
  "2026-06-21": { sunrise: "2026-06-21T02:35:05Z", sunset: "2026-06-21T16:50:17Z" }, // 05:35 / 19:50 IDT
  "2026-12-21": { sunrise: "2026-12-21T04:37:24Z", sunset: "2026-12-21T14:40:23Z" }, // 06:37 / 16:40 IST
  "2026-03-27": { sunrise: "2026-03-27T03:35:31Z", sunset: "2026-03-27T15:57:00Z" },
  "2026-03-29": { sunrise: "2026-03-29T03:32:57Z", sunset: "2026-03-29T15:58:22Z" },
  "2026-10-25": { sunrise: "2026-10-25T03:51:52Z", sunset: "2026-10-25T14:58:02Z" },
  "2026-11-03": { sunrise: "2026-11-03T03:59:13Z", sunset: "2026-11-03T14:49:39Z" },
};
const min = (a: Date, iso: string) => Math.abs(a.getTime() - Date.parse(iso)) / 60_000;
const ymd = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return { y, m, d: dd };
};

test("daylight: sunrise/sunset match the reference within 3 minutes", () => {
  for (const [date, ref] of Object.entries(REF)) {
    const t = d.sunTimes(ymd(date));
    assert.ok(min(t.sunrise, ref.sunrise) <= 3, `${date} sunrise off by ${min(t.sunrise, ref.sunrise)}`);
    assert.ok(min(t.sunset, ref.sunset) <= 3, `${date} sunset off by ${min(t.sunset, ref.sunset)}`);
  }
});

test("daylight: Israel-time strings", () => {
  const june = d.sunTimes(ymd("2026-06-21"));
  assert.equal(d.formatIsraelTime(june.sunset), "19:50");
  const dec = d.sunTimes(ymd("2026-12-21"));
  assert.equal(d.formatIsraelTime(dec.sunrise), "06:37");
  assert.equal(d.formatIsraelTime(dec.sunset), "16:40");
});

test("daylight: DST transitions come from Intl (no hardcoded offsets)", () => {
  // Start of DST: Friday 2026-03-27 02:00. The UTC instant barely moves, the local clock jumps an hour.
  const mar26 = d.sunTimes(ymd("2026-03-26")).sunrise;
  const mar27 = d.sunTimes(ymd("2026-03-27")).sunrise;
  assert.equal(d.formatIsraelTime(mar26).slice(0, 4), "05:3");
  assert.equal(d.formatIsraelTime(mar27).slice(0, 4), "06:3");
  assert.ok(Math.abs(mar26.getTime() + 86_400_000 - mar27.getTime()) < 5 * 60_000); // same UTC time of day +-drift
  // End of DST: Sunday 2026-10-25. Local sunrise goes 06:5x -> 05:5x.
  assert.equal(d.formatIsraelTime(d.sunTimes(ymd("2026-10-24")).sunrise).slice(0, 2), "06");
  assert.equal(d.formatIsraelTime(d.sunTimes(ymd("2026-10-25")).sunrise).slice(0, 2), "05");
  // Israel calendar date near midnight: 22:30Z in winter is already the next day (UTC+2).
  assert.deepEqual(d.israelDate(new Date("2026-12-21T22:30:00Z")), { y: 2026, m: 12, d: 22 });
  assert.deepEqual(d.israelDate(new Date("2026-06-21T20:30:00Z")), { y: 2026, m: 6, d: 21 }); // 23:30 IDT
});

test("daylight: first/last light (civil twilight) match the reference", () => {
  // https://api.sunrise-sunset.org/json?lat=32.08&lng=34.78&date=<date>&tzid=Asia/Jerusalem (fetched 2026-11-12)
  const civil: Record<string, [string, string]> = { "2026-11-12": ["05:41", "17:08"], "2026-06-21": ["05:06", "20:18"] };
  for (const [date, [first, last]] of Object.entries(civil)) {
    const t = d.lightTimes(ymd(date));
    assert.equal(d.formatIsraelTime(t.firstLight), first, `${date} first light`);
    assert.equal(d.formatIsraelTime(t.lastLight), last, `${date} last light`);
  }
});

test("daylight: getDaylightState opens at first light and closes at last light", () => {
  const day = d.getDaylightState(new Date("2026-06-21T09:00:00Z")); // noon IDT
  assert.equal(day.isNight, false);
  assert.equal(day.minutesUntilOpen, 0);
  assert.equal(d.formatIsraelTime(day.closesAt), "20:18");

  // still open in the ~28 minutes after sunset (19:50)
  assert.equal(d.getDaylightState(new Date("2026-06-21T17:00:00Z")).isNight, false); // 20:00 IDT
  const eve = d.getDaylightState(new Date("2026-06-21T17:19:00Z")); // 20:19 IDT
  assert.equal(eve.isNight, true);
  assert.equal(d.formatIsraelTime(eve.opensAt).slice(0, 4), "05:0");
  assert.ok(eve.minutesUntilOpen > 500 && eve.minutesUntilOpen < 560, String(eve.minutesUntilOpen));

  const dawn = d.getDaylightState(new Date("2026-06-21T01:00:00Z")); // 04:00 IDT, before first light
  assert.equal(dawn.isNight, true);
  assert.ok(dawn.opensAt.getTime() > Date.parse("2026-06-21T02:00:00Z") && dawn.opensAt.getTime() < Date.parse("2026-06-21T02:10:00Z"));
  assert.ok(dawn.minutesUntilOpen > 60 && dawn.minutesUntilOpen < 70);
  // open before sunrise (05:35): dawn patrol
  assert.equal(d.getDaylightState(new Date("2026-06-21T02:15:00Z")).isNight, false); // 05:15 IDT
});

test("daylight: night message carries the opening time; buffer defaults to 0", () => {
  assert.equal(d.SAFETY_BUFFER_MIN, 0);
  assert.match(d.nightClosedMessage(new Date("2026-12-21T20:00:00Z")), /^הים סגור בלילה 🌙 נפתח שוב ב-06:1\d$/);
});

test("daylight: Hebrew remaining-time wording", () => {
  assert.equal(d.formatRemainingHe(560), "בעוד 9 שעות ו-20 דקות");
  assert.equal(d.formatRemainingHe(60), "בעוד שעה");
  assert.equal(d.formatRemainingHe(121), "בעוד שעתיים ודקה");
  assert.equal(d.formatRemainingHe(45), "בעוד 45 דקות");
  assert.equal(d.formatRemainingHe(1), "בעוד דקה");
  assert.equal(d.formatRemainingHe(0), "בעוד רגע");
});
