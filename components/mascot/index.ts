import { MascotWave } from "./MascotWave";
import { MascotWaiting } from "./MascotWaiting";
import { MascotOops } from "./MascotOops";

export { MascotWave, MascotWaiting, MascotOops };
export type { MascotProps } from "./parts";

/** Usage: <Mascot.Wave size={140} />  (server-component safe, no client JS) */
export const Mascot = {
  Wave: MascotWave,
  Waiting: MascotWaiting,
  Oops: MascotOops,
} as const;
