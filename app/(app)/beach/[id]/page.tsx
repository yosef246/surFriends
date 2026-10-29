import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { ForecastSummary } from "@/components/forecast/ForecastSummary";
import { WaveChart } from "@/components/forecast/WaveChart";
import { ReportList } from "@/components/feed/ReportList";
import { Mascot } from "@/components/mascot";
import { FavoriteToggle } from "@/components/shared/FavoriteToggle";
import { PhotoHero } from "@/components/shared/PhotoHero";
import { RelativeAgo } from "@/components/shared/RelativeTime";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_DISPLAY_NAME } from "@/lib/profile";
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
    .select("id, name_he, city, region, difficulty, description, image_path, image_credit")
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
    profile?.display_name ?? (user?.user_metadata?.full_name as string | undefined) ?? DEFAULT_DISPLAY_NAME;
  const avatarUrl = profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PhotoHero
        priority
        imagePath={beach.image_path}
        imageCredit={beach.image_credit}
        eyebrow={
          <nav aria-label="נתיב" className="flex items-center gap-1">
            <Link href="/" className="py-1">
              חופים
            </Link>
            <ChevronLeft className="size-3.5" aria-hidden />
            <span aria-current="page">{beach.city}</span>
          </nav>
        }
        title={<h1>{beach.name_he}</h1>}
        topStart={
          <Link
            href="/"
            aria-label="חזרה לפיד"
            className="motion-press flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-raised"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        }
        topEnd={
          userId ? (
            <FavoriteToggle beachId={beach.id} beachName={beach.name_he} initialFavorite={isFavorite} />
          ) : null
        }
      >
        {forecastRes.ok ? (
          <RelativeAgo
            iso={forecastRes.forecast.fetchedAt}
            prefix="עודכן "
            className="text-label font-semibold text-coral-on-photo"
          />
        ) : null}
      </PhotoHero>

      {beach.difficulty || beach.description ? (
        <section className="card-coast flex flex-col gap-2" aria-label="על החוף">
          {beach.difficulty ? (
            <p>
              <span className="chip-link">רמת קושי: {DIFFICULTY_LABELS[beach.difficulty]}</span>
            </p>
          ) : null}
          {beach.description ? <p className="text-body-sm text-copy prose-he">{beach.description}</p> : null}
        </section>
      ) : null}

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
        <section className="card-coast flex items-center gap-4 p-5" role="status">
          <Mascot.Oops size={96} />
          <div>
            <p className="text-heading font-bold text-ink">תחזית לא זמינה כרגע</p>
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
            <h2 className="section-title">דיווחים מהחוף</h2>
            <p className="text-label text-muted-text">דיווחים נעלמים אחרי {REPORT_TTL_HOURS} שעות</p>
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
