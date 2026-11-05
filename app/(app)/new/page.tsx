import { REPORT_TTL_HOURS } from "@/lib/reports";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewReportForm } from "@/components/forms/NewReportForm";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ClosedAtNight } from "@/components/night/NightClosedCard";
import { createClient } from "@/lib/supabase/server";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ beach?: string }>;
}) {
  const { beach } = await searchParams;
  const supabase = await createClient();
  const { data: beaches, error } = await supabase
    .from("beaches")
    .select("id, name_he, city, region, image_path, image_credit")
    .order("latitude", { ascending: false }); // north to south, so the region groups come out צפון, מרכז, דרום

  const wanted = Number(beach);
  const defaultBeachId =
    Number.isInteger(wanted) && beaches?.some((b) => b.id === wanted) ? wanted : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="motion-fade-up flex items-center gap-3">
        <Link
          href="/"
          aria-label="חזרה לפיד"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow">מה המצב בים? ספרו לכולם</p>
          <h1 className="text-title font-bold text-ink">דיווח חדש</h1>
          <p className="text-label text-muted-text">הדיווח נעלם אחרי {REPORT_TTL_HOURS} שעות</p>
        </div>
      </div>
      {error || !beaches?.length ? (
        <EmptyState
          mascot="oops"
          title="אופס, משהו השתבש"
          description="לא הצלחנו לטעון את רשימת החופים. נסו לרענן"
        />
      ) : (
        <ClosedAtNight>
          <NewReportForm beaches={beaches} defaultBeachId={defaultBeachId} />
        </ClosedAtNight>
      )}
    </div>
  );
}
