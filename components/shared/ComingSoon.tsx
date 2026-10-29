import { EmptyState } from "./EmptyState";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-title font-medium text-ink">{title}</h1>
      <EmptyState title="בקרוב" description="המסך הזה עדיין בבנייה." />
    </div>
  );
}
