"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ForecastPoint, WindHint } from "@/lib/forecast-types";
import { directionLabel, windHint } from "@/lib/openMeteo";
import {
  buildAreaPath,
  buildLinePath,
  dayLabel,
  groupDays,
  hhmmOf,
  hourOf,
  israelDateKey,
  linearScale,
  nearestIndex,
  niceYAxis,
  startIndex,
  type XY,
} from "@/lib/chart";
import { cn } from "@/lib/utils";
import { DirectionArrow } from "./DirectionArrow";

type Range = "48" | "72";

const H = 208;
const PAD_L = 32;
const PAD_R = 14;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 132;
const ROW_HOUR = 148;
const ROW_DAY = 164;
const ROW_WIND = 184;
const ROW_WIND_TXT = 201;
const DEFAULT_W = 360;
const HOUR_MS = 3600_000;

const HINT_LABELS: Record<WindHint, string> = {
  offshore: "אופשור",
  onshore: "אונשור",
  cross: "צדדית",
  calm: "רוח חלשה",
};

// Full class names (Tailwind scans for literals). Offshore = green token, everything else = muted token.
const WIND_CLASS = {
  offshore: { stroke: "stroke-chart-wind-offshore", fill: "fill-chart-wind-offshore" },
  other: { stroke: "stroke-chart-wind-other", fill: "fill-chart-wind-other" },
} as const;

const num = (n: number, d = 1) => n.toFixed(d);

/** One-sentence description of an hour, for the live region. */
function describe(p: ForecastPoint, today: string): string {
  const parts = [`${dayLabel(p.time.slice(0, 10), today)} ${hhmmOf(p.time)}`];
  parts.push(p.waveHeight !== null ? `גל ${num(p.waveHeight)} מטר` : "אין נתון על הגל");
  if (p.wavePeriod !== null) parts.push(`מחזור ${Math.round(p.wavePeriod)} שניות`);
  const wd = directionLabel(p.waveDirection);
  if (wd) parts.push(`גל מגיע מ${wd}`);
  if (p.windSpeed !== null) {
    const h = windHint(p.windSpeed, p.windDirection);
    const wdl = directionLabel(p.windDirection);
    parts.push(`רוח ${Math.round(p.windSpeed)} קמ"ש${wdl ? ` מ${wdl}` : ""}${h ? `, ${HINT_LABELS[h]}` : ""}`);
  }
  return parts.join(", ");
}

/**
 * Hand-rolled SVG wave forecast: wave height area+line, swell dashed line, wind arrows row.
 * Time flows left-to-right on purpose (dir="ltr" on the chart wrapper); Hebrew text stays RTL inside.
 */
