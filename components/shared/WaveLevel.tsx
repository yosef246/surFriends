import { WAVE_LEVEL_LABELS, clampLevel } from "@/lib/wave-level";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  /** 5 for surfer reports, 4 for the forecast grid. */
  segments?: 4 | 5;
  /** Override the word (forecast score uses its own Hebrew labels). */
  label?: string | null;
  /** Hide the word and show only the bar (the word must then be present next to it). */
  barOnly?: boolean;
  className?: string;
};

/** Compact wave level (DESIGN_SYSTEM 5d): segmented bar + word + aria-label. Never color-only. */
export function WaveLevel({ value, segments = 5, label, barOnly = false, className }: Props) {
  const v = clampLevel(value, segments);
  const word = label ?? WAVE_LEVEL_LABELS[v - 1];
  const bar = (
    <span className="level-bar" data-level={v} aria-hidden>
      {Array.from({ length: segments }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
  if (barOnly) {
    return (
      <span role="img" aria-label={`גובה גל: ${word} (${v} מתוך ${segments})`} className={cn("inline-flex", className)}>
        {bar}
      </span>
    );
  }
  return (
    <span role="img" aria-label={`גובה גל: ${word} (${v} מתוך ${segments})`} className={cn("wave-level", className)}>
      {bar}
      <span aria-hidden>{word}</span>
    </span>
  );
}
