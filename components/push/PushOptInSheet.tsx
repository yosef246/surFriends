"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { InstallHint } from "@/components/push/InstallHint";
import { Button } from "@/components/ui/button";
import { dismissOptIn, enablePush, isIOS, isStandalone } from "@/lib/push-client";

/** Small in-context card shown after the first favorite. Asks only after an explicit tap on "yes". */
export function PushOptInSheet({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [needInstall, setNeedInstall] = useState(false);
  const [done, setDone] = useState(false);

  async function yes() {
    if (busy) return;
    if (isIOS() && !isStandalone()) {
      setNeedInstall(true);
      return;
    }
    setBusy(true);
    const res = await enablePush();
    setBusy(false);
    if (res.ok) {
      setDone(true);
      window.setTimeout(onClose, 2500);
      return;
    }
    if (res.reason === "denied") {
      dismissOptIn();
      setNote("ההתראות חסומות. אפשר לשנות בהגדרות הדפדפן");
    } else if (res.reason === "dismissed") {
      dismissOptIn();
      onClose();
    } else {
      setNote(res.message ?? "לא הצלחנו להפעיל התראות. אפשר לנסות שוב בהגדרות");
    }
  }

  function later() {
    dismissOptIn();
    onClose();
  }

  // Portal: an ancestor with backdrop-filter/transform would otherwise capture `fixed`.
  return createPortal(
    <div
      role="dialog"
      aria-labelledby="push-optin-title"
      className="card-coast fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-card p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signature-soft text-ink ring-1 ring-line">
          <Bell className="size-5" aria-hidden />
        </span>
        <p id="push-optin-title" className="pt-2 text-body font-medium text-ink">
          {done ? "מעולה! נעדכן אתכם על דיווחים חדשים" : "רוצים התראה כשמישהו מדווח מכאן?"}
        </p>
      </div>
      {needInstall && <InstallHint />}
      {note && (
        <p role="alert" className="text-body-sm text-danger">
          {note}
        </p>
      )}
      {!done && (
        <div className="flex gap-2">
          {!needInstall && (
            <Button variant="ocean" size="sm" onClick={yes} disabled={busy} className="flex-1">
              כן, הפעילו
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={later} className="flex-1">
            {needInstall ? "הבנתי" : "לא עכשיו"}
          </Button>
        </div>
      )}
    </div>,
    document.body,
  );
}
