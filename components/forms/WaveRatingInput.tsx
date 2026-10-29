"use client";

import { useId } from "react";

import { WAVE_RATING_LABELS as LABELS } from "@/lib/reports";

type Props = { value: number | null; onChange: (v: number | null) => void };

/** Mini wave whose crest grows with the rating. */
function WaveGlyph({ n }: { n: number }) {
  const crest = 22 - (3 + n * 3.4);
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
      <path d={`M1 22 C7 ${crest} 15 ${crest} 23 22 Z`} fill="currentColor" opacity={0.9} />
    </svg>
  );
}

/** Radiogroup 1-5 (optional: tapping the selected value clears it). Number + shape + label, not color-only. */
export function WaveRatingInput({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-body-sm font-medium text-ink">
        איך הגלים? (לא חובה)
      </span>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${n} מתוך 5, ${LABELS[n - 1]}`}
              tabIndex={checked || (value === null && n === 1) ? 0 : -1}
              onClick={() => onChange(checked ? null : n)}
              onKeyDown={(e) => {
                // RTL: 1 sits on the right, so left/down = higher, right/up = lower.
                const step =
                  e.key === "ArrowLeft" || e.key === "ArrowDown" ? 1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const target = Math.min(5, Math.max(1, n + step));
                onChange(target);
                (e.currentTarget.parentElement?.children[target - 1] as HTMLElement | undefined)?.focus();
              }}
              className={`bubble-chip motion-press flex h-20 flex-col items-center justify-center gap-0.5 rounded-pill px-1 text-center ${
                checked ? "motion-pop-in" : ""
              }`}
            >
              <WaveGlyph n={n} />
              <span aria-hidden className="numeral text-body-sm font-medium">
                {n}
              </span>
              <span className="text-caption leading-none">{LABELS[n - 1]}{n === 5 ? " 🔥" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
