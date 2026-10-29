import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-page">
      <main className="mx-auto flex min-h-dvh w-full max-w-feed items-center justify-center px-4">
        <EmptyState mascot="waiting" title="הגל הזה לא קיים 🤙" description="הדף שחיפשתם לא נמצא. אולי הקישור ישן">
          <Link href="/" className={cn(buttonVariants({ variant: "ocean" }), "min-h-touch")}>
            חזרה לפיד
          </Link>
        </EmptyState>
      </main>
    </div>
  );
}
