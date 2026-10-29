import { BubbleSkeleton } from "@/components/feed/StatusBubble";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="טוענים את הפיד">
      <BubbleSkeleton />
      <BubbleSkeleton />
      <BubbleSkeleton />
    </div>
  );
}
