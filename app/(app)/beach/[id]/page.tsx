import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ForecastSummary } from "@/components/forecast/ForecastSummary";
import { WaveChart } from "@/components/forecast/WaveChart";
import { ReportList } from "@/components/feed/ReportList";
import { Mascot } from "@/components/mascot";
import { FavoriteToggle } from "@/components/shared/FavoriteToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentProfile, getCurrentUser, getSupabase } from "@/lib/auth";
import { fetchReports } from "@/lib/feed";
import { getBeachForecast, parseBeachId } from "@/lib/forecast";
import { isFavoriteBeach } from "@/lib/profile-data";
import { REPORT_TTL_HOURS, reportCutoffIso } from "@/lib/reports";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS = { beginner: "מתחילים", intermediate: "בינוני", advanced: "מתקדמים" } as const;

const getBeach = cache(async (id: number) => {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("beaches")
    .select("id, name_he, city, region, difficulty, description")
    .eq("id", id)
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = parseBeachId((await params).id);
  const beach = id ? await getBeach(id) : null;
  return { title: beach ? `${beach.name_he} | surFriends` : "חוף | surFriends" };
}

const renderTimeMs = () => Date.now();

export default async function BeachPage({ params }: { params: Promise<{ id: string }> }) {
  const beachId = parseBeachId((await params).id);
  if (!beachId) notFound();

  const [supabase, user] = await Promise.all([getSupabase(), getCurrentUser()]);
  const userId = user?.id ?? "";

  const [beach, forecastRes, reports, profile, isFavorite] = await Promise.all([
    getBeach(beachId),
    getBeachForecast(beachId),
    fetchReports(supabase, reportCutoffIso(), null, userId, beachId),
    getCurrentProfile(),
    userId ? isFavoriteBeach(userId, beachId) : false,
  ]);
  if (!beach) notFound();

  const displayName =
    profile?.display_name ?? (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "משתמש";
  const avatarUrl = profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="חזרה לפיד"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "-ms-2 size-touch shrink-0")}
          >
            <ArrowRight aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              {beach.city} · {beach.region}
            </p>
            <h1 className="text-display heading-tight font-display font-normal text-gradient-sea">{beach.name_he}</h1>
          </div>
          {userId ? (
            <FavoriteToggle beachId={beach.id} beachName={beach.name_he} initialFavorite={isFavorite} />
          ) : null}
        </div>
        {beach.difficulty ? (
          <p>
            <span className="inline-flex h-7 items-center rounded-pill bg-signature-soft px-3 text-body-sm font-medium text-ink ring-1 ring-line">
              רמת קושי: {DIFFICULTY_LABELS[beach.difficulty]}
            </span>
          </p>
        ) : null}
        {beach.description ? <p className="text-body-sm text-copy prose-he">{beach.description}</p> : null}
      </header>

      {forecastRes.ok ? (
        <>
          <ForecastSummary forecast={forecastRes.forecast} />
          <WaveChart
            points={forecastRes.forecast.points}
            marineAvailable={forecastRes.forecast.marineAvailable}
            nowMs={renderTimeMs()}
          />
        </>
      ) : (
        <section className="glass-card flex items-center gap-4 rounded-card p-5" role="status">
          <Mascot.Oops size={96} />
          <div>
            <p className="text-heading heading-tight font-display font-normal text-ink">תחזית לא זמינה כרגע</p>
            <p className="mt-1 text-body-sm text-muted-text">הדיווחים מהחוף ממשיכים לעבוד כרגיל</p>
          </div>
        </section>
      )}

      <ReportList
        initialReports={reports}
        currentUserId={userId}
        currentUserName={displayName}
        currentUserAvatar={avatarUrl}
        beachId={beachId}
        heading={
          <>
            <p className="eyebrow eyebrow-coral">מהחוף · עכשיו</p>
            <h2 className="text-title heading-tight font-display font-normal text-ink">דיווחים מהחוף</h2>
            <p className="mt-1 text-caption text-muted-text">דיווחים נעלמים אחרי {REPORT_TTL_HOURS} שעות ⏳</p>
          </>
        }
        emptyState={
          <EmptyState title={`אין דיווחים מהחוף הזה ב-${REPORT_TTL_HOURS} השעות האחרונות`}>
            <Link href={`/new?beach=${beachId}`} className={cn(buttonVariants({ variant: "ocean" }), "min-h-touch")}>
              דווחו מכאן
            </Link>
          </EmptyState>
        }
      />
    </div>
  );
}
