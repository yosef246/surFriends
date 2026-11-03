"use client";

import type { ReactNode } from "react";
import { Mascot } from "@/components/mascot";
import { useDaylight } from "./DaylightProvider";

/** Friendly "reports are closed at night" card. Used instead of the new-report form on a /new deep link. */
export function NightClosedCard() {
  const { opensLabel } = useDaylight();
  return (
    <div role="status" className="motion-pop-in flex flex-col items-center rounded-card bg-white px-6 py-8 text-center shadow-raised">
      <Mascot.Sleeping size={120} />
      <p className="mt-3 text-heading font-bold text-ink">הדיווחים סגורים בלילה 🌙</p>
      <p className="mt-1 max-w-xs text-body-sm text-muted-text prose-he">
        בלילה מסוכן להיכנס למים. נפתח שוב בזריחה, ב-<time dir="ltr">{opensLabel}</time>
      </p>
    </div>
  );
}

/** Renders the children by day, the closed card at night. */
export function ClosedAtNight({ children }: { children: ReactNode }) {
  const { isNight } = useDaylight();
  return isNight ? <NightClosedCard /> : <>{children}</>;
}
