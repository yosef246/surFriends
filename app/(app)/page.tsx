import { ReportList } from "@/components/feed/ReportList";
import { fetchReports } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const reports = await fetchReports(supabase);
  return <ReportList initialReports={reports} />;
}
