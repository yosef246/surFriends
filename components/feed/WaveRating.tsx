const LABELS: Record<number, string> = { 1: "שטוח", 2: "חלש", 3: "סביר", 4: "טוב", 5: "מעולה" };

/** Display only. Number + filled/empty shapes + word, so it never relies on color. */
export function WaveRating({ value }: { value: number }) {
  const v = Math.min(5, Math.max(1, Math.round(value)));
  const label = LABELS[v];
  return (
    <div
      role="img"
      aria-label={`דירוג גלים ${v} מתוך 5, ${label}`}
      className="flex items-center gap-2 text-body-sm text-sea-deep"
    >
      <span aria-hidden className="flex gap-0.5 text-sea-wave-text">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= v ? "●" : "○"}</span>
        ))}
      </span>
      <span aria-hidden className="font-mono text-data font-semibold">
        {v}/5
      </span>
      <span aria-hidden className="font-medium">
        · {label}
      </span>
    </div>
  );
}
