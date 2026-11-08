import { MascotWave } from "./MascotWave";
import { MascotWaiting } from "./MascotWaiting";
import { MascotOops } from "./MascotOops";
import { MascotSleeping } from "./MascotSleeping";
import { MascotSurf } from "./MascotSurf";

export { MascotWave, MascotWaiting, MascotOops, MascotSleeping, MascotSurf };
export type { MascotProps } from "./parts";

/** Usage: <Mascot.Wave size={140} />  (server-component safe, no client JS) */
export const Mascot = {
  Wave: MascotWave,
  Waiting: MascotWaiting,
  Oops: MascotOops,
  Sleeping: MascotSleeping,
  Surf: MascotSurf,
} as const;
