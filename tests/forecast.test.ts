// Pure forecast logic + injectable fetch. No network. Fixtures are trimmed real Open-Meteo responses (Hilton TLV).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as om from "../lib/openMeteo.ts";

const fx = (n: string) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const marine = () => fx("openmeteo-marine-hilton.json");
const weather = () => fx("openmeteo-weather-hilton.json");
const T = (h: number) => Date.parse(`2026-10-29T${String(h).padStart(2, "0")}:00:00+02:00`);

test("directionLabel: 8-point Hebrew compass, wraps and handles bad input", () => {
  assert.equal(om.directionLabel(0), "צפון");
  assert.equal(om.directionLabel(360), "צפון");
  assert.equal(om.directionLabel(359), "צפון");
  assert.equal(om.directionLabel(45), "צפון-מזרח");
  assert.equal(om.directionLabel(90), "מזרח");
  assert.equal(om.directionLabel(180), "דרום");
  assert.equal(om.directionLabel(270), "מערב");
  assert.equal(om.directionLabel(300), "צפון-מערב");
  assert.equal(om.directionLabel(-90), "מערב");
  assert.equal(om.directionLabel(null), null);
  assert.equal(om.directionLabel(NaN), null);
});

test("windHint: east = offshore, west = onshore, north/south = cross, light = calm", () => {
  assert.equal(om.windHint(15, 90), "offshore");
  assert.equal(om.windHint(15, 40), "offshore");
  assert.equal(om.windHint(15, 140), "offshore");
  assert.equal(om.windHint(15, 270), "onshore");
  assert.equal(om.windHint(15, 223), "onshore");
  assert.equal(om.windHint(15, 0), "cross");
  assert.equal(om.windHint(15, 180), "cross");
  assert.equal(om.windHint(3, 270), "calm");
  assert.equal(om.windHint(null, 270), null);
  assert.equal(om.windHint(15, null), null);
});

test("surfScore: bands, period, wind adjustments, clamping and null", () => {
  assert.equal(om.surfScore(null, 10, 5, 90), null);
  assert.equal(om.surfScore(0.1, 3, 20, 270), 1); // flat + onshore stays clamped to 1
  assert.equal(om.surfScore(0.5, null, null, null), 2); // wind unknown => no adjustment
  assert.equal(om.surfScore(0.8, 6, 5, 270), 4); // 3 + 0.5 (period) + 0.5 (calm) = 4
});

test("surfScore: concrete cases", () => {
  // 1.2m (3.5) + 10s (+1) + offshore 15km/h (+0.5) = 5
  assert.equal(om.surfScore(1.2, 10, 15, 90), 5);
  // same swell with strong onshore 25km/h (-1) = 3.5 -> 4
  assert.equal(om.surfScore(1.2, 10, 25, 270), 4);
  // 0.8m (3) + 5s (0) + onshore 14km/h (-0.5) = 2.5 -> 3
  assert.equal(om.surfScore(0.8, 5, 14, 270), 3);
  // 0.8m (3) + 4s (-0.5) + onshore 22 (-1) = 1.5 -> 2
  assert.equal(om.surfScore(0.8, 4, 22, 270), 2);
  // huge 3m (3) + 12s (+1) + offshore 35km/h: no offshore bonus, strong -0.5 => 3.5 -> 4
  assert.equal(om.surfScore(3, 12, 35, 90), 4);
  // always within 1..5
  for (const h of [0, 0.2, 0.7, 1.2, 2, 4]) for (const p of [3, 6, 8, 12]) for (const w of [0, 10, 25, 40]) for (const d of [0, 90, 180, 270]) {
    const s = om.surfScore(h, p, w, d);
    assert.ok(s !== null && s >= 1 && s <= 5);
  }
});

