// Tiny emitter so only one feed video plays at a time.

type Listener = (activeId: string) => void;
const listeners = new Set<Listener>();

export function announcePlay(id: string): void {
  for (const l of [...listeners]) l(id);
}

export function subscribePlay(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Pure: should the video `myId` pause when `activeId` starts? */
export function shouldPause(myId: string, activeId: string): boolean {
  return myId !== activeId;
}
