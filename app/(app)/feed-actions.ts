"use server";

import { fetchReports, type FeedReport } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export type LoadMoreResult = { ok: true; reports: FeedReport[] } | { ok: false };

export async function loadMoreReports(cursor: string): Promise<LoadMoreResult> {
  if (typeof cursor !== "string" || Number.isNaN(Date.parse(cursor))) return { ok: false };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };
    return { ok: true, reports: await fetchReports(supabase, cursor) };
  } catch {
    return { ok: false };
  }
}
