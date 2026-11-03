"use client";

import { useEffect, useRef } from "react";
import { Mascot } from "@/components/mascot";
import { NightScene } from "@/components/shared/OceanScene";
import { formatRemainingHe } from "@/lib/daylight";
import { useDaylight } from "./DaylightProvider";

/**
 * Full-screen "the sea is asleep" screen. Modal dialog: focus lands on the headline, Tab is trapped on the single
 * button, Escape does NOT dismiss. Only the peek button leaves (read-only app; the server enforces the lockout anyway).
 */
export function NightScreen({ onPeek }: { onPeek: () => void }) {
  const { opensLabel, opensAtMs, minutesUntilOpen } = useDaylight();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="night-title"
      aria-describedby="night-desc"
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault(); // one focusable control: keep focus inside
          e.currentTarget.querySelector<HTMLElement>("button")?.focus();
        }
      }}
      className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-abyss text-white"
    >
      <NightScene />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="ob-mascot-pop">
          <Mascot.Sleeping size={180} />
        </div>
        <h1
          id="night-title"
          ref={titleRef}
          tabIndex={-1}
          className="ob-rise font-display text-hero font-normal text-white outline-none drop-shadow"
          style={{ ["--base" as string]: "150ms" }}
        >
          הים הולך לישון 🌙
        </h1>
        <p
          id="night-desc"
          className="ob-rise max-w-xs text-body text-white/90 prose-he"
          style={{ ["--base" as string]: "300ms" }}
        >
          בלילה מסוכן להיכנס למים. דיווחים, תגובות ו&apos;אני בא&apos; סגורים עד הבוקר.
        </p>
        <div className="ob-card-in w-full rounded-card border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <p className="eyebrow eyebrow-light">נפתח שוב בזריחה</p>
          <p className="mt-1 font-display text-hero font-normal text-white">
            <time dateTime={new Date(opensAtMs).toISOString()} dir="ltr">
              {opensLabel}
            </time>
          </p>
          <p className="mt-1 text-body-sm text-white/85" aria-live="polite">
            ({formatRemainingHe(minutesUntilOpen)})
          </p>
        </div>
        <button
          type="button"
          onClick={onPeek}
          className="mt-2 inline-flex min-h-touch min-w-touch items-center justify-center rounded-pill px-4 text-body-sm font-medium text-white/80 underline underline-offset-4 hover:text-white"
        >
          להציץ בדיווחים מהיום
        </button>
      </div>
    </div>
  );
}
