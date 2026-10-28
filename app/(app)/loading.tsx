import { ReportCardSkeleton } from "@/components/feed/ReportCard";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="טוענים את הפיד">
      <ReportCardSkeleton />
      <ReportCardSkeleton />
      <ReportCardSkeleton />
    </div>
  );
}
