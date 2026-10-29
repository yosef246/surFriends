import { BubbleSkeleton } from "@/components/feed/StatusBubble";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="טוענים את הפרופיל">
      <div className="card-coast flex flex-col items-start gap-3 p-6">
        <div className="skeleton size-20 rounded-full" />
        <div className="skeleton h-7 w-40 rounded" />
        <div className="skeleton h-5 w-24 rounded-pill" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <BubbleSkeleton />
      <BubbleSkeleton />
    </div>
  );
}
