import Image from "next/image";
import { Waves } from "lucide-react";
import { cn } from "@/lib/utils";

/** Same periodic path as WaveStrip: 2400 wide, repeats every 1200 (= 50%). */
const D = "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

/** Three parallax wave layers (different height, speed, direction). Pins to the bottom of a `relative` parent. */
export function OceanWaves({ className, night = false }: { className?: string; night?: boolean }) {
  const layers = night
    ? [
        { tone: "text-aqua/10", h: "h-28", dur: "62s", dir: 1 },
        { tone: "text-aqua/15", h: "h-20", dur: "40s", dir: -1 },
        { tone: "text-aqua/20", h: "h-12", dur: "26s", dir: 1 },
      ]
    : [
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

const STARS = [
  { x: "8%", y: "7%", s: 2, t: 3.2, d: 0 },
  { x: "18%", y: "16%", s: 3, t: 4.6, d: 1.2 },
  { x: "27%", y: "5%", s: 2, t: 3.8, d: 2.4 },
  { x: "36%", y: "21%", s: 2, t: 5, d: 0.6 },
  { x: "44%", y: "10%", s: 3, t: 4.2, d: 3 },
  { x: "53%", y: "4%", s: 2, t: 3.5, d: 1.8 },
  { x: "61%", y: "18%", s: 2, t: 4.8, d: 2.1 },
  { x: "70%", y: "8%", s: 3, t: 3.9, d: 0.3 },
  { x: "79%", y: "24%", s: 2, t: 4.4, d: 3.6 },
  { x: "88%", y: "6%", s: 2, t: 5.2, d: 1.5 },
  { x: "93%", y: "20%", s: 3, t: 3.6, d: 2.7 },
  { x: "12%", y: "30%", s: 2, t: 4.1, d: 3.3 },
  { x: "48%", y: "28%", s: 2, t: 4.9, d: 0.9 },
  { x: "84%", y: "36%", s: 2, t: 3.7, d: 2 },
  { x: "30%", y: "36%", s: 2, t: 5.1, d: 1.1 },
];

/** Night variant of the scene: deep navy sky, moon, 15 twinkling stars, slower darker waves. No photos. */
export function NightScene() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-abyss">
      <div className="night-sky" />
      <div className="night-moon" />
      {STARS.map((st, i) => (
        <span
          key={i}
          className="night-star"
          style={{ ["--x" as string]: st.x, ["--y" as string]: st.y, ["--s" as string]: `${st.s}px`, ["--t" as string]: `${st.t}s`, ["--d" as string]: `${st.d}s` }}
        />
      ))}
      <OceanWaves night />
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
