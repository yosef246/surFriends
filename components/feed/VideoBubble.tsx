"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { isTrustedMedia } from "@/lib/media-trust";
import { announcePlay, shouldPause, subscribePlay } from "@/lib/video-bus";
import { formatDuration } from "@/lib/video-helpers";
import { cn } from "@/lib/utils";

/** Tap-to-play report video. Never autoplays before a tap; preload="none" to protect egress. */
export function VideoBubble({
  src,
  poster,
  durationMs,
  beachName,
}: {
  src: string;
  poster: string | null;
  durationMs: number | null;
  beachName?: string | null;
}) {
  const [id] = useState(() => `v-${Math.random().toString(36).slice(2)}`);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [landscape, setLandscape] = useState(false);

  const posterOk = !!poster && isTrustedMedia(poster);
  const trusted = isTrustedMedia(src) && (!poster || posterOk);
  const secs = durationMs ? Math.round(durationMs / 1000) : 0;
  const label = `נגן סרטון${beachName ? ` מ${beachName}` : ""}${secs ? ` (${secs} שניות)` : ""}`;

  // Only one video at a time.
  useEffect(
    () =>
      subscribePlay((active) => {
        if (shouldPause(id, active)) videoRef.current?.pause();
      }),
    [id]
  );

  // Pause when scrolled out of view.
  useEffect(() => {
    if (!playing || !boxRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e && !e.isIntersecting) videoRef.current?.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, [playing]);

  const start = useCallback(() => {
    setError(false);
    setPlaying(true);
  }, []);

  // Once the <video> mounts: focus it and play; if sound autoplay is blocked, retry muted (controls stay visible).
  useEffect(() => {
    const v = videoRef.current;
    if (!playing || !v) return;
    v.focus({ preventScroll: true });
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [playing]);

  if (!trusted) return null;

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={boxRef}
        className={cn(
          "relative max-h-[420px] min-h-40 w-full overflow-hidden rounded-xl bg-surface",
          landscape ? "aspect-video" : "aspect-[9/16]"
        )}
      >
        {posterOk ? (
          <Image
            src={poster!}
            alt=""
            fill
            sizes="(max-width: 576px) 85vw, 480px"
            className="object-cover"
            onLoad={(e) => {
              const img = e.currentTarget;
              setLandscape(img.naturalWidth > img.naturalHeight);
            }}
          />
        ) : null}

        {playing && !error ? (
          <video
            ref={videoRef}
            src={src}
            poster={posterOk ? poster! : undefined}
            controls
            playsInline
            autoPlay
            preload="none"
            muted={false}
            aria-label={label}
            className="absolute inset-0 size-full bg-black object-cover"
            onPlay={() => announcePlay(id)}
            onError={() => {
              setError(true);
              setPlaying(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") e.currentTarget.pause();
            }}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              aria-label={label}
              className="motion-press absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-lg"
            >
              <Play className="size-6 fill-current" aria-hidden />
            </button>
            {secs ? (
              <span className="absolute bottom-2 start-2 rounded-pill bg-black/70 px-2 py-0.5 text-caption font-semibold text-white">
                {formatDuration(durationMs ?? 0)}
              </span>
            ) : null}
          </>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-caption text-copy">
          לא הצלחנו לנגן את הסרטון
        </p>
      ) : null}
    </div>
  );
}
