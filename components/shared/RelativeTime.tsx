"use client";

import { useSyncExternalStore } from "react";

const TZ = "Asia/Jerusalem";

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });

const WEEKDAYS: Record<string, string> = {
  Sun: "א׳",
  Mon: "ב׳",
  Tue: "ג׳",
  Wed: "ד׳",
  Thu: "ה׳",
  Fri: "ו׳",
  Sat: "ש׳",
};

function get(date: Date) {
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    weekday: WEEKDAYS[p.weekday] ?? "",
    date: `${p.day}.${p.month}`,
    time: `${p.hour}:${p.minute}`,
  };
}

/** "יום ג׳ 28.10, 07:42" */
export function formatAbsolute(iso: string): string {
  const d = get(new Date(iso));
  return `יום ${d.weekday} ${d.date}, ${d.time}`;
}

export function formatRelative(iso: string, nowMs: number): string {
  const then = new Date(iso);
  const diffMin = Math.floor((nowMs - then.getTime()) / 60000);
  if (diffMin < 1) return "עכשיו";
  if (diffMin < 60) return diffMin === 1 ? "לפני דקה" : `לפני ${diffMin} דקות`;

  if (dayKey.format(then) === dayKey.format(nowMs)) {
    const h = Math.floor(diffMin / 60);
    if (h === 1) return "לפני שעה";
    if (h === 2) return "לפני שעתיים";
    return `לפני ${h} שעות`;
  }
  const d = get(then);
  const yesterday = dayKey.format(nowMs - 24 * 3600 * 1000) === dayKey.format(then);
  return yesterday ? `אתמול ${d.time}` : d.date;
}

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 60_000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

// Snapshot is the current minute, so it is stable between ticks.
const getSnapshot = () => Math.floor(Date.now() / 60000) * 60000;
// null on the server and during hydration -> deterministic absolute text, no mismatch.
const getServerSnapshot = () => null;

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const absolute = formatAbsolute(iso);
  return (
    <time dateTime={iso} title={absolute} aria-label={absolute} className={className}>
      {now === null ? absolute : formatRelative(iso, now)}
    </time>
  );
}
