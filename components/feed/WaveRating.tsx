const LABELS: Record<number, string> = { 1: "שטוח", 2: "חלש", 3: "סביר", 4: "טוב", 5: "מעולה" };

/** Display only. Number + filled/empty dots + word, so it never relies on color. */
export function WaveRating({ value }: { value: number }) {
  const v = Math.min(5, Math.max(1, Math.round(value)));
  const label = LABELS[v];
  return (
    <div role="img" aria-label={`דירוג גלים ${v} מתוך 5, ${label}`} className="flex items-center gap-3">
      <span aria-hidden className="numeral text-numeral-md font-light">
        {v}
        <span className="text-unit text-muted-text">/5</span>
      </span>
      <span aria-hidden className="flex flex-col gap-1">
        <span className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`size-2.5 rounded-full border ${i <= v ? "border-signature bg-signature" : "border-line bg-surface"}`}
            />
          ))}
        </span>
        <span className="text-body-sm text-muted-text">{label}</span>
      </span>
    </div>
  );
}
