// Open-Meteo marine + weather client, normalization and the surf heuristics.
// Pure except fetchBeachForecast, whose fetch is injectable (tests run without network).
// Only `import type` here on purpose: node --test loads this file directly.
// No secrets: Open-Meteo needs no key. Free for non-commercial use (see docs/DAY10_FORECAST.md).
import type {
  BeachForecast,
  ForecastPoint,
  ForecastSummary,
  ForecastUnits,
  WindHint,
} from "./forecast-types";

export const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
export const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
export const REVALIDATE_SECONDS = 1800; // 30 min
export const FETCH_TIMEOUT_MS = 6000;
export const FORECAST_LABEL = "תחזית אוטומטית (הערכה, לא דיווח גולשים)";

export const UNITS: ForecastUnits = { height: "m", period: "s", direction: "deg", speed: "km/h", temperature: "C" };

const MARINE_VARS = [
  "wave_height",
  "wave_period",
  "wave_direction",
  "swell_wave_height",
  "swell_wave_period",
  "swell_wave_direction",
  "wind_wave_height",
  "sea_surface_temperature",
] as const;
const WEATHER_VARS = ["wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"] as const;

// ---------------------------------------------------------------------------
// Tunable heuristic config
// ---------------------------------------------------------------------------

/**
 * Surf score 1-5. score = round(clamp(heightBase + periodAdj + windAdj, 1, 5)).
 * Edit the numbers here to tune; tests cover the current values.
 * Simplification: ignores tide, swell direction vs. beach orientation and local bathymetry.
 */
export const SCORE_CONFIG = {
  // [upper bound (exclusive) in m, base points]; first match wins. Very big surf is not "better" for most people.
  heightBands: [
    [0.3, 1],
    [0.6, 2],
    [1.0, 3],
    [1.5, 3.5],
    [2.5, 4],
    [Infinity, 3],
  ] as ReadonlyArray<readonly [number, number]>,
  // [min period in s, adjustment]; first match wins (list is descending).
  periodAdj: [
    [9, 1],
    [7, 0.5],
    [5, 0],
    [0, -0.5],
  ] as ReadonlyArray<readonly [number, number]>,
  windCalmKmh: 8, // below this the wind is "calm": +0.5
  calmBonus: 0.5,
  offshoreBonus: 0.5, // offshore and not too strong
  offshoreMaxKmh: 25,
  onshoreMildKmh: 12, // onshore from this speed: -0.5
  onshoreStrongKmh: 20, // onshore from this speed: -1
  anyStrongKmh: 30, // any direction from this speed: extra -0.5
  // Offshore wind blows FROM the east. Angular distance from 90deg:
  offshoreMaxDiffDeg: 60, // <= 60 => offshore (from 30 to 150 deg)
  onshoreMinDiffDeg: 120, // >= 120 => onshore (from 210 to 330 deg)
} as const;

const SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = { 1: "שטוח", 2: "חלש", 3: "סביר", 4: "טוב", 5: "מצוין" };
const WIND_HINT_LABELS: Record<WindHint, string> = {
  offshore: "אופשור",
  onshore: "אונשור",
  cross: "צדדית",
  calm: "רוח חלשה",
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const COMPASS_HE = ["צפון", "צפון-מזרח", "מזרח", "דרום-מזרח", "דרום", "דרום-מערב", "מערב", "צפון-מערב"] as const;

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function numOrNull(v: unknown): number | null {
  return isNum(v) ? v : null;
}

/** Degrees (0 = north, clockwise) to an 8-point Hebrew compass label. Null for non-finite input. */
export function directionLabel(deg: number | null | undefined): string | null {
  if (!isNum(deg)) return null;
  const norm = ((deg % 360) + 360) % 360;
  return COMPASS_HE[Math.round(norm / 45) % 8];
}

/**
 * Offshore/onshore hint for the Israeli coast.
 * SIMPLIFICATION: the whole coast is treated as facing due west, so offshore ~ easterly wind
 * (from 90deg) and onshore ~ westerly wind (from 270deg). Real beaches vary by 10-30deg
 * (e.g. Haifa bay, Ashdod), and sheltered/pointy spots differ. Wind direction is where it blows FROM.
 */
export function windHint(speedKmh: number | null | undefined, fromDeg: number | null | undefined): WindHint | null {
  if (!isNum(speedKmh) || !isNum(fromDeg)) return null;
  if (speedKmh < SCORE_CONFIG.windCalmKmh) return "calm";
  const norm = ((fromDeg % 360) + 360) % 360;
  let diff = Math.abs(norm - 90);
  if (diff > 180) diff = 360 - diff;
  if (diff <= SCORE_CONFIG.offshoreMaxDiffDeg) return "offshore";
  if (diff >= SCORE_CONFIG.onshoreMinDiffDeg) return "onshore";
  return "cross";
}

/** Heuristic 1-5 surf score from wave height (m), period (s) and wind. Null when height is unknown. */
export function surfScore(
  height: number | null | undefined,
  period: number | null | undefined,
  windSpeedKmh: number | null | undefined,
  windFromDeg: number | null | undefined,
): 1 | 2 | 3 | 4 | 5 | null {
  if (!isNum(height)) return null;
  const c = SCORE_CONFIG;
  let pts = (c.heightBands.find(([max]) => height < max) ?? c.heightBands[c.heightBands.length - 1])[1];
  if (isNum(period)) pts += (c.periodAdj.find(([min]) => period >= min) ?? c.periodAdj[c.periodAdj.length - 1])[1];
  const hint = windHint(windSpeedKmh, windFromDeg);
  if (hint && isNum(windSpeedKmh)) {
    if (hint === "calm") pts += c.calmBonus;
    else if (hint === "offshore" && windSpeedKmh <= c.offshoreMaxKmh) pts += c.offshoreBonus;
    else if (hint === "onshore") {
      if (windSpeedKmh >= c.onshoreStrongKmh) pts -= 1;
      else if (windSpeedKmh >= c.onshoreMildKmh) pts -= 0.5;
    }
    if (windSpeedKmh >= c.anyStrongKmh) pts -= 0.5;
  }
  return Math.min(5, Math.max(1, Math.round(pts))) as 1 | 2 | 3 | 4 | 5;
}

/** "+02:00" from an offset in seconds. */
function offsetString(seconds: number): string {
  const sign = seconds < 0 ? "-" : "+";
  const abs = Math.abs(Math.round(seconds / 60));
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

interface Hourly {
  times: string[];
  offset: number;
  col: (name: string) => unknown[];
}

/** Validates the shape: returns the parsed times + a column getter, or null if malformed. */
function readHourly(json: unknown): Hourly | null {
  if (!json || typeof json !== "object") return null;
  const r = json as { utc_offset_seconds?: unknown; hourly?: unknown };
  if (!r.hourly || typeof r.hourly !== "object") return null;
  const hourly = r.hourly as Record<string, unknown>;
  if (!Array.isArray(hourly.time)) return null;
  const times = hourly.time.filter((t): t is string => typeof t === "string");
  if (times.length === 0 || times.length !== hourly.time.length) return null;
  return {
    times,
    offset: isNum(r.utc_offset_seconds) ? r.utc_offset_seconds : 0,
    col: (name) => (Array.isArray(hourly[name]) ? (hourly[name] as unknown[]) : []),
  };
}

/** True if at least one value in one of the columns is a finite number (guards "all-null" responses). */
function hasAnyData(h: Hourly | null, names: readonly string[]): h is Hourly {
  return !!h && names.some((n) => h.col(n).some(isNum));
}

const emptyPoint = (time: string): ForecastPoint => ({
  time,
  waveHeight: null,
  wavePeriod: null,
  waveDirection: null,
  swellHeight: null,
  swellPeriod: null,
  swellDirection: null,
  windWaveHeight: null,
  windSpeed: null,
  windDirection: null,
  windGusts: null,
  seaTemp: null,
});

export interface MergeResult {
  points: ForecastPoint[];
  marineAvailable: boolean;
  windAvailable: boolean;
}

/**
 * Merges marine + weather responses by their local-time key ("2026-10-29T14:00").
 * Either input may be null (failed fetch) or malformed/all-null; that side is then flagged unavailable.
 * Output times are ISO with the Israel offset, sorted ascending.
 */
export function mergeForecast(marineJson: unknown, weatherJson: unknown): MergeResult {
  const marineRaw = readHourly(marineJson);
  const windRaw = readHourly(weatherJson);
  const marine = hasAnyData(marineRaw, MARINE_VARS) ? marineRaw : null;
  const wind = hasAnyData(windRaw, WEATHER_VARS) ? windRaw : null;

  const byKey = new Map<string, ForecastPoint>();
  const getPoint = (key: string, offset: number) => {
    let p = byKey.get(key);
    if (!p) {
      p = emptyPoint(`${key}${offsetString(offset)}`);
      byKey.set(key, p);
    }
    return p;
  };

  if (marine) {
    const c = marine.col;
    marine.times.forEach((t, i) => {
      const p = getPoint(t, marine.offset);
      p.waveHeight = numOrNull(c("wave_height")[i]);
      p.wavePeriod = numOrNull(c("wave_period")[i]);
      p.waveDirection = numOrNull(c("wave_direction")[i]);
      p.swellHeight = numOrNull(c("swell_wave_height")[i]);
      p.swellPeriod = numOrNull(c("swell_wave_period")[i]);
      p.swellDirection = numOrNull(c("swell_wave_direction")[i]);
      p.windWaveHeight = numOrNull(c("wind_wave_height")[i]);
      p.seaTemp = numOrNull(c("sea_surface_temperature")[i]);
    });
  }
  if (wind) {
    const c = wind.col;
    wind.times.forEach((t, i) => {
      const p = getPoint(t, wind.offset);
      p.windSpeed = numOrNull(c("wind_speed_10m")[i]);
      p.windDirection = numOrNull(c("wind_direction_10m")[i]);
      p.windGusts = numOrNull(c("wind_gusts_10m")[i]);
    });
  }

  const points = [...byKey.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([, p]) => p);
  return { points, marineAvailable: !!marine, windAvailable: !!wind };
}

/** The point whose time is closest to `nowMs`; null when empty or farther than maxGapMs (default 3h). */
export function nearestPoint(points: ForecastPoint[], nowMs: number, maxGapMs = 3 * 3600_000): ForecastPoint | null {
  let best: ForecastPoint | null = null;
  let bestDiff = Infinity;
  for (const p of points) {
    const t = Date.parse(p.time);
    if (!Number.isFinite(t)) continue;
    const d = Math.abs(t - nowMs);
    if (d < bestDiff) {
      best = p;
      bestDiff = d;
    }
  }
  return best && bestDiff <= maxGapMs ? best : null;
}

/** Builds the summary from the "now" point and the day's hours (the Israel calendar date of `now`). */
export function buildSummary(points: ForecastPoint[], now: ForecastPoint | null): ForecastSummary {
  const today = now ? now.time.slice(0, 10) : null;
  const heights = today
    ? points.filter((p) => p.time.slice(0, 10) === today && isNum(p.waveHeight)).map((p) => p.waveHeight as number)
    : [];
  const hint = now ? windHint(now.windSpeed, now.windDirection) : null;
  const score = now ? surfScore(now.waveHeight, now.wavePeriod, now.windSpeed, now.windDirection) : null;
  return {
    kind: "automatic-forecast",
    label: FORECAST_LABEL,
    waveHeight: now?.waveHeight ?? null,
    wavePeriod: now?.wavePeriod ?? null,
    waveDirection: now?.waveDirection ?? null,
    waveDirectionLabel: directionLabel(now?.waveDirection),
    windSpeed: now?.windSpeed ?? null,
    windDirection: now?.windDirection ?? null,
    windDirectionLabel: directionLabel(now?.windDirection),
    windHint: hint,
    windHintLabel: hint ? WIND_HINT_LABELS[hint] : null,
    todayMinWaveHeight: heights.length ? Math.min(...heights) : null,
    todayMaxWaveHeight: heights.length ? Math.max(...heights) : null,
    score,
    scoreLabel: score ? SCORE_LABELS[score] : null,
  };
}

/** Assembles the final model from the two (possibly missing) raw responses. Null if there is no data at all. */
export function buildBeachForecast(
  beachId: number,
  marineJson: unknown,
  weatherJson: unknown,
  nowMs: number = Date.now(),
): BeachForecast | null {
  const merged = mergeForecast(marineJson, weatherJson);
  if (!merged.marineAvailable && !merged.windAvailable) return null;
  const now = nearestPoint(merged.points, nowMs);
  return {
    beachId,
    fetchedAt: new Date(nowMs).toISOString(),
    source: "open-meteo",
    units: UNITS,
    marineAvailable: merged.marineAvailable,
    windAvailable: merged.windAvailable,
    points: merged.points,
    now,
    summary: buildSummary(merged.points, now),
  };
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

export function marineUrl(lat: number, lng: number): string {
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: MARINE_VARS.join(","),
    timezone: "Asia/Jerusalem",
    forecast_days: "3",
    // Coastal points can fall on a land grid cell; ask for the nearest sea cell.
    cell_selection: "sea",
  });
  return `${MARINE_URL}?${q}`;
}

export function weatherUrl(lat: number, lng: number): string {
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: WEATHER_VARS.join(","),
    wind_speed_unit: "kmh",
    timezone: "Asia/Jerusalem",
    forecast_days: "3",
  });
  return `${WEATHER_URL}?${q}`;
}

export type FetchLike = (
  url: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
) => Promise<Response>;

/** One upstream call. Never throws: any failure (timeout, network, non-200, bad JSON) gives null. */
async function getJson(fetchImpl: FetchLike, url: string, beachId: number): Promise<unknown> {
  try {
    const res = await fetchImpl(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS, tags: [`forecast:${beachId}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches both APIs in parallel and normalizes. Returns null only when BOTH fail / have no data
 * (the route maps that to 502 forecast_unavailable). If one fails the other is returned with a flag.
 */
export async function fetchBeachForecast(
  beachId: number,
  lat: number,
  lng: number,
  opts: { fetchImpl?: FetchLike; nowMs?: number } = {},
): Promise<BeachForecast | null> {
  const f: FetchLike = opts.fetchImpl ?? ((url, init) => fetch(url, init));
  const [marine, weather] = await Promise.all([
    getJson(f, marineUrl(lat, lng), beachId),
    getJson(f, weatherUrl(lat, lng), beachId),
  ]);
  return buildBeachForecast(beachId, marine, weather, opts.nowMs);
}
