// Pure helpers for the hand-rolled forecast chart. No imports: node --test loads this file directly.

export type XY = { x: number; y: number | null };

const TZ = "Asia/Jerusalem";
const WEEKDAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;

/** Linear map domain -> range. Degenerate domain maps everything to the range start. */
export function linearScale(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  if (d0 === d1) return () => r0;
  const k = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
}

/** Y axis in meters: 0..max with at most `maxTicks` intervals on a "nice" step. */
export function niceYAxis(dataMax: number, maxTicks = 4): { max: number; ticks: number[] } {
  const m = Number.isFinite(dataMax) && dataMax > 0 ? dataMax : 0.5;
  const steps = [0.25, 0.5, 1, 2, 5, 10];
  const step = steps.find((s) => Math.ceil(m / s) <= maxTicks) ?? 10;
  const n = Math.max(1, Math.ceil(m / step));
  const ticks = Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 100) / 100);
  return { max: ticks[ticks.length - 1], ticks };
}

/** Splits into runs of consecutive non-null points (a null breaks the line). */
export function splitRuns(pts: XY[]): { x: number; y: number }[][] {
  const runs: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  for (const p of pts) {
    if (p.y === null || !Number.isFinite(p.y)) {
      if (cur.length) runs.push(cur);
      cur = [];
    } else {
      cur.push({ x: p.x, y: p.y });
    }
  }
  if (cur.length) runs.push(cur);
  return runs;
}

const f = (n: number) => (Math.round(n * 100) / 100).toString();

/** Fritsch-Carlson monotone tangents: smooth but never overshoots (no fake negative waves). */
function tangents(run: { x: number; y: number }[]): number[] {
  const n = run.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((run[i + 1].y - run[i].y) / (run[i + 1].x - run[i].x || 1));
  const m = new Array<number>(n).fill(0);
  m[0] = d[0] ?? 0;
  m[n - 1] = d[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return m;
}

function runPath(run: { x: number; y: number }[]): string {
  if (run.length === 1) return `M${f(run[0].x)} ${f(run[0].y)}L${f(run[0].x)} ${f(run[0].y)}`;
  const m = tangents(run);
  let d = `M${f(run[0].x)} ${f(run[0].y)}`;
  for (let i = 0; i < run.length - 1; i++) {
    const a = run[i];
    const b = run[i + 1];
    const dx = (b.x - a.x) / 3;
    d += `C${f(a.x + dx)} ${f(a.y + m[i] * dx)} ${f(b.x - dx)} ${f(b.y - m[i + 1] * dx)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

/** Smooth line; one sub-path (M...) per run, so null gaps stay empty. "" when there is no data. */
export function buildLinePath(pts: XY[]): string {
  return splitRuns(pts).map(runPath).join("");
}

/** Closed area under the line down to `baseY`, one shape per run (lone points are skipped). */
export function buildAreaPath(pts: XY[], baseY: number): string {
  return splitRuns(pts)
    .map((r) => (r.length < 2 ? "" : `${runPath(r)}L${f(r[r.length - 1].x)} ${f(baseY)}L${f(r[0].x)} ${f(baseY)}Z`))
    .join("");
}

/** Index of the x closest to `x` (xs ascending). -1 when empty. */
export function nearestIndex(xs: number[], x: number): number {
  if (xs.length === 0) return -1;
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  return Math.abs(xs[lo] - x) <= Math.abs(xs[hi] - x) ? lo : hi;
}

/** Direction arrows: values are where wind/waves come FROM; the arrow points where they travel (+180). */
export function arrowRotation(fromDeg: number): number {
  return (((fromDeg + 180) % 360) + 360) % 360;
}

/** Points carry the Israel offset ("2026-10-29T14:00+02:00"), so local date/hour are just substrings. */
export const dateKeyOf = (time: string) => time.slice(0, 10);
export const hourOf = (time: string) => Number(time.slice(11, 13));
export const hhmmOf = (time: string) => time.slice(11, 16);

/** "YYYY-MM-DD" of an instant in Asia/Jerusalem. */
export function israelDateKey(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
}

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Hebrew day name for a date key relative to today: "היום", "מחר", else the weekday ("שישי"). */
export function dayLabel(key: string, todayKey: string): string {
  if (key === todayKey) return "היום";
  if (key === addDays(todayKey, 1)) return "מחר";
  const [y, m, d] = key.split("-").map(Number);
  return WEEKDAYS_HE[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export type DayGroup = { key: string; label: string; start: number; end: number };

/** Consecutive indexes sharing an Israel calendar date, with their Hebrew label. */
export function groupDays(times: string[], nowMs: number): DayGroup[] {
  const today = israelDateKey(nowMs);
  const out: DayGroup[] = [];
  times.forEach((t, i) => {
    const key = dateKeyOf(t);
    const last = out[out.length - 1];
    if (last && last.key === key) last.end = i;
    else out.push({ key, label: dayLabel(key, today), start: i, end: i });
  });
  return out;
}

/** Index of the latest point at or before `nowMs` (0 if all are in the future, -1 if empty). */
export function startIndex(times: string[], nowMs: number): number {
  let idx = -1;
  for (let i = 0; i < times.length; i++) {
    if (Date.parse(times[i]) <= nowMs) idx = i;
    else break;
  }
  return times.length === 0 ? -1 : Math.max(idx, 0);
}
