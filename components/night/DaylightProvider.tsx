"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { formatIsraelTime, getDaylightState, toSnapshot, type DaylightSnapshot } from "@/lib/daylight";

export type DaylightValue = {
  isNight: boolean;
  /** "HH:mm" (Israel time) of the next sunrise. */
  opensLabel: string;
  /** Epoch ms of the next sunrise. */
  opensAtMs: number;
  /** Whole minutes until the next sunrise (0 by day). */
  minutesUntilOpen: number;
};

const DEFAULT: DaylightValue = { isNight: false, opensLabel: "", opensAtMs: 0, minutesUntilOpen: 0 };
const Ctx = createContext<DaylightValue>(DEFAULT);

function derive(s: DaylightSnapshot): DaylightValue {
  return {
    isNight: s.isNight,
    opensAtMs: s.opensAtMs,
    opensLabel: formatIsraelTime(new Date(s.opensAtMs)),
    minutesUntilOpen: s.isNight ? Math.max(0, Math.ceil((s.opensAtMs - s.nowMs) / 60_000)) : 0,
  };
}

/**
 * Single client clock for the night lockout. SSR-safe: the first render uses the snapshot computed by the server
 * (so markup matches), then the client re-evaluates immediately and every 60s (and when the tab becomes visible).
 * This is UX only; the server actions and the DB trigger enforce the rule.
 */
export function DaylightProvider({ initial, children }: { initial: DaylightSnapshot; children: ReactNode }) {
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSnap(toSnapshot(getDaylightState(now), now));
    };
    tick();
    const id = setInterval(tick, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const value = useMemo(() => derive(snap), [snap]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDaylight(): DaylightValue {
  return useContext(Ctx);
}
