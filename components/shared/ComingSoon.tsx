import { EmptyState } from "./EmptyState";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="motion-page flex flex-col gap-2">
      <h1 className="text-title heading-tight font-display font-normal text-ink">{title}</h1>
      <EmptyState title="בקרוב" description="המסך הזה עדיין בבנייה." />
    </div>
  );
}
