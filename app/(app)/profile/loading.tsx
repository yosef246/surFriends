import { ReportCardSkeleton } from "@/components/feed/ReportCard";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="טוענים את הפרופיל">
      <div className="glass-card flex flex-col items-center gap-3 rounded-card p-6">
        <div className="skeleton size-24 rounded-full" />
        <div className="skeleton h-7 w-40 rounded" />
        <div className="skeleton h-5 w-24 rounded-pill" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <ReportCardSkeleton />
      <ReportCardSkeleton />
    </div>
  );
}
