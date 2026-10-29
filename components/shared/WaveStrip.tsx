import { cn } from "@/lib/utils";

/** Periodic wave path: 2400 wide, repeats every 1200 (= 50%), so a w-[200%] strip drifts seamlessly. */
const D =
  "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

function Layer({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 2400 100"
      preserveAspectRatio="none"
      className={cn("absolute bottom-0 h-full w-[200%]", className)}
    >
      <path d={D} fill="currentColor" />
    </svg>
  );
}

/** Decorative two-layer animated wave strip. Place inside a `relative` parent; it pins to the bottom edge. */
export function WaveStrip({ className, tone = "hero" }: { className?: string; tone?: "hero" | "light" }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-hidden", className)}
    >
      <Layer className={cn("motion-drift-slow", tone === "hero" ? "text-white/20" : "text-brand-soft")} />
      <Layer className={cn("motion-drift [clip-path:inset(30%_0_0_0)]", tone === "hero" ? "text-white/15" : "text-brand/30")} />
    </div>
  );
}
