import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewReportForm } from "@/components/forms/NewReportForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { Waves } from "lucide-react";

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
      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="חזרה לפיד"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-full"
        >
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <h1 className="text-title font-bold text-sea-deep">דיווח חדש</h1>
      </div>
      {error || !beaches?.length ? (
        <EmptyState
          icon={Waves}
          title="אופס, משהו השתבש"
          description="לא הצלחנו לטעון את רשימת החופים. נסו לרענן"
        />
      ) : (
        <NewReportForm beaches={beaches} defaultBeachId={defaultBeachId} />
      )}
    </div>
  );
}
