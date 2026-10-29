"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { beachPhotoSrc } from "@/lib/beach-photo";

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

/** Horizontal scroll row of small photo tiles grouped by region. Radiogroup with roving tabindex + arrow keys. */
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
      <span id={`${id}-label`} className="section-title">
        איזה חוף?
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
                    className="tile motion-press w-24 snap-center text-start aria-checked:ring-2 aria-checked:ring-brand aria-checked:ring-offset-2"
                  >
                    {beachPhotoSrc(b.image_path) ? (
                      <Image src={beachPhotoSrc(b.image_path)!} alt="" fill sizes="96px" className="object-cover" />
                    ) : null}
                    <span className="photo-overlay-tile" aria-hidden />
                    {on ? (
                      <span
                        aria-hidden
                        className="absolute start-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-white"
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    ) : null}
                    <span className="absolute inset-x-0 bottom-0 p-1.5">
                      <span className="tile-title line-clamp-3 text-caption leading-4">{b.name_he}</span>
                    </span>
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
