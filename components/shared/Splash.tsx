"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot";
import { WaveStrip } from "@/components/shared/WaveStrip";
import { SPLASH_FADE_MS, splashDismissDelay } from "@/lib/splash";

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
      className={`fixed inset-0 z-[100] overflow-hidden bg-sea-page transition-opacity ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-3 px-6 py-10 text-center text-foreground">
        <Mascot.Wave size={180} className="motion-float" />
        <p className="text-display heading-tight font-display font-normal text-gradient-sea">surFriends</p>
        <p className="text-body text-muted-text">קהילת הגולשים של ישראל</p>
      </div>
      <WaveStrip tone="light" className="h-24" />
    </div>
  );
}
