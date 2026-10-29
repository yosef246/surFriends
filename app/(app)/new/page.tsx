import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewReportForm } from "@/components/forms/NewReportForm";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
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
    .select("id, name_he, city, region")
    .order("region")
    .order("name_he");

  const wanted = Number(beach);
  const defaultBeachId =
    Number.isInteger(wanted) && beaches?.some((b) => b.id === wanted) ? wanted : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="motion-fade-up flex items-center gap-3">
        <Link
          href="/"
          aria-label="חזרה לפיד"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow">מה המצב בים? ספרו לכולם</p>
          <h1 className="text-title heading-tight font-display font-normal text-gradient-sea">דיווח חדש</h1>
        </div>
      </div>
      {error || !beaches?.length ? (
        <EmptyState
          mascot="oops"
          title="אופס, משהו השתבש"
          description="לא הצלחנו לטעון את רשימת החופים. נסו לרענן"
        />
      ) : (
        <NewReportForm beaches={beaches} defaultBeachId={defaultBeachId} />
      )}
    </div>
  );
}
