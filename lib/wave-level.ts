// Wave level helpers shared by WaveLevel (reports 1-5) and the forecast grid (meters -> 1-4 bars).

export const WAVE_LEVEL_LABELS = ["שטוח", "קטן", "סביר", "טוב", "אש"] as const;

export function clampLevel(value: number, max = 5): number {
  return Math.min(max, Math.max(1, Math.round(value)));
}

/** Forecast wave height in meters -> 1..4 bars (4-bar level-bar in the "sea now" grid). */
export function waveHeightLevel(meters: number): 1 | 2 | 3 | 4 {
  if (meters < 0.4) return 1;
  if (meters < 0.9) return 2;
  if (meters < 1.6) return 3;
  return 4;
}