export function WaveChart({
  points,
  marineAvailable,
  nowMs: initialNow,
}: {
  points: ForecastPoint[];
  marineAvailable: boolean;
  /** Server render time, so SSR and hydration agree on the window. */
  nowMs: number;
}) {
  const uid = useId().replace(/:/g, "");
  const [range, setRange] = useState<Range>("48");
  const [sel, setSel] = useState<number | null>(null);
  const [width, setWidth] = useState(DEFAULT_W);
  const [nowMs, setNowMs] = useState(initialNow);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => setWidth(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 5 * 60_000);
    return () => clearInterval(t);
  }, []);

  const win = useMemo(() => {
    const s = Math.max(0, startIndex(points.map((p) => p.time), nowMs));
    return range === "48" ? points.slice(s, s + 49) : points;
  }, [points, range, nowMs]);

  const hasWaves = marineAvailable && win.some((p) => p.waveHeight !== null);

  if (win.length < 2 || !hasWaves) {
    return (
      <div className="card-coast p-5 text-center text-body-sm text-muted-text" role="status">
        גרף הגלים לא זמין כרגע
      </div>
    );
  }

  const times = win.map((p) => Date.parse(p.time));
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const x = linearScale(t0, t1, PAD_L, width - PAD_R);
  const xs = times.map(x);

  const dataMax = Math.max(0, ...win.flatMap((p) => [p.waveHeight ?? 0, p.swellHeight ?? 0]));
  const axis = niceYAxis(dataMax);
  const y = linearScale(0, axis.max, PLOT_BOTTOM, PLOT_TOP);

  const wavePts: XY[] = win.map((p, i) => ({ x: xs[i], y: p.waveHeight === null ? null : y(p.waveHeight) }));
  const swellPts: XY[] = win.map((p, i) => ({ x: xs[i], y: p.swellHeight === null ? null : y(p.swellHeight) }));
  const line = buildLinePath(wavePts);
  const area = buildAreaPath(wavePts, PLOT_BOTTOM);
  const swell = buildLinePath(swellPts);

  const days = groupDays(win.map((p) => p.time), nowMs);
  const today = israelDateKey(nowMs);
  const nowX = nowMs >= t0 && nowMs <= t1 ? x(nowMs) : null;

  const pxPerHour = (width - PAD_L - PAD_R) / Math.max(1, (t1 - t0) / HOUR_MS);
  const windStep = pxPerHour * 3 >= 22 ? 3 : 6;

  const selPoint = sel !== null ? win[sel] : null;
  const selX = sel !== null ? xs[sel] : 0;

  const moveTo = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const i = nearestIndex(xs, ((clientX - r.left) * width) / (r.width || width));
    if (i >= 0) setSel(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = win.length - 1;
    const nowIdx = Math.max(0, nearestIndex(times, nowMs));
    let next: number | null = null;
    if (e.key === "ArrowRight") next = sel === null ? nowIdx : Math.min(last, sel + 1);
    else if (e.key === "ArrowLeft") next = sel === null ? nowIdx : Math.max(0, sel - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Escape") {
      setSel(null);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      setSel(next);
    }
  };

  const heights = win.flatMap((p) => (p.waveHeight === null ? [] : [p.waveHeight]));
  const lo = Math.min(...heights);
  const hi = Math.max(...heights);
  const captionId = `${uid}-cap`;
  const windColor = (h: WindHint | null) => (h === "offshore" ? WIND_CLASS.offshore : WIND_CLASS.other);

  return (
    <figure aria-labelledby={captionId} className="card-coast flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="טווח זמן" className="flex gap-2">
          {(
            [
              ["48", "48 שעות"],
              ["72", "3 ימים"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={range === v}
              onClick={() => {
                setRange(v);
                setSel(null);
              }}
              className="chip-coast min-h-touch"
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="flex items-center gap-3 text-caption text-muted-text" aria-hidden>
          <li className="flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" className="stroke-chart-wave" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            גל
          </li>
          <li className="flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" className="stroke-chart-swell" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            סוול
          </li>
        </ul>
      </div>

      <div
        ref={wrapRef}
        dir="ltr"
        tabIndex={0}
        role="group"
        aria-roledescription="גרף אינטראקטיבי"
        aria-label="גרף גובה גל. חצים ימינה ושמאלה לבחירת שעה"
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => moveTo(e.clientX)}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setSel(null);
        }}
        className="relative rounded-xl [touch-action:pan-y]"
      >
        <svg
          key={range}
          viewBox={`0 0 ${width} ${H}`}
          width="100%"
          height={H}
          aria-hidden
          className="block h-auto w-full select-none font-sans"
        >
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--chart-fill-top)", stopOpacity: 0.55 }} />
              <stop offset="1" style={{ stopColor: "var(--chart-fill-bottom)", stopOpacity: 0.06 }} />
            </linearGradient>
          </defs>

          {axis.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={width - PAD_R}
                y1={y(t)}
                y2={y(t)}
                className="stroke-chart-grid"
                strokeWidth="1"
              />
              <text x={PAD_L - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-text text-caption">
                {t}
              </text>
            </g>
          ))}

          {days.map((d, i) => {
            const x0 = xs[d.start];
            const x1 = xs[d.end];
            const mid = (x0 + x1) / 2;
            return (
              <g key={d.key}>
                {i > 0 ? (
                  <line
                    x1={x0}
                    x2={x0}
                    y1={PLOT_TOP}
                    y2={ROW_DAY + 4}
                    className="stroke-chart-grid"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ) : null}
                {x1 - x0 >= 36 ? (
                  <text x={mid} y={ROW_DAY} textAnchor="middle" className="fill-ink text-caption font-semibold">
                    {d.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {win.map((p, i) =>
            hourOf(p.time) % 6 === 0 ? (
              <text key={p.time} x={xs[i]} y={ROW_HOUR} textAnchor="middle" className="fill-muted-text text-caption">
                {String(hourOf(p.time)).padStart(2, "0")}
              </text>
            ) : null
          )}

          <path d={area} fill={`url(#${uid}-fill)`} className="motion-chart-fade" />
          {swell ? (
            <path
              d={swell}
              fill="none"
              className="stroke-chart-swell motion-chart-fade"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <path
            d={line}
            pathLength={1}
            fill="none"
            className="stroke-chart-wave motion-chart-draw"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {nowX !== null ? (
            <g>
              <line x1={nowX} x2={nowX} y1={PLOT_TOP - 4} y2={PLOT_BOTTOM} className="stroke-chart-now" strokeWidth="1.5" />
              <text
                x={Math.min(Math.max(nowX, PAD_L + 16), width - PAD_R - 16)}
                y={PLOT_TOP - 9}
                textAnchor="middle"
                className="fill-ink text-caption font-semibold"
              >
                עכשיו
              </text>
            </g>
          ) : null}

          <text x={PAD_L - 6} y={ROW_WIND} textAnchor="end" dominantBaseline="middle" className="fill-muted-text text-caption">
            רוח
          </text>
          <text x={PAD_L - 6} y={ROW_WIND_TXT} textAnchor="end" dominantBaseline="middle" className="fill-muted-text text-caption">
            קמ&quot;ש
          </text>
          {win.map((p, i) => {
            if (hourOf(p.time) % windStep !== 0 || p.windSpeed === null) return null;
            const h = windHint(p.windSpeed, p.windDirection);
            const cls = windColor(h);
            return (
              <g key={p.time}>
                {p.windDirection !== null ? (
                  <g transform={`translate(${xs[i]} ${ROW_WIND}) rotate(${(p.windDirection + 180) % 360})`}>
                    <path
                      d="M0 -6V6M0 -6L-3.5 -2M0 -6L3.5 -2"
                      fill="none"
                      className={cls.stroke}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : null}
                <text x={xs[i]} y={ROW_WIND_TXT} textAnchor="middle" dominantBaseline="middle" className={cn(cls.fill, "text-caption font-semibold")}>
                  {Math.round(p.windSpeed)}
                </text>
              </g>
            );
          })}

          {selPoint ? (
            <g>
              <line x1={selX} x2={selX} y1={PLOT_TOP} y2={PLOT_BOTTOM} className="stroke-chart-now" strokeWidth="1" strokeDasharray="2 3" />
              {selPoint.waveHeight !== null ? (
                <circle cx={selX} cy={y(selPoint.waveHeight)} r="5" className="fill-white stroke-chart-wave" strokeWidth="2.5" />
              ) : null}
            </g>
          ) : null}
        </svg>

        {selPoint ? (
          <div
            dir="rtl"
            className="card-coast pointer-events-none absolute top-0 z-10 flex w-max max-w-[min(15rem,90%)] flex-col gap-0.5 rounded-xl px-3! py-2! text-caption text-copy shadow-raised"
            style={{ left: Math.min(Math.max(selX, 80), width - 80), transform: "translateX(-50%)" }}
          >
            <span className="font-semibold text-ink">
              {dayLabel(selPoint.time.slice(0, 10), today)} <bdi>{hhmmOf(selPoint.time)}</bdi>
            </span>
            <span>
              {selPoint.waveHeight !== null ? (
                <>
                  גל <bdi>{num(selPoint.waveHeight)}</bdi> מ&apos;
                  {selPoint.wavePeriod !== null ? (
                    <>
                      {" "}
                      · <bdi>{Math.round(selPoint.wavePeriod)}</bdi> שנ&apos;
                    </>
                  ) : null}
                </>
              ) : (
                "אין נתון על הגל"
              )}
            </span>
            {selPoint.waveDirection !== null ? (
              <span className="flex items-center gap-1">
                <DirectionArrow fromDeg={selPoint.waveDirection} className="size-3" />
                {directionLabel(selPoint.waveDirection)}
              </span>
            ) : null}
            {selPoint.windSpeed !== null ? (
              <span className="flex flex-wrap items-center gap-1">
                {selPoint.windDirection !== null ? <DirectionArrow fromDeg={selPoint.windDirection} className="size-3" /> : null}
                רוח <bdi>{Math.round(selPoint.windSpeed)}</bdi> קמ&quot;ש
                {(() => {
                  const h = windHint(selPoint.windSpeed, selPoint.windDirection);
                  return h ? <span className={cn("font-semibold", h === "offshore" && "text-success")}>· {HINT_LABELS[h]}</span> : null;
                })()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selPoint ? describe(selPoint, today) : ""}
      </div>

      <figcaption id={captionId} className="text-caption text-muted-text">
        גובה גל ({range === "48" ? "48 השעות הקרובות" : "3 ימים"}): בין <bdi>{num(lo)}</bdi> ל-<bdi>{num(hi)}</bdi> מ&apos;.
        גררו או השתמשו בחצים לפרטי שעה. תחזית אוטומטית, לא דיווח גולשים.
      </figcaption>

      <table className="sr-only">
        <caption>ערכי תחזית כל 6 שעות</caption>
        <thead>
          <tr>
            <th scope="col">שעה</th>
            <th scope="col">גובה גל (מטר)</th>
            <th scope="col">מחזור (שניות)</th>
            <th scope="col">כיוון גל</th>
            <th scope="col">רוח (קמ&quot;ש)</th>
          </tr>
        </thead>
        <tbody>
          {win
            .filter((p) => hourOf(p.time) % 6 === 0)
            .map((p) => (
              <tr key={p.time}>
                <th scope="row">
                  {dayLabel(p.time.slice(0, 10), today)} {hhmmOf(p.time)}
                </th>
                <td>{p.waveHeight !== null ? num(p.waveHeight) : "אין נתון"}</td>
                <td>{p.wavePeriod !== null ? Math.round(p.wavePeriod) : "אין נתון"}</td>
                <td>{directionLabel(p.waveDirection) ?? "אין נתון"}</td>
                <td>{p.windSpeed !== null ? Math.round(p.windSpeed) : "אין נתון"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