test("mergeForecast: joins marine + weather by time, ISO with Israel offset, sorted", () => {
  const r = om.mergeForecast(marine(), weather());
  assert.equal(r.marineAvailable, true);
  assert.equal(r.windAvailable, true);
  assert.equal(r.points.length, 6);
  const p = r.points[2];
  assert.equal(p.time, "2026-10-29T12:00+02:00");
  assert.equal(p.waveHeight, 0.94);
  assert.equal(p.windSpeed, 20);
  assert.equal(p.windDirection, 232);
  assert.equal(typeof p.seaTemp, "number");
  assert.equal(typeof p.windGusts, "number");
  const times = r.points.map((x: { time: string }) => x.time);
  assert.deepEqual(times, [...times].sort());
});

test("mergeForecast: one side missing, malformed or all-null => flagged, other side kept", () => {
  const noWind = om.mergeForecast(marine(), null);
  assert.equal(noWind.windAvailable, false);
  assert.equal(noWind.marineAvailable, true);
  assert.equal(noWind.points[0].windSpeed, null);
  assert.equal(noWind.points[0].waveHeight, 0.78);

  const noMarine = om.mergeForecast({ hourly: "garbage" }, weather());
  assert.equal(noMarine.marineAvailable, false);
  assert.equal(noMarine.windAvailable, true);
  assert.equal(noMarine.points[0].waveHeight, null);
  assert.equal(noMarine.points[0].windSpeed, 15.8);

  const allNull = marine();
  for (const k of Object.keys(allNull.hourly)) if (k !== "time") allNull.hourly[k] = allNull.hourly[k].map(() => null);
  assert.equal(om.mergeForecast(allNull, weather()).marineAvailable, false);

  const none = om.mergeForecast(undefined, "x");
  assert.deepEqual(none, { points: [], marineAvailable: false, windAvailable: false });
});

test("mergeForecast: null cells inside a valid column stay null (not 0)", () => {
  const m = marine();
  m.hourly.wave_height[1] = null;
  const r = om.mergeForecast(m, weather());
  assert.equal(r.points[1].waveHeight, null);
  assert.equal(r.points[1].wavePeriod, m.hourly.wave_period[1]);
});

test("nearestPoint: closest hour, ties/ends, and too-far data", () => {
  const { points } = om.mergeForecast(marine(), weather());
  assert.equal(om.nearestPoint(points, T(12) + 10 * 60_000)?.time, "2026-10-29T12:00+02:00");
  assert.equal(om.nearestPoint(points, T(12) + 40 * 60_000)?.time, "2026-10-29T13:00+02:00");
  assert.equal(om.nearestPoint(points, T(8))?.time, "2026-10-29T10:00+02:00"); // 2h before first: within 3h
  assert.equal(om.nearestPoint(points, T(23)), null); // 8h after last
  assert.equal(om.nearestPoint([], T(12)), null);
});

test("buildBeachForecast: summary from the now point (fixture, 12:20 Israel time)", () => {
  const f = om.buildBeachForecast(7, marine(), weather(), T(12) + 20 * 60_000);
  assert.ok(f);
  assert.equal(f.beachId, 7);
  assert.equal(f.source, "open-meteo");
  assert.equal(f.now?.time, "2026-10-29T12:00+02:00");
  const s = f.summary;
  assert.equal(s.kind, "automatic-forecast");
  assert.match(s.label, /תחזית אוטומטית/);
  assert.equal(s.waveHeight, 0.94);
  assert.equal(s.windSpeed, 20);
  assert.equal(s.windDirectionLabel, "דרום-מערב"); // 232 deg
  assert.equal(s.windHint, "onshore");
  assert.equal(s.windHintLabel, "אונשור");
  assert.equal(s.todayMinWaveHeight, 0.78);
  assert.equal(s.todayMaxWaveHeight, 1.18);
  assert.ok(s.score !== null && s.score >= 1 && s.score <= 5);
  assert.equal(typeof s.scoreLabel, "string");
});

