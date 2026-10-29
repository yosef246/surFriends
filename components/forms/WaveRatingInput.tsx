"use client";

import { useId } from "react";

import { WAVE_RATING_LABELS as LABELS } from "@/lib/reports";
import { cn } from "@/lib/utils";

type Props = { value: number | null; onChange: (v: number | null) => void };

/**
 * Compact segmented control 1-5 (optional: tapping the selected value clears it).
 * Number bars + word label under each segment, so it never relies on color alone.
 */
export function WaveRatingInput({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="section-title">
        איך הגלים?{" "}
        <span className="text-body-sm font-normal text-muted-text">(לא חובה)</span>
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-5 overflow-hidden rounded-lg border border-mist-border bg-white"
      >
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
              className={cn(
                "flex h-11 min-w-0 flex-col items-center justify-center gap-1 border-s border-card-line px-0.5 text-ink transition-colors duration-(--dur-fast) first:border-s-0 hover:bg-brand-soft",
                checked && "bg-brand-soft text-brand shadow-[inset_0_-2px_0_var(--color-brand)]"
              )}
            >
              <span className="level-bar" data-level={n} aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="w-1.5!" />
                ))}
              </span>
              <span aria-hidden className="truncate text-caption font-bold leading-none">
                {LABELS[n - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
