/** Pure timing rules for the launch splash. */
export const SPLASH_MIN_MS = 2000;
export const SPLASH_MIN_REDUCED_MS = 800;
export const SPLASH_MAX_MS = 4000;
export const SPLASH_FADE_MS = 300;

/**
 * Milliseconds to wait (from now) before dismissing the splash.
 * - session ready: dismiss once the minimum time has elapsed
 * - session not ready: wait for it, but never beyond the hard cap
 */
export function splashDismissDelay(opts: { elapsedMs: number; ready: boolean; reducedMotion: boolean }): number {
  const min = opts.reducedMotion ? SPLASH_MIN_REDUCED_MS : SPLASH_MIN_MS;
  const target = opts.ready ? min : SPLASH_MAX_MS;
  return Math.max(0, target - opts.elapsedMs);
}
