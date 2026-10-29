"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <EmptyState mascot="oops" title="לא הצלחנו לטעון את הפיד" description="זה לא אצלכם. נסו שוב">
        <Button variant="outline" onClick={reset} className="min-h-touch">
          נסו שוב
        </Button>
      </EmptyState>
    </div>
  );
}
