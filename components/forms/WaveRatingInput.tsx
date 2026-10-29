"use client";

import { useId } from "react";

const LABELS = ["שטוח", "חלש", "סביר", "טוב", "מעולה"];

type Props = { value: number | null; onChange: (v: number | null) => void };

/** Radio group 1-5 (optional: tapping the selected value clears it). Number + shape + label, not color-only. */
export function WaveRatingInput({ value, onChange }: Props) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-body-sm font-medium text-ink">איך הגלים? (לא חובה)</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = value === n;
          return (
            <label
              key={n}
              className={`flex min-h-touch cursor-pointer flex-col items-center justify-center rounded-pill px-1 py-1.5 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                checked
                  ? "bg-signature text-ink"
                  : "bg-card text-copy shadow-card"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={checked}
                onChange={() => onChange(n)}
                onClick={() => {
                  if (checked) onChange(null);
                }}
                className="sr-only"
              />
              <span aria-hidden className="font-mono text-data font-medium">
                {checked ? "●" : "○"} {n}
              </span>
              <span className="text-caption">{LABELS[n - 1]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
