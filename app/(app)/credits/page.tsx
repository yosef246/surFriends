import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { parseCredits, type CreditRow } from "@/lib/credits";

export const metadata: Metadata = { title: "קרדיט לתמונות | surFriends" };

async function loadCredits(): Promise<CreditRow[]> {
  try {
    const md = await readFile(path.join(process.cwd(), "public", "beaches", "CREDITS.md"), "utf8");
    return parseCredits(md);
  } catch {
    return [];
  }
}

export default async function CreditsPage() {
  const rows = await loadCredits();
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2 pt-2">
        <Link
          href="/"
          aria-label="חזרה לפיד"
          className="motion-press -ms-2 flex size-touch shrink-0 items-center justify-center rounded-full text-ink"
        >
          <ArrowRight aria-hidden />
        </Link>
        <div>
          <p className="eyebrow">תמונות החופים</p>
          <h1 className="text-title font-bold text-ink">קרדיט לתמונות</h1>
        </div>
      </header>
      <p className="text-body-sm text-copy prose-he">
        תמונות החופים באפליקציה מגיעות מ-Wikimedia Commons ברישיונות Creative Commons. תודה לצלמים.
      </p>
      {rows.length === 0 ? (
        <p role="status" className="card-coast text-body-sm text-muted-text">
          הרשימה לא זמינה כרגע.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.file} className="card-coast flex flex-col gap-1">
              <p className="text-body font-bold text-ink">{r.author}</p>
              <p className="text-label text-muted-text">
                {r.licenseUrl ? (
                  <a href={r.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
                    <bdi>{r.license}</bdi>
                  </a>
                ) : (
                  <bdi>{r.license}</bdi>
                )}
                {" · "}
                <bdi>{r.file}</bdi>
              </p>
              {r.source ? (
                <a
                  href={r.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-touch items-center gap-1 text-label font-semibold text-brand"
                >
                  מקור התמונה
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
