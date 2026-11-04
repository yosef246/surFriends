"use client";

import Image from "next/image";
import { useRef } from "react";
import { X } from "lucide-react";

/** Feed photo that opens full screen on tap. Native <dialog>: Escape, focus trap and return come for free. */
export function PhotoLightbox({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label="הגדלת התמונה"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface"
      >
        <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 576px) 85vw, 480px" className="object-cover" />
      </button>
      <dialog
        ref={ref}
        aria-label={alt}
        // A click on the dialog itself (not the photo or the button) is a click on the dark backdrop area.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 backdrop:bg-black/80"
      >
        <div className="pointer-events-none relative size-full">
          <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
        </div>
        <button
          type="button"
          aria-label="סגירה"
          onClick={() => ref.current?.close()}
          className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
        >
          <X className="size-6" aria-hidden />
        </button>
      </dialog>
    </>
  );
}
