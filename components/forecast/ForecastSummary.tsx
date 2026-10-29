import { Droplets, Gauge, Waves, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { WaveLevel } from "@/components/shared/WaveLevel";
import type { BeachForecast } from "@/lib/forecast-types";
import { waveHeightLevel } from "@/lib/wave-level";
import { cn } from "@/lib/utils";
import { DirectionArrow } from "./DirectionArrow";

const m1 = (n: number) => n.toFixed(1);

function Cell({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="data-cell">
      <dt className="data-label">
        {icon}
        {label}
      </dt>
      <dd className="flex flex-col gap-1.5">{children}</dd>
    </div>
  );
}

const Unavailable = ({ text }: { text: string }) => <span className="text-body-sm font-semibold text-muted-text">{text}</span>;

/** "מצב הים עכשיו" DataGrid (DESIGN_SYSTEM 5e). Server component. Always labelled as an automatic forecast. */
export function ForecastSummary({ forecast }: { forecast: BeachForecast }) {
  const { summary: s, now, marineAvailable, windAvailable } = forecast;
  const hasRange = s.todayMinWaveHeight !== null && s.todayMaxWaveHeight !== null;
  const hint = s.windHint;
  const hintTone = hint === "offshore" ? "text-good-text" : hint === "onshore" ? "text-warn-text" : "text-muted-text";

  return (
    <section aria-labelledby="forecast-now-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="forecast-now-title" className="section-title">
          מצב הים עכשיו
        </h2>
        <span className="chip-link h-6 text-caption">תחזית אוטומטית</span>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Cell icon={<Waves className="size-4" aria-hidden />} label="גלים">
          {marineAvailable && s.waveHeight !== null ? (
            <>
              <p>
                <bdi className="data-value">{m1(s.waveHeight)}</bdi>
                <span className="data-unit">מ&apos;</span>
              </p>
              <WaveLevel value={waveHeightLevel(s.waveHeight)} segments={4} barOnly label={`${m1(s.waveHeight)} מטר`} />
              <p className="flex flex-wrap items-center gap-x-1 text-label font-semibold text-muted-text">
                {s.wavePeriod !== null ? <span>מחזור {Math.round(s.wavePeriod)} שנ&apos;</span> : null}
                {s.waveDirection !== null ? (
                  <>
                    {s.wavePeriod !== null ? <span aria-hidden>·</span> : null}
                    <DirectionArrow fromDeg={s.waveDirection} className="size-3.5" />
                    <span>{s.waveDirectionLabel}</span>
                  </>
                ) : null}
              </p>
              {hasRange ? (
                <p className="text-caption text-muted-text">
                  היום <bdi>{m1(s.todayMinWaveHeight!)}–{m1(s.todayMaxWaveHeight!)}</bdi> מ&apos;
                </p>
              ) : null}
            </>
          ) : (
            <Unavailable text={marineAvailable ? "גובה הגל לא זמין לשעה הזו" : "נתוני גלים לא זמינים"} />
          )}
        </Cell>

        <Cell icon={<Wind className="size-4" aria-hidden />} label="רוח">
          {windAvailable && s.windSpeed !== null ? (
            <>
              <p className="flex items-center gap-2">
                <span>
                  <bdi className="data-value">{Math.round(s.windSpeed)}</bdi>
                  <span className="data-unit">קמ&quot;ש</span>
                </span>
                {s.windDirection !== null ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <DirectionArrow fromDeg={s.windDirection} />
                  </span>
                ) : null}
              </p>
              {s.windDirectionLabel ? <p className="text-label font-semibold text-muted-text">{s.windDirectionLabel}</p> : null}
              {s.windHintLabel ? (
                <p className={cn("text-label font-bold", hintTone)}>
                  {hint === "offshore" ? "✓ " : ""}
                  {s.windHintLabel}
                </p>
              ) : null}
            </>
          ) : (
            <Unavailable text="לא זמין כרגע" />
          )}
        </Cell>

        <Cell icon={<Droplets className="size-4" aria-hidden />} label="מים">
          {now?.seaTemp != null ? (
            <>
              <p>
                <bdi className="data-value">{Math.round(now.seaTemp)}</bdi>
                <span className="data-unit">°</span>
              </p>
              <p className="text-label font-semibold text-muted-text">טמפרטורת מים</p>
            </>
          ) : (
            <Unavailable text="לא זמין כרגע" />
          )}
        </Cell>

        <Cell icon={<Gauge className="size-4" aria-hidden />} label="ציון">
          {s.score !== null ? (
            <>
              <p>
                <bdi className="data-value">{s.score}</bdi>
                <span className="data-unit">/5</span>
              </p>
              <WaveLevel value={s.score} label={s.scoreLabel} />
            </>
          ) : (
            <Unavailable text="לא זמין כרגע" />
          )}
        </Cell>
      </dl>

      <p className="text-caption text-muted-text">{s.label}</p>
    </section>
  );
}
