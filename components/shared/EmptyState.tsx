import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon; title: string; description?: string };

export function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Icon className="size-6 text-mist-text" aria-hidden />
      <p className="text-heading font-semibold text-sea-deep">{title}</p>
      {description ? <p className="text-body-sm text-mist-text">{description}</p> : null}
    </div>
  );
}
