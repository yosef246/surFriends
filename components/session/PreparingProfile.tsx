"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown by /profile and /settings while the anonymous session does not exist yet (SessionBootstrap refreshes). */
export function PreparingProfile() {
  const router = useRouter();
  return (
    <EmptyState title="רגע, מכינים לך פרופיל...">
      <button type="button" onClick={() => router.refresh()} className={cn(buttonVariants({ variant: "ocean" }), "min-h-touch")}>
        נסו שוב
      </button>
    </EmptyState>
  );
}
