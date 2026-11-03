import Image from "next/image";
import { Waves } from "lucide-react";
import { cn } from "@/lib/utils";

/** Same periodic path as WaveStrip: 2400 wide, repeats every 1200 (= 50%). */
const D = "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

/** Three parallax wave layers (different height, speed, direction). Pins to the bottom of a `relative` parent. */
export function OceanWaves({ className }: { className?: string }) {
  const layers = [
    { tone: "text-white/10", h: "h-28", dur: "34s", dir: 1 },
    { tone: "text-white/15", h: "h-20", dur: "22s", dir: -1 },
    { tone: "text-white/25", h: "h-12", dur: "14s", dir: 1 },
  ];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden", className)}>
      {layers.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 2400 100"
          preserveAspectRatio="none"
          style={{ animationDuration: l.dur, ["--drift-dir" as string]: l.dir }}
          className={cn("motion-drift absolute bottom-0 w-[200%]", l.h, l.tone)}
        >
          <path d={D} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

const BUBBLES = [
  { x: "8%", s: 8, t: 11, d: 0 },
  { x: "20%", s: 14, t: 14, d: 3 },
  { x: "33%", s: 6, t: 10, d: 6 },
  { x: "45%", s: 11, t: 13, d: 1.5 },
  { x: "58%", s: 7, t: 12, d: 8 },
  { x: "68%", s: 16, t: 16, d: 4 },
  { x: "78%", s: 9, t: 11, d: 9.5 },
  { x: "88%", s: 12, t: 15, d: 2 },
  { x: "14%", s: 10, t: 17, d: 11 },
  { x: "92%", s: 6, t: 12, d: 7 },
];

/** Ten foam bubbles rising with staggered delays. */
export function OceanBubbles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="ob-bubble"
          style={{ ["--x" as string]: b.x, ["--s" as string]: `${b.s}px`, ["--t" as string]: `${b.t}s`, ["--d" as string]: `${b.d}s` }}
        />
      ))}
    </div>
  );
}

export const SCENE_PHOTOS = [
  { path: "/beaches/hilton.jpg", credit: "Martin Furtschegger" },
  { path: "/beaches/ha-sira.jpg", credit: "Yehudit Garinkol" },
  { path: "/beaches/poleg.jpg", credit: "Yehudit Garinkol" },
] as const;

/** Full-bleed decorative scene: cross-fading Ken-Burns photos, deep-ocean veil, bubbles, parallax waves. */
export function OceanScene() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ocean-deep">
      {SCENE_PHOTOS.map((p, i) => (
        <div
          key={p.path}
          className={cn("ob-photo", i === 0 && "ob-photo-first")}
          style={{ ["--d" as string]: `${i * 8}s` }}
        >
          <Image
            src={p.path}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 576px) 100vw, 576px"
            className="object-cover"
          />
        </div>
      ))}
      <div className="ob-veil" />
      <OceanBubbles />
      <OceanWaves />
    </div>
  );
}

/** Wordmark: Waves icon above "surFriends". */
export function Wordmark() {
  return (
    <p className="flex flex-col items-center gap-1 font-display text-display font-normal text-white drop-shadow">
      <Waves className="size-7" aria-hidden />
      surFriends
    </p>
  );
}
