"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, X } from "lucide-react";
import { NightScreen } from "./NightScreen";
import { useDaylight } from "./DaylightProvider";

const PEEK_KEY = "sf_night_peek";
const MORNING_TOAST_MS = 6000;

function readPeek(): string | null {
  try {
    return sessionStorage.getItem(PEEK_KEY);
  } catch {
    return null;
  }
}

/**
 * Mounted by AppStart. At night, once `active` (after the splash and onboarding): the full-screen NightScreen until
 * the user peeks (sessionStorage flag keyed by the sunrise it is valid for, so the next night shows the screen again).
 * Also shows the "good morning" toast when the sunrise passes while the app is open.
 */
export function NightGate({ active }: { active: boolean }) {
  const { isNight, opensAtMs } = useDaylight();
  const [peekedFor, setPeekedFor] = useState<string | null>(null);
  const [morning, setMorning] = useState(false);
  const wasNight = useRef(isNight);

  useEffect(() => {
    setPeekedFor(readPeek());
  }, []);

  useEffect(() => {
    if (wasNight.current && !isNight) setMorning(true);
    wasNight.current = isNight;
  }, [isNight]);

  useEffect(() => {
    if (!morning) return;
    const t = setTimeout(() => setMorning(false), MORNING_TOAST_MS);
    return () => clearTimeout(t);
  }, [morning]);

  function peek() {
    const v = String(opensAtMs);
    setPeekedFor(v);
    try {
      sessionStorage.setItem(PEEK_KEY, v);
    } catch {
      /* storage unavailable: peek lasts for this page load */
    }
  }

  return (
    <>
      {active && isNight && peekedFor !== String(opensAtMs) ? <NightScreen onPeek={peek} /> : null}
      {morning ? (
        <div
          role="status"
          className="fixed inset-x-4 top-4 z-[96] mx-auto flex max-w-feed items-center justify-between gap-2 rounded-pill bg-success px-4 py-2.5 text-body-sm font-medium text-success-foreground shadow-raised animate-toast-in"
        >
          <span className="flex items-center gap-2">
            <Sun className="size-4" aria-hidden /> בוקר טוב! הים נפתח 🌅
          </span>
          <button
            type="button"
            onClick={() => setMorning(false)}
            aria-label="סגירה"
            className="flex min-h-touch min-w-touch items-center justify-center"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}
