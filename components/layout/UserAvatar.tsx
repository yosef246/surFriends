import { cn } from "@/lib/utils";

type Props = { name: string; src?: string | null; className?: string };

export function UserAvatar({ name, src, className }: Props) {
  const initial = Array.from(name.trim())[0] ?? "?";
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-body-sm font-medium text-secondary-foreground",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </span>
  );
}
