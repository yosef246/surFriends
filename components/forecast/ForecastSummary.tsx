import type { BeachForecast } from "@/lib/forecast-types";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { WaveStrip } from "@/components/shared/WaveStrip";
import { cn } from "@/lib/utils";
import { DirectionArrow } from "./DirectionArrow";

const m1 = (n: number) => n.toFixed(1);

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-caption font-medium text-white/90">{label}</dt>
      <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body font-medium text-white">{children}</dd>
    </div>
  );
}

/** "Now" hero card. Server component. Always labelled as an automatic forecast, never as a surfer report. */
export function ForecastSummary({ forecast }: { forecast: BeachForecast }) {
  const { summary: s, now, marineAvailable, windAvailable } = forecast;
  const hasRange = s.todayMinWaveHeight !== null && s.todayMaxWaveHeight !== null;
  const hint = s.windHint;

  return (
    <section
      aria-labelledby="forecast-now-title"
      className="motion-pop-in relative overflow-hidden rounded-card bg-hero-sea p-5 pb-14 text-white shadow-hero"
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="forecast-now-title" className="eyebrow eyebrow-light">
            עכשיו בחוף
          </h2>
          <span className="inline-flex h-5 items-center rounded-pill bg-white/15 px-2 text-caption font-medium text-white ring-1 ring-white/30">
            אוטומטי
          </span>
        </div>

        {marineAvailable && s.waveHeight !== null ? (
          <div className="flex items-end gap-5">
            <p className="numeral font-display text-numeral-xl font-normal text-white!">
              {m1(s.waveHeight)}
              <span className="text-unit text-white/90">מ&apos;</span>
            </p>
            {s.wavePeriod !== null ? (
              <p className="numeral pb-1 font-display text-numeral-md font-normal text-white!">
                {Math.round(s.wavePeriod)}
                <span className="text-unit text-white/90">שנ&apos;</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-body font-medium text-white">
            {marineAvailable ? "גובה הגל לא זמין לשעה הזו" : "נתוני גלים לא זמינים כרגע"}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {marineAvailable && s.waveDirection !== null ? (
            <Stat label="כיוון הגל (מגיע מ...)">
              <DirectionArrow fromDeg={s.waveDirection} />
              <span>{s.waveDirectionLabel}</span>
            </Stat>
          ) : null}

          {windAvailable && s.windSpeed !== null ? (
            <Stat label="רוח">
              {s.windDirection !== null ? <DirectionArrow fromDeg={s.windDirection} /> : null}
              <span>
                <bdi className="numeral text-white!">{Math.round(s.windSpeed)}</bdi> קמ&quot;ש
              </span>
              {s.windDirectionLabel ? <span className="text-body-sm text-white/90">{s.windDirectionLabel}</span> : null}
              {s.windHintLabel ? (
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-pill px-2.5 text-caption font-semibold",
                    hint === "offshore"
                      ? "bg-success text-success-foreground"
                      : "bg-white/15 text-white ring-1 ring-white/30"
                  )}
                >
                  {hint === "offshore" ? "✓ " : ""}
                  {s.windHintLabel}
                </span>
              ) : null}
            </Stat>
          ) : !windAvailable ? (
            <Stat label="רוח">
              <span className="text-body-sm">לא זמין כרגע</span>
            </Stat>
          ) : null}

          {now?.seaTemp != null ? (
            <Stat label="טמפרטורת מים">
              <bdi className="numeral text-white!">{Math.round(now.seaTemp)}°</bdi>
            </Stat>
          ) : null}

          {hasRange ? (
            <Stat label="היום (מינימום–מקסימום)">
              <span>
                <bdi className="numeral text-white!">
                  {m1(s.todayMinWaveHeight!)}–{m1(s.todayMaxWaveHeight!)}
                </bdi>{" "}
                מ&apos;
              </span>
            </Stat>
          ) : null}

          {s.score !== null ? (
            <Stat label="ציון תחזית">
              <span
                role="img"
                aria-label={`ציון תחזית ${s.score} מתוך 5, ${s.scoreLabel ?? ""}`}
                className="flex items-center gap-2"
              >
                <span aria-hidden className="numeral font-display text-numeral-md font-normal text-white!">
                  {s.score}
                  <span className="text-unit text-white/90">/5</span>
                </span>
                <span aria-hidden className="flex flex-col gap-1">
                  <span className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-2.5 rounded-full border",
                          i <= s.score! ? "border-aqua bg-aqua" : "border-white/50 bg-transparent"
                        )}
                      />
                    ))}
                  </span>
                  <span className="text-body-sm text-white/90">{s.scoreLabel}</span>
                </span>
              </span>
            </Stat>
          ) : null}
        </dl>

        <p className="text-caption text-white/90">
          {s.label} · עודכן <RelativeTime iso={forecast.fetchedAt} />
        </p>
      </div>
      <WaveStrip />
    </section>
  );
}
