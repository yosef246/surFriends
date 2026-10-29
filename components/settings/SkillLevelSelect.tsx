"use client";

import { useRef } from "react";
import type { SkillLevel } from "@/lib/database.types";
import { SKILL_LABELS, SKILL_LEVELS } from "@/lib/profile";

type Props = { value: SkillLevel | null; onChange: (v: SkillLevel | null) => void; disabled?: boolean };

/** Bubble-chip radiogroup (arrow keys move + select). The skill level is optional, so it can be cleared. */
export function SkillLevelSelect({ value, onChange, disabled }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = value ? SKILL_LEVELS.indexOf(value) : 0;

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowLeft" || e.key === "ArrowDown" ? 1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    // RTL: ArrowLeft moves to the next chip visually (towards the end of the row).
    const next = (i + dir + SKILL_LEVELS.length) % SKILL_LEVELS.length;
    onChange(SKILL_LEVELS[next]);
    refs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <span id="skill-label" className="text-body-sm font-medium text-ink">
        רמת גלישה (לא חובה)
      </span>
      <div role="radiogroup" aria-labelledby="skill-label" className="flex flex-wrap gap-2">
        {SKILL_LEVELS.map((level, i) => (
          <button
            key={level}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === level}
            tabIndex={i === activeIndex ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(level)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="bubble-chip h-11 rounded-full px-5 text-body-sm font-semibold disabled:opacity-50"
          >
            {value === level ? "✓ " : ""}
            {SKILL_LABELS[level]}
          </button>
        ))}
        {value ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="min-h-touch rounded-pill px-3 text-body-sm text-link-blue underline-offset-4 hover:underline"
          >
            לא לציין
          </button>
        ) : null}
      </div>
    </div>
  );
}
