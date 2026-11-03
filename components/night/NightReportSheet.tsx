"use client";

import { useEffect, useRef } from "react";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { useDaylight } from "./DaylightProvider";

/** Small bottom sheet shown when the raised "דיווח" button is tapped at night. Escape / backdrop / button close it. */
export function NightReportSheet({ onClose }: { onClose: () => void }) {
  const { opensLabel } = useDaylight();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-abyss/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="night-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="motion-fade-up mx-auto flex w-full max-w-feed flex-col items-center rounded-t-card bg-white px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center shadow-raised"
      >
        <Mascot.Sleeping size={96} />
        <p id="night-sheet-title" className="mt-2 text-heading font-bold text-ink">
          הדיווחים סגורים בלילה 🌙
        </p>
        <p className="mt-1 text-body-sm text-muted-text">
          נפתח שוב ב-<time dir="ltr">{opensLabel}</time>
        </p>
        <Button ref={closeRef} type="button" variant="ocean" onClick={onClose} className="mt-4 w-full max-w-xs">
          סגור
        </Button>
      </div>
    </div>
  );
}
