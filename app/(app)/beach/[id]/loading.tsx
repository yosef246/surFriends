import { BubbleSkeleton } from "@/components/feed/StatusBubble";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="טוענים את החוף">
      <div className="skeleton h-56 w-full rounded-card" />
      <div className="skeleton h-72 w-full rounded-card" />
      <div className="skeleton h-72 w-full rounded-card" />
      <BubbleSkeleton />
      <BubbleSkeleton />
    </div>
  );
}
