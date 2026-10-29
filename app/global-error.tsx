"use client";

import { Mascot } from "@/components/mascot";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef5fb", color: "#0b1b2b", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <div role="alert" style={{ padding: 24 }}>
          <Mascot.Oops size={96} />
          <p style={{ fontSize: 22, fontWeight: 600, margin: "16px 0 4px" }}>משהו השתבש</p>
          <p style={{ margin: "0 0 20px" }}>זה לא אצלכם. נסו שוב</p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, padding: "0 28px", borderRadius: 12, border: 0, background: "#0f5fa8", color: "#fff", fontSize: 16, cursor: "pointer" }}
          >
            נסו שוב
          </button>
        </div>
      </body>
    </html>
  );
}