test("buildBeachForecast: wind API down => waves still returned, hint/score degrade gracefully", () => {
  const f = om.buildBeachForecast(7, marine(), null, T(12));
  assert.ok(f);
  assert.equal(f.windAvailable, false);
  assert.equal(f.summary.windHint, null);
  assert.equal(f.summary.windSpeed, null);
  assert.equal(f.summary.waveHeight, 0.94);
  assert.ok(f.summary.score !== null);
});

test("buildBeachForecast: marine API down => wind only, no score", () => {
  const f = om.buildBeachForecast(7, null, weather(), T(12));
  assert.ok(f);
  assert.equal(f.marineAvailable, false);
  assert.equal(f.summary.waveHeight, null);
  assert.equal(f.summary.score, null);
  assert.equal(f.summary.windHint, "onshore");
});

test("buildBeachForecast: both missing => null", () => {
  assert.equal(om.buildBeachForecast(7, null, null, T(12)), null);
});

test("URLs carry cell_selection=sea, marine vars, kmh and Jerusalem timezone", () => {
  const m = new URL(om.marineUrl(32.0885, 34.7705));
  assert.equal(m.origin + m.pathname, "https://marine-api.open-meteo.com/v1/marine");
  assert.equal(m.searchParams.get("cell_selection"), "sea");
  assert.equal(m.searchParams.get("timezone"), "Asia/Jerusalem");
  assert.equal(m.searchParams.get("forecast_days"), "3");
  assert.match(m.searchParams.get("hourly") ?? "", /swell_wave_height/);
  const w = new URL(om.weatherUrl(32.0885, 34.7705));
  assert.equal(w.origin + w.pathname, "https://api.open-meteo.com/v1/forecast");
  assert.equal(w.searchParams.get("wind_speed_unit"), "kmh");
  assert.equal(w.searchParams.get("hourly"), "wind_speed_10m,wind_direction_10m,wind_gusts_10m");
});

test("fetchBeachForecast: injected fetch, caching options, and every failure mode", async () => {
  const seen: Array<{ url: string; init: RequestInit & { next: { revalidate: number; tags: string[] } } }> = [];
  const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
  const route = (mode: { marine: () => Response | Promise<Response>; weather: () => Response | Promise<Response> }) =>
    async (url: string, init?: unknown) => {
      seen.push({ url, init: init as (typeof seen)[number]["init"] });
      return url.includes("marine-api") ? mode.marine() : mode.weather();
    };
  const now = T(12);

  const good = await om.fetchBeachForecast(7, 32.0885, 34.7705, {
    fetchImpl: route({ marine: () => ok(marine()), weather: () => ok(weather()) }),
    nowMs: now,
  });
  assert.equal(good?.marineAvailable && good?.windAvailable, true);
  assert.equal(seen.length, 2);
  for (const s of seen) {
    assert.equal(s.init.next.revalidate, 1800);
    assert.deepEqual(s.init.next.tags, ["forecast:7"]);
    assert.ok(s.init.signal);
  }

  const non200 = await om.fetchBeachForecast(7, 1, 1, {
    fetchImpl: route({ marine: () => new Response("x", { status: 500 }), weather: () => ok(weather()) }),
    nowMs: now,
  });
  assert.equal(non200?.marineAvailable, false);
  assert.equal(non200?.windAvailable, true);

  const badJson = await om.fetchBeachForecast(7, 1, 1, {
    fetchImpl: route({ marine: () => ok(marine()), weather: () => new Response("<html>", { status: 200 }) }),
    nowMs: now,
  });
  assert.equal(badJson?.windAvailable, false);
  assert.equal(badJson?.marineAvailable, true);

  const throws = await om.fetchBeachForecast(7, 1, 1, {
    fetchImpl: route({ marine: () => { throw new Error("timeout"); }, weather: () => Promise.reject(new Error("net")) }),
    nowMs: now,
  });
  assert.equal(throws, null); // both down => null (route answers 502)
});
