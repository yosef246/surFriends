"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { toggleFavoriteBeach } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

type Props = {
  beachId: number;
  beachName: string;
  initialFavorite: boolean;
  /** Fires after the optimistic flip and again on rollback (lets a list hide / restore its row). */
  onChange?: (isFavorite: boolean) => void;
  className?: string;
};

/** Star bubble: optimistic flip, server call with the wanted end state, rollback on failure. */
export function FavoriteToggle({ beachId, beachName, initialFavorite, onChange, className }: Props) {
  const [on, setOn] = useState(initialFavorite);
  const [pops, setPops] = useState(0); // re-keys the icon so the pop-in animation replays
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    const next = !on;
    setError(null);
    setOn(next);
    setPops((n) => n + 1);
    onChange?.(next);
    let err: string | null = null;
    try {
      const res = await toggleFavoriteBeach(beachId, next);
      if ("error" in res) err = res.error;
    } catch {
      err = "לא הצלחנו לעדכן. נסו שוב";
    }
    if (err) {
      setOn(!next);
      setPops((n) => n + 1);
      setError(err);
      onChange?.(!next);
    }
    busy.current = false;
  }

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? `הסרת ${beachName} מהמועדפים` : `הוספת ${beachName} למועדפים`}
        className="bubble-chip inline-flex size-touch items-center justify-center rounded-full"
      >
        <Star
          key={pops}
          aria-hidden
          strokeWidth={1.75}
          className={cn("size-5 stroke-ink", pops > 0 && "motion-pop-in", on && "fill-ink")}
        />
      </button>
      <span role="alert" className={error ? "absolute end-0 top-full z-10 mt-1 whitespace-nowrap rounded-pill bg-white/95 px-3 py-1 text-caption text-danger shadow-card" : "sr-only"}>
        {error ? `⚠ ${error}` : ""}
      </span>
    </span>
  );
}
