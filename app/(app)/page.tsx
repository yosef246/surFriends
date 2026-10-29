import { Suspense } from "react";
import { PostedNotice } from "@/components/feed/PostedNotice";
import { ReportList } from "@/components/feed/ReportList";
import { fetchReports } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const reports = await fetchReports(supabase);
  return (
    <>
      <Suspense fallback={null}>
        <PostedNotice />
      </Suspense>
      <ReportList initialReports={reports} />
    </>
  );
}
