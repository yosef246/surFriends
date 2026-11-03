"use client";

import { useEffect, useState } from "react";
import { Splash } from "@/components/shared/Splash";
import { ProfileOnboarding, PROFILE_READY_EVENT } from "./ProfileOnboarding";
import { SessionBootstrap } from "./SessionBootstrap";

const WIPE_MS = 1000;
const WIPE_WAVE =
  "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

/** Mounted once in the root layout: anonymous session bootstrap, launch splash, name-first onboarding. */
export function AppStart() {
  const [ready, setReady] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const done = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setNeedsProfile(false);
        return;
      }
      // Wave wipe: the ocean sheet covers the screen at ~50%, swap onboarding for the feed underneath, sheet leaves.
      setWiping(true);
      timers.push(setTimeout(() => setNeedsProfile(false), WIPE_MS * 0.5));
      timers.push(setTimeout(() => setWiping(false), WIPE_MS));
    };
    window.addEventListener(PROFILE_READY_EVENT, done);
    return () => {
      window.removeEventListener(PROFILE_READY_EVENT, done);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <SessionBootstrap
        onSettled={(needs) => {
          setNeedsProfile(needs);
          setReady(true);
        }}
      />
      {needsProfile ? <ProfileOnboarding /> : null}
      {wiping ? (
        <div aria-hidden className="ob-wipe">
          <svg viewBox="0 0 2400 100" preserveAspectRatio="none" className="ob-wipe-edge">
            <path d={WIPE_WAVE} fill="currentColor" transform="translate(0 100) scale(1 -1)" />
          </svg>
          <div className="ob-wipe-body" />
        </div>
      ) : null}
      <Splash ready={ready} />
    </>
  );
}
