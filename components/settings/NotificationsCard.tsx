"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { sendTestPushAction, setPushEnabled } from "@/app/actions/push";
import { InstallHint } from "@/components/push/InstallHint";
import { Button } from "@/components/ui/button";
import { disablePush, enablePush, getPushEnv, type PushEnv } from "@/lib/push-client";
import type { FavoriteBeach } from "@/lib/profile-data";
import { cn } from "@/lib/utils";

type Props = { accountEnabled: boolean; favorites: FavoriteBeach[] };

/** Web Push opt-in. Notifications are per device (permission + subscription); `accountEnabled` pauses all devices. */
export function NotificationsCard({ accountEnabled, favorites }: Props) {
  const [env, setEnv] = useState<PushEnv | "loading">("loading");
  const [account, setAccount] = useState(accountEnabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    getPushEnv().then((e) => alive && setEnv(e));
    return () => {
      alive = false;
    };
  }, []);

  async function turnOn() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const res = await enablePush();
    if (res.ok) {
      setAccount(true);
      setEnv("on");
      setMsg({ kind: "ok", text: "נעדכן אתכם על דיווחים חדשים מהחופים המועדפים" });
    } else if (res.reason === "denied") {
      setEnv("denied");
    } else if (res.reason === "ios-install") {
      setEnv("ios-install");
    } else if (res.reason === "error") {
      setMsg({ kind: "error", text: res.message ?? "לא הצלחנו להפעיל התראות. נסו שוב" });
    }
    setBusy(false);
  }

  async function turnOff() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const res = await disablePush();
    if (res.ok) {
      setEnv("off");
      setMsg({ kind: "ok", text: "כיביתם התראות במכשיר הזה" });
    } else {
      setMsg({ kind: "error", text: res.message });
    }
    setBusy(false);
  }

  async function sendTest() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await sendTestPushAction();
      setMsg("error" in res ? { kind: "error", text: res.error } : { kind: "ok", text: "נשלחה התראת בדיקה" });
    } catch {
      setMsg({ kind: "error", text: "שליחת ההתראה נכשלה, נסו שוב" });
    }
    setBusy(false);
  }

  async function toggleAccount() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const next = !account;
    const res = await setPushEnabled(next);
    if ("error" in res) setMsg({ kind: "error", text: res.error });
    else setAccount(next);
    setBusy(false);
  }

  const on = env === "on";

  return (
    <section aria-labelledby="notifications-heading" className="glass-card flex flex-col gap-4 rounded-card p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-signature-soft text-ink ring-1 ring-line">
          {env === "denied" || env === "unsupported" ? (
            <BellOff className="size-5" aria-hidden />
          ) : (
            <Bell className="size-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="notifications-heading" className="text-heading heading-tight font-display font-normal text-ink">
            התראות
          </h2>
          <p id="notifications-desc" className="mt-1 text-body-sm text-muted-text">
            נעדכן אתכם כשיש דיווח חדש מהחופים המועדפים. ההתראות פועלות לכל מכשיר בנפרד
          </p>
        </div>
        {(on || env === "off") && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="notifications-heading"
            aria-describedby="notifications-desc"
            disabled={busy}
            onClick={on ? turnOff : turnOn}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-pill ring-1 ring-line transition-colors disabled:opacity-60",
              on ? "bg-signature" : "bg-surface",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1 size-5 rounded-full bg-white shadow-card transition-[inset-inline-start]",
                on ? "start-6" : "start-1",
              )}
            />
          </button>
        )}
      </div>

      {env === "unsupported" && <p className="text-body-sm text-copy">הדפדפן הזה לא תומך בהתראות</p>}

      {env === "ios-install" && <InstallHint />}

      {env === "denied" && (
        <p className="text-body-sm text-copy">
          ההתראות חסומות בדפדפן. אפשר לאפשר אותן בהגדרות האתר (סמל המנעול ליד הכתובת, או הגדרות האפליקציה בטלפון) ואז לחזור לכאן
        </p>
      )}

      {env === "off" && (
        <Button variant="ocean" onClick={turnOn} disabled={busy} className="w-full">
          <Bell aria-hidden />
          הפעילו התראות
        </Button>
      )}

      {on && (
        <div className="flex flex-col gap-3">
          <Button variant="outline" size="sm" onClick={sendTest} disabled={busy || !account} className="self-start">
            שלחו התראת בדיקה
          </Button>
          {!account && (
            <p className="text-body-sm text-copy">
              ההתראות מושהות בכל המכשירים של החשבון.{" "}
              <button type="button" onClick={toggleAccount} disabled={busy} className="text-link underline underline-offset-4">
                חידוש
              </button>
            </p>
          )}
          {account && (
            <button
              type="button"
              onClick={toggleAccount}
              disabled={busy}
              className="self-start text-caption text-muted-text underline underline-offset-4"
            >
              השהיה בכל המכשירים
            </button>
          )}
          {favorites.length > 0 ? (
            <div>
              <p className="text-body-sm font-medium text-ink">תקבלו התראות מהחופים:</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {favorites.map((b) => (
                  <li key={b.id} className="rounded-pill bg-signature-soft px-3 py-1 text-caption text-ink">
                    {b.name}
                  </li>
                ))}
              </ul>
              <Link href="/profile" className="mt-2 inline-block text-body-sm text-link underline underline-offset-4">
                בחרו חופים
              </Link>
            </div>
          ) : (
            <p className="text-body-sm text-copy">אין חופים מועדפים, היכנסו לחוף ולחצו ⭐</p>
          )}
        </div>
      )}

      <p role="status" className={msg ? cn("text-body-sm", msg.kind === "error" ? "text-danger" : "text-success") : "sr-only"}>
        {msg?.text ?? ""}
      </p>
    </section>
  );
}
