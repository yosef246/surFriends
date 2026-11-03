import { MascotWave } from "./MascotWave";
import { MascotWaiting } from "./MascotWaiting";
import { MascotOops } from "./MascotOops";
import { MascotSleeping } from "./MascotSleeping";

export { MascotWave, MascotWaiting, MascotOops, MascotSleeping };
export type { MascotProps } from "./parts";

/** Usage: <Mascot.Wave size={140} />  (server-component safe, no client JS) */
export const Mascot = {
  Wave: MascotWave,
  Waiting: MascotWaiting,
  Oops: MascotOops,
  Sleeping: MascotSleeping,
} as const;
