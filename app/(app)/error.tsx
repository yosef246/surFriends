"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center">
      <EmptyState
        icon={TriangleAlert}
        title="לא הצלחנו לטעון את הפיד"
        description="זה לא אצלכם. נסו שוב"
      />
      <Button onClick={reset} className="min-h-touch">
        נסו שוב
      </Button>
    </div>
  );
}
