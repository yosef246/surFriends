"use client";

import { useState, useTransition, type ReactNode } from "react";
import { REACTION_KINDS, REACTION_LABEL, type ReactionKind } from "@/lib/replies";
import { cn } from "@/lib/utils";

type Props = {
  comingCount: number;
  onTheWayCount: number;
  myComing: boolean;
  myOnTheWay: boolean;
  /** Owners do not react to their own report: they see read-only counts. */
  isOwn: boolean;
  /** Optimistic toggle owned by the feed; resolves to an error message, or null on success. */
  onToggle: (kind: ReactionKind) => Promise<string | null>;
  /** Extra controls on the same row (the comments button). */
  children?: ReactNode;
};

export function QuickReactionBar({ comingCount, onTheWayCount, myComing, myOnTheWay, isOwn, onToggle, children }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Bumped per tap so the emoji replays motion-pop-in (never on first render).
  const [pops, setPops] = useState<Record<ReactionKind, number>>({ coming: 0, on_the_way: 0 });

  const pressed: Record<ReactionKind, boolean> = { coming: myComing, on_the_way: myOnTheWay };
  const counts: Record<ReactionKind, number> = { coming: comingCount, on_the_way: onTheWayCount };

  function tap(kind: ReactionKind) {
    if (pending) return;
    setError(null);
    setPops((p) => ({ ...p, [kind]: p[kind] + 1 }));
    startTransition(async () => {
      const err = await onToggle(kind);
      if (err) setError(err);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="תגובות מהירות">
        {isOwn ? (
          <p className="text-body-sm text-muted-text">
            {[comingCount > 0 ? `🤙 ${comingCount} באים` : null, onTheWayCount > 0 ? `🚗 ${onTheWayCount} בדרך` : null]
              .filter(Boolean)
              .join(" · ") || "עוד אין תגובות מהירות"}
          </p>
        ) : (
          REACTION_KINDS.map((kind) => {
            const { emoji, label } = REACTION_LABEL[kind];
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={pressed[kind]}
                disabled={pending}
                onClick={() => tap(kind)}
                className="bubble-chip inline-flex min-h-touch items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold whitespace-nowrap disabled:opacity-70"
              >
                <span key={pops[kind]} aria-hidden className={cn(pops[kind] > 0 && pressed[kind] && "motion-pop-in")}>
                  {emoji}
                </span>
                <span>{label}</span>
                {counts[kind] > 0 ? (
                  <span className="font-mono text-data" aria-label={`${counts[kind]}`}>
                    {counts[kind]}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
        {children}
      </div>
      <p role="alert" className="text-body-sm text-danger empty:hidden">
        {error ? `⚠ ${error}` : null}
      </p>
    </div>
  );
}
