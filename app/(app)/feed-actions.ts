"use server";

import { getCurrentUser, getSupabase } from "@/lib/auth";
import { reportCutoffIso } from "@/lib/reports";
import { fetchReports, parseFeedCursor, type FeedCursor, type FeedReport } from "@/lib/feed";

export type LoadMoreResult = { ok: true; reports: FeedReport[] } | { ok: false };

export async function loadMoreReports(cursor: FeedCursor, beachId?: number | null): Promise<LoadMoreResult> {
  const parsed = parseFeedCursor(cursor);
  if (!parsed) return { ok: false };
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false };
    return { ok: true, reports: await fetchReports(await getSupabase(), reportCutoffIso(), parsed, user.id, beachId ?? null) };
  } catch {
    return { ok: false };
  }
}
