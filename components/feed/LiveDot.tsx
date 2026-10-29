import type { RealtimeStatus } from "@/lib/realtime/useFeedRealtime";

export function LiveDot({ status }: { status: RealtimeStatus }) {
  const live = status === "live";
  return (
    <span
      role="status"
      aria-label={live ? "עדכונים חיים פעילים" : "מתחברים מחדש..."}
      title={live ? "עדכונים חיים פעילים" : "מתחברים מחדש..."}
      className="mt-1 inline-flex size-6 shrink-0 items-center justify-center"
    >
      <span className={live ? "motion-pulse-ring size-2.5 rounded-full bg-live" : "size-2.5 rounded-full bg-muted-text"} />
    </span>
  );
}
