/**
 * Night lockout clock: sunrise/sunset for Israel's coast (no dependencies).
 *
 * Method: NOAA solar-position / sunrise equation (the NOAA "Solar Calculator" spreadsheet), zenith 90.833 degrees
 * (refraction + solar disc radius). Reference point = Tel Aviv. Israel's coastal strip spans < 1.5 degrees of
 * longitude (a few minutes), so one point serves every beach in the app.
 * The same math lives in SQL: public.is_night_israel() in supabase/migrations/20261103000000_night_lockout.sql.
 * Keep the two in sync (the constants below are mirrored there).
 *
 * Offsets are never hardcoded: local dates/times go through Intl with Asia/Jerusalem, so Israel DST is automatic.
 */

export const REF_LAT = 32.08;
export const REF_LON = 34.78;
export const ZENITH = 90.833;
export const TIME_ZONE = "Asia/Jerusalem";

/**
 * Minutes to close BEFORE sunset (0 = close exactly at sunset). Set to 30 to close half an hour early.
 * Must match the buffer in public.is_night_israel() (SQL).
 */
export const SAFETY_BUFFER_MIN = 0;

const RAD = Math.PI / 180;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);
const tan = (d: number) => Math.tan(d * RAD);

/** Days since 2000-01-01 (UTC date) for a y-m-d. */
function daysSinceJ2000(y: number, m: number, d: number): number {
  return (Date.UTC(y, m - 1, d) - Date.UTC(2000, 0, 1)) / 86_400_000;
}

/** Sunrise and sunset (UTC minutes since 00:00 UTC of that date) for a calendar date. */
function sunMinutesUtc(y: number, m: number, d: number): { rise: number; set: number } {
  const T = daysSinceJ2000(y, m, d) / 36525; // Julian centuries from J2000.0 at 12:00 UTC of the date
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) + sin(2 * M) * (0.019993 - 0.000101 * T) + sin(3 * M) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * sin(omega);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * cos(omega);
  const decl = Math.asin(sin(eps) * sin(lambda)) / RAD;
  const yv = tan(eps / 2) ** 2;
  const eqTime =
    4 *
    (yv * sin(2 * L0) -
      2 * e * sin(M) +
      4 * e * yv * sin(M) * cos(2 * L0) -
      0.5 * yv * yv * sin(4 * L0) -
      1.25 * e * e * sin(2 * M)) /
    RAD;
  const cosHa = cos(ZENITH) / (cos(REF_LAT) * cos(decl)) - tan(REF_LAT) * tan(decl);
  const ha = Math.acos(Math.min(1, Math.max(-1, cosHa))) / RAD; // never polar at 32N
  const noon = 720 - 4 * REF_LON - eqTime;
  return { rise: noon - 4 * ha, set: noon + 4 * ha };
}

export type YMD = { y: number; m: number; d: number };

/** Calendar date in Israel for an instant. */
export function israelDate(at: Date): YMD {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** Sunrise/sunset instants for an Israel calendar date. */
export function sunTimes({ y, m, d }: YMD): { sunrise: Date; sunset: Date } {
  const { rise, set } = sunMinutesUtc(y, m, d);
  const base = Date.UTC(y, m - 1, d);
  return { sunrise: new Date(base + Math.round(rise * 60_000)), sunset: new Date(base + Math.round(set * 60_000)) };
}

/** "HH:mm" in Israel time. */
export function formatIsraelTime(at: Date): string {
  return new Intl.DateTimeFormat("he-IL", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
}

export function addDays({ y, m, d }: YMD, n: number): YMD {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export type DaylightState = {
  isNight: boolean;
  /** Today's closing instant (sunset minus SAFETY_BUFFER_MIN). */
  closesAt: Date;
  /** The next sunrise (today's if before it, else tomorrow's). */
  opensAt: Date;
  /** Whole minutes until opensAt, rounded up; 0 by day. */
  minutesUntilOpen: number;
};

/** Night = before today's sunrise, or at/after today's sunset (minus the buffer). Israel calendar day. */
export function getDaylightState(now: Date = new Date()): DaylightState {
  const today = israelDate(now);
  const { sunrise, sunset } = sunTimes(today);
  const closesAt = new Date(sunset.getTime() - SAFETY_BUFFER_MIN * 60_000);
  const beforeDawn = now.getTime() < sunrise.getTime();
  const isNight = beforeDawn || now.getTime() >= closesAt.getTime();
  const opensAt = beforeDawn ? sunrise : sunTimes(addDays(today, 1)).sunrise;
  return {
    isNight,
    closesAt,
    opensAt,
    minutesUntilOpen: isNight ? Math.max(0, Math.ceil((opensAt.getTime() - now.getTime()) / 60_000)) : 0,
  };
}

/** Serializable form for passing server -> client. */
export type DaylightSnapshot = { isNight: boolean; opensAtMs: number; closesAtMs: number; nowMs: number };

export function toSnapshot(s: DaylightState, now: Date = new Date()): DaylightSnapshot {
  return { isNight: s.isNight, opensAtMs: s.opensAt.getTime(), closesAtMs: s.closesAt.getTime(), nowMs: now.getTime() };
}

/** Hebrew message used by the server actions. */
export function nightClosedMessage(now: Date = new Date()): string {
  return `הים סגור בלילה 🌙 נפתח שוב ב-${formatIsraelTime(getDaylightState(now).opensAt)}`;
}

/** "בעוד 9 שעות ו-20 דקות" (Hebrew relative duration for the night countdown). */
export function formatRemainingHe(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hours = h === 1 ? "שעה" : h === 2 ? "שעתיים" : `${h} שעות`;
  const minutes = m === 1 ? "דקה" : `${m} דקות`;
  if (h === 0) return m === 0 ? "בעוד רגע" : `בעוד ${minutes}`;
  return m === 0 ? `בעוד ${hours}` : `בעוד ${hours} ${m === 1 ? "ודקה" : `ו-${minutes}`}`;
}
