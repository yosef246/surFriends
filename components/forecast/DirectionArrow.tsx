import { ArrowUp } from "lucide-react";
import { arrowRotation } from "@/lib/chart";
import { cn } from "@/lib/utils";

/**
 * Arrow in the direction the waves/wind TRAVEL. `fromDeg` is where they come FROM (0 = north),
 * so the arrow is rotated by from + 180. Compass directions are absolute: never mirrored in RTL.
 * Decorative: always pair it with a text label.
 */
export function DirectionArrow({ fromDeg, className }: { fromDeg: number; className?: string }) {
  return (
    <ArrowUp
      aria-hidden
      className={cn("size-4 shrink-0", className)}
      style={{ transform: `rotate(${arrowRotation(fromDeg)}deg)` }}
    />
  );
}
