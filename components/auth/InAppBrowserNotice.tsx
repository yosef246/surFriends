"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

function copyWithFallback(text: string): boolean {
  const input = document.createElement("input");
  input.value = text;
  input.setAttribute("readonly", "");
  input.setAttribute("aria-hidden", "true");
  input.tabIndex = -1;
  input.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(input);
  return ok;
}

export function InAppBrowserNotice() {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(/Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) ? "ios" : "other");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const url = window.location.href;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = copyWithFallback(url);
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  function openInChrome() {
    const { host, pathname, search } = window.location;
    window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
  }

  return (
    <section
      aria-label="התחברות מדפדפן פנימי"
      className="flex w-full flex-col gap-3 rounded-card bg-card p-4 shadow-card"
    >
      <p className="text-body font-medium text-ink">פתחו את הקישור ב-Chrome או Safari כדי להתחבר</p>
      <p className="text-body-sm text-muted-text">Google לא מאפשר התחברות מתוך WhatsApp / Instagram</p>
      <div className="flex flex-col gap-2">
        {platform === "android" ? (
          <Button type="button" variant="accent" className="w-full" onClick={openInChrome}>
            <ExternalLink aria-hidden />
            פתח ב-Chrome
          </Button>
        ) : null}
        <Button type="button" variant="outline" className="w-full" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "הקישור הועתק ✓" : "העתק קישור"}
        </Button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? "הקישור הועתק" : ""}
        </span>
      </div>
      {platform === "ios" ? (
        <p className="text-caption text-muted-text">או לחצו על ⋯ ובחרו &apos;פתח ב-Safari&apos;</p>
      ) : null}
    </section>
  );
}
