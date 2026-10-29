import type { ReactNode } from "react";
import { Mascot } from "@/components/mascot";

type Props = {
  title: string;
  description?: string;
  /** Which mascot pose to show. */
  mascot?: "waiting" | "oops";
  children?: ReactNode;
};

export function EmptyState({ title, description, mascot = "waiting", children }: Props) {
  const M = mascot === "oops" ? Mascot.Oops : Mascot.Waiting;
  return (
    <div className="motion-pop-in flex flex-col items-center px-6 py-10 text-center">
      <M size={160} className="motion-float" />
      <p className="mt-4 text-heading heading-tight font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-body-sm text-muted-text prose-he">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
