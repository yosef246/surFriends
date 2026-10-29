import { ReportCardSkeleton } from "@/components/feed/ReportCard";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="טוענים את החוף">
      <div className="flex flex-col gap-3">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-9 w-56" />
        <div className="skeleton h-4 w-full" />
      </div>
      <div className="skeleton h-72 w-full rounded-card" />
      <div className="skeleton h-72 w-full rounded-card" />
      <ReportCardSkeleton />
      <ReportCardSkeleton />
    </div>
  );
}
