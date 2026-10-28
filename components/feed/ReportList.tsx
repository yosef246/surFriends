"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Waves } from "lucide-react";
import { loadMoreReports } from "@/app/(app)/feed-actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { FEED_PAGE_SIZE, type FeedReport } from "@/lib/feed";
import { cn } from "@/lib/utils";
import { ReportCard } from "./ReportCard";

export function ReportList({ initialReports }: { initialReports: FeedReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [hasMore, setHasMore] = useState(initialReports.length >= FEED_PAGE_SIZE);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    const last = reports[reports.length - 1];
    if (!last) return;
    setFailed(false);
    startTransition(async () => {
      const res = await loadMoreReports(last.created_at);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setReports((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...res.reports.filter((r) => !seen.has(r.id))];
      });
      setHasMore(res.reports.length >= FEED_PAGE_SIZE);
    });
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <EmptyState
          icon={Waves}
          title="עדיין שקט בים"
          description="היו הראשונים לספר מה קורה בחוף"
        />
        <Link href="/new" className={cn(buttonVariants(), "min-h-touch")}>
          דווחו עכשיו
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="sr-only">פיד דיווחים</h1>
      <ul className="flex flex-col gap-4" aria-busy={pending}>
        {reports.map((r) => (
          <li key={r.id}>
            <ReportCard report={r} />
          </li>
        ))}
      </ul>

      {failed ? (
        <p role="alert" className="text-center text-body-sm text-danger">
          לא הצלחנו לטעון עוד. נסו שוב
        </p>
      ) : null}

      {hasMore ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline" }), "min-h-touch self-center")}
        >
          {pending ? "טוענים..." : "טען עוד"}
        </button>
      ) : (
        <p className="py-2 text-center text-body-sm text-mist-text">זה הכל לעכשיו</p>
      )}
    </div>
  );
}
