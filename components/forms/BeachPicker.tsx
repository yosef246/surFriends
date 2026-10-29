"use client";

import { useId, useMemo } from "react";

export type BeachOption = { id: number; name_he: string; city: string; region: string };

type Props = {
  beaches: BeachOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string | null;
  onBlur?: () => void;
};

/** Native <select> grouped by region: labelled, keyboard and mobile-picker friendly. */
export function BeachPicker({ beaches, value, onChange, error, onBlur }: Props) {
  const id = useId();
  const groups = useMemo(() => {
    const m = new Map<string, BeachOption[]>();
    for (const b of beaches) m.set(b.region, [...(m.get(b.region) ?? []), b]);
    return [...m.entries()];
  }, [beaches]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-semibold text-sea-deep">
        חוף
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className="h-11 w-full rounded-lg border border-input bg-card px-3 text-body text-foreground aria-invalid:border-destructive"
      >
        <option value="">בחרו חוף</option>
        {groups.map(([region, list]) => (
          <optgroup key={region} label={region}>
            {list.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_he} · {b.city}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-body-sm text-danger">
          ⚠ {error}
        </p>
      ) : null}
    </div>
  );
}
