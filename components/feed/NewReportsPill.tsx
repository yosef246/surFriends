"use client";

import { cn } from "@/lib/utils";

/** Sticky "N new reports" bubble. The live region stays mounted so updates are announced. */
export function NewReportsPill({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none sticky top-3 z-20 flex justify-center">
      {count > 0 ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "btn-primary shadow-raised motion-pop-in pointer-events-auto min-h-touch rounded-pill px-5 text-body-sm font-semibold"
          )}
        >
          {count === 1 ? "דיווח חדש ↑" : `${count} דיווחים חדשים ↑`}
        </button>
      ) : null}
    </div>
  );
}
