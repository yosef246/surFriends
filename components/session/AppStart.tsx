"use client";

import { useEffect, useState } from "react";
import { Splash } from "@/components/shared/Splash";
import { ProfileOnboarding, PROFILE_READY_EVENT } from "./ProfileOnboarding";
import { SessionBootstrap } from "./SessionBootstrap";

/** Mounted once in the root layout: anonymous session bootstrap, launch splash, name-first onboarding. */
export function AppStart() {
  const [ready, setReady] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const done = () => setNeedsProfile(false);
    window.addEventListener(PROFILE_READY_EVENT, done);
    return () => window.removeEventListener(PROFILE_READY_EVENT, done);
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
      <Splash ready={ready} />
    </>
  );
}
