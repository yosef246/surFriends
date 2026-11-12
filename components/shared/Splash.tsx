"use client";

import { useEffect, useState } from "react";
import { Waves } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { OceanScene } from "@/components/shared/OceanScene";
import { SPLASH_FADE_MS, splashDismissDelay } from "@/lib/splash";

/** Same periodic path as OceanWaves: 2400 wide, repeats every 1200 (= 50%). */
const WAVE = "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

/** The loading mark: גל rides a wave; the waves slide under him and he bobs with them. */
function SurfLoader() {
  return (
    <div aria-hidden className="ld relative h-44 w-60">
      <div className="ld-sea absolute inset-x-0 bottom-0 h-14 overflow-hidden">
        <svg viewBox="0 0 2400 100" preserveAspectRatio="none" className="ld-wave ld-wave-back absolute bottom-2 left-0 h-12 w-[200%] text-sticker-blue/45">
          <path d={WAVE} fill="currentColor" />
        </svg>
        <svg viewBox="0 0 2400 100" preserveAspectRatio="none" className="ld-wave absolute bottom-0 left-0 h-10 w-[200%] text-sticker-blue">
          <path d={WAVE} fill="currentColor" />
        </svg>
      </div>
      {/* After the sea, so the board rides on top of the wave. */}
      <div className="ld-rider absolute inset-x-0 bottom-8 flex justify-center">
        <Mascot.Surf size={132} />
      </div>
    </div>
  );
}

export const SPLASH_FLAG = "sf_splash_seen";

/**
 * Launch screen shown once per browser session (and in the PWA, where it acts as the launch screen).
 * Rendered visible from the first paint; an inline script in the root layout hides it before paint when
 * the session flag is already set. The page renders underneath, so it is ready when the splash leaves.
 */
export function Splash({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<"show" | "fading" | "gone">("show");
  const [startedAt] = useState(() => Date.now());

  // Already shown in this session: drop it right away (CSS has hidden it before paint).
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SPLASH_FLAG) === "1";
      if (!seen) sessionStorage.setItem(SPLASH_FLAG, "1");
    } catch {
      /* storage unavailable: show once per page load */
    }
    if (seen) setPhase("gone");
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = splashDismissDelay({ elapsedMs: Date.now() - startedAt, ready, reducedMotion });
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      if (reducedMotion) {
        setPhase("gone");
        return;
      }
      setPhase("fading");
      fadeTimer = setTimeout(() => setPhase("gone"), SPLASH_FADE_MS);
    }, delay);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeTimer);
    };
  }, [phase, ready, startedAt]);

  if (phase === "gone") return null;

  return (
    <div
      data-splash
      role="status"
      aria-label="טוען את surFriends"
      inert={phase === "fading"}
      style={{ transitionDuration: `${SPLASH_FADE_MS}ms` }}
      className={`fixed inset-0 z-[100] overflow-hidden bg-page text-ink transition-opacity ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Same scene as the sign-up screen, so loading flows straight into it. */}
      <OceanScene />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-5 px-6 pb-16 text-center">
        <SurfLoader />
        <p className="flex items-center gap-2 font-display text-[3.25rem] leading-[0.85] font-bold text-ink">
          <Waves className="size-8 shrink-0" aria-hidden />
          surFriends
        </p>
        <p className="eyebrow">קהילת הגולשים של ישראל</p>
      </div>
    </div>
  );
}
