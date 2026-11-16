"use client";

import { useEffect, useRef, useState } from "react";

const PREVIEW_IMAGE = "/hero-dashboard-preview.png";

const FLOATING_BADGES = [
  { text: "Phase 0.5 Secondary Eclipse Zoom", position: "left-3 top-3 sm:left-4 sm:top-4" },
  { text: "NASA TAP API Connected", position: "right-3 top-3 sm:right-4 sm:top-4" },
  { text: "8 Planet Systems Active", position: "bottom-3 left-3 sm:bottom-4 sm:left-4" },
] as const;

export function HeroDashboardPreviewMockup() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [imageOk, setImageOk] = useState(false);

  useEffect(() => {
    const probe = new window.Image();
    probe.src = PREVIEW_IMAGE;
    probe.onload = () => setImageOk(true);
    probe.onerror = () => setImageOk(false);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`mt-10 transition-all duration-700 ease-out sm:mt-12 ${
        entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
        <div className="relative">
          <BrowserChrome />
          <div className="relative min-h-[240px] border-t border-slate-800/80 bg-gradient-to-b from-[#0a1020] to-[#070b14] p-4 sm:min-h-[320px] sm:p-6">
            {imageOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={PREVIEW_IMAGE}
                alt="ExoPulse dashboard preview"
                className="h-auto w-full rounded-lg border border-slate-800/80 object-cover"
                onError={() => setImageOk(false)}
              />
            ) : (
              <DashboardPreviewFallback />
            )}

            {FLOATING_BADGES.map((badge) => (
              <span
                key={badge.text}
                className={`pointer-events-none absolute ${badge.position} max-w-[46%] rounded-full border border-accent/25 bg-slate-950/80 px-2.5 py-1 text-[10px] font-medium text-accent shadow-lg shadow-blue-500/10 backdrop-blur-sm sm:max-w-none sm:px-3 sm:text-xs`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#dashboard"
        className="scroll-hint mt-6 flex flex-col items-center gap-1 text-xs text-muted transition-colors hover:text-accent sm:text-sm"
      >
        <span>Scroll to Explore Live Dashboard</span>
        <span aria-hidden className="text-base">
          ↓
        </span>
      </a>
    </div>
  );
}

function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 border-b border-slate-800/90 bg-slate-900/80 px-4 py-3">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="mx-auto flex min-w-0 flex-1 justify-center px-2 sm:max-w-md">
        <p className="w-full truncate rounded-full border border-slate-700/80 bg-slate-950/90 px-4 py-1 text-center text-[11px] text-slate-400 sm:text-xs">
          exopulse.vercel.app
        </p>
      </div>
      <PreviewSpacer width={44} />
    </div>
  );
}

function PreviewSpacer({ width }: { width: number }) {
  return <span className="hidden shrink-0 sm:inline-block" style={{ width }} aria-hidden />;
}

function DashboardPreviewFallback() {
  return (
    <div className="rounded-lg border border-slate-800/80 bg-card/30 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-accent sm:text-xs">Explore Dashboard</p>
          <h3 className="text-lg font-semibold text-foreground sm:text-xl">ExoPulse</h3>
        </div>
        <span className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted sm:text-xs">
          WASP-121b · P = 1.275 d
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Eclipse depth", value: "528", unit: "ppm" },
          { label: "T_day", value: "2480", unit: "K" },
          { label: "A_g", value: "0.050", unit: "" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border/80 bg-background/60 px-2 py-2 sm:px-3 sm:py-3"
          >
            <p className="text-[9px] uppercase text-muted sm:text-[10px]">{metric.label}</p>
            <p className="mt-1 font-mono text-xs font-semibold text-foreground sm:text-sm">
              {metric.value}
              {metric.unit ? (
                <span className="ml-1 text-[10px] font-normal text-muted">{metric.unit}</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/80 bg-background/50 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-muted">Phase-folded light curve</p>
        <svg viewBox="0 0 400 120" className="h-28 w-full sm:h-36" role="img" aria-label="Sample light curve">
          <defs>
            <linearGradient id="previewLine" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#4f8cff" stopOpacity="1" />
              <stop offset="100%" stopColor="#4f8cff" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            d="M0,62 C20,62 38,12 48,14 C58,16 68,62 90,62 C112,62 128,48 150,48 C172,48 188,90 210,90 C232,90 248,62 270,62 C292,62 312,58 335,58 C358,58 378,62 400,62"
            fill="none"
            stroke="url(#previewLine)"
            strokeWidth="2.5"
          />
          <line x1="0" y1="62" x2="400" y2="62" stroke="#1e2a45" strokeDasharray="4 4" />
          <line x1="200" y1="20" x2="200" y2="100" stroke="#f59e0b" strokeDasharray="4 4" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}