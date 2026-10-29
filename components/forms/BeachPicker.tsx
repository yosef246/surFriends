"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { Check } from "lucide-react";

export type BeachOption = {
  id: number;
  name_he: string;
  city: string;
  region: string;
  image_path: string | null;
  image_credit: string | null;
};

type Props = {
  beaches: BeachOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string | null;
  onBlur?: () => void;
};

/** Horizontal scroll row of bubble chips grouped by region. Radiogroup with roving tabindex + arrow keys. */
export function BeachPicker({ beaches, value, onChange, error, onBlur }: Props) {
  const id = useId();
  const refs = useRef(new Map<number, HTMLButtonElement>());
  const groups = useMemo(() => {
    const m = new Map<string, BeachOption[]>();
    for (const b of beaches) m.set(b.region, [...(m.get(b.region) ?? []), b]);
    return [...m.entries()];
  }, [beaches]);
  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);

  // Bring the selected beach (preselected or last used) into view inside the row only.
  useEffect(() => {
    if (value === null) return;
    refs.current.get(value)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [value]);

  function onKeyDown(e: React.KeyboardEvent) {
    // RTL: right = previous, left = next.
    const step =
      e.key === "ArrowLeft" || e.key === "ArrowDown" ? 1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? -1 : 0;
    if (!step || flat.length === 0) return;
    e.preventDefault();
    const cur = flat.findIndex((b) => b.id === value);
    const next = flat[(cur + step + flat.length) % flat.length];
    onChange(next.id);
    refs.current.get(next.id)?.focus();
  }

  const tabStop = value ?? flat[0]?.id;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-body-sm font-medium text-ink">
        חוף
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.();
        }}
        className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none]"
      >
        {groups.map(([region, list]) => (
          <div key={region} role="presentation" className="flex shrink-0 flex-col gap-1.5">
            <span aria-hidden className="eyebrow">
              {region}
            </span>
            <div role="presentation" className="flex gap-2">
              {list.map((b) => {
                const on = value === b.id;
                return (
                  <button
                    key={b.id}
                    ref={(el) => {
                      if (el) refs.current.set(b.id, el);
                      else refs.current.delete(b.id);
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={b.id === tabStop ? 0 : -1}
                    title={`${b.name_he} · ${b.city}`}
                    onClick={() => onChange(b.id)}
                    className={`bubble-chip inline-flex h-12 shrink-0 snap-center items-center gap-1.5 rounded-full px-5 text-body-sm font-semibold whitespace-nowrap ${
                      on ? "motion-pop-in" : ""
                    }`}
                  >
                    {on ? <Check className="size-4" aria-hidden /> : null}
                    {b.name_he}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-body-sm text-danger">
          ⚠ {error}
        </p>
      ) : null}
    </div>
  );
}
