"use client";

import { useEffect, useRef, useState } from "react";

/** Report body clamped to 6 lines with an "עוד" toggle, shown only when the text actually overflows. */
export function ReportText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  return (
    <div className="flex flex-col items-start gap-0.5">
      <p
        ref={ref}
        className={`text-body break-words whitespace-pre-line text-copy prose-he${expanded ? "" : " line-clamp-6"}`}
      >
        {text}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="-my-2 min-h-touch text-body-sm font-semibold text-brand"
        >
          {expanded ? "פחות" : "עוד"}
        </button>
      ) : null}
    </div>
  );
}
