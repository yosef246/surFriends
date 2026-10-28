import { Waves } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title font-bold text-sea-deep">{title}</h1>
      <EmptyState icon={Waves} title="בקרוב" description="המסך הזה עדיין בבנייה." />
    </div>
  );
}
