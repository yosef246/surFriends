"use server";

import { getCurrentUser, getSupabase } from "@/lib/auth";
import { fetchReports, parseFeedCursor, type FeedCursor, type FeedReport } from "@/lib/feed";

export type LoadMoreResult = { ok: true; reports: FeedReport[] } | { ok: false };

export async function loadMoreReports(cursor: FeedCursor): Promise<LoadMoreResult> {
  const parsed = parseFeedCursor(cursor);
  if (!parsed) return { ok: false };
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false };
    return { ok: true, reports: await fetchReports(await getSupabase(), parsed) };
  } catch {
    return { ok: false };
  }
}
