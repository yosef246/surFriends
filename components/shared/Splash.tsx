"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mascot } from "@/components/mascot";
import { DEFAULT_BEACH_PHOTO } from "@/lib/beach-photo";
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
      className={`fixed inset-0 z-[100] overflow-hidden bg-ocean-deep transition-opacity ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <Image src={DEFAULT_BEACH_PHOTO.path} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="photo-overlay" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-end gap-3 px-6 pt-10 pb-24 text-center text-white">
        <Mascot.Wave size={96} />
        <p className="font-display text-hero font-normal text-white drop-shadow">surFriends</p>
        <p className="eyebrow eyebrow-light">קהילת הגולשים של ישראל</p>
      </div>
      <span className="credit">© {DEFAULT_BEACH_PHOTO.credit} · CC</span>
    </div>
  );
}
