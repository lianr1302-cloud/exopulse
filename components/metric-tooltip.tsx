"use client";

import { CircleHelp } from "lucide-react";

interface MetricTooltipProps {
  text: string;
  id: string;
}

export function MetricTooltip({ text, id }: MetricTooltipProps) {
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        className="group ml-1.5 inline-flex size-5 items-center justify-center rounded-full border border-border/80 text-muted transition hover:border-accent hover:text-accent"
        aria-describedby={id}
      >
        <CircleHelp className="size-3" aria-hidden />
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 hidden w-64 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-left text-[11px] font-normal leading-snug text-muted shadow-xl group-hover:block group-focus-visible:block"
        >
          {text}
        </span>
      </button>
    </span>
  );
}