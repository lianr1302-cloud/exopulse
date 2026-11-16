"use client";

import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";

import { HeroDashboardPreviewMockup } from "@/components/hero-dashboard-preview";
import { MOTION_DASHBOARD_BUTTON } from "@/lib/ui-motion";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [fade, setFade] = useState({ opacity: 1, translateY: 0 });

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const scrollY = window.scrollY;
      const fadeDistance = Math.max(section.offsetHeight * 0.85, 420);
      const progress = Math.min(1, Math.max(0, scrollY / fadeDistance));

      setFade({
        opacity: 1 - progress,
        translateY: -18 * progress,
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const fadeStyle = {
    opacity: fade.opacity,
    transform: `translate3d(0, ${fade.translateY}px, 0)`,
    transition: "opacity 120ms linear, transform 120ms linear",
    pointerEvents: fade.opacity < 0.15 ? ("none" as const) : ("auto" as const),
  };

  return (
    <section
      ref={sectionRef}
      className="border-b border-border/60 bg-background/40 pb-14 pt-20 sm:pb-16 sm:pt-24"
      aria-label="ExoPulse introduction"
    >
      <div
        className="mx-auto max-w-6xl px-4 will-change-[opacity,transform] sm:px-6 lg:px-8"
        style={fadeStyle}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            NASA International Space Apps Challenge 2026 · Planet X &amp; SPHEREx
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">ExoPulse</h1>
          <p className="mt-3 text-lg text-accent sm:text-xl">
            SPHEREx Near-Infrared &amp; Exoplanet Thermal Profiler
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg">
            Open-access secondary eclipse phase-folding and 102-band SPHEREx thermal emission profiling
            for 5,500+ confirmed exoplanets from NASA archives.
          </p>
          <a
            href="#dashboard"
            className={`mt-8 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-6 py-3 text-sm font-medium text-accent hover:border-accent hover:bg-blue-600/35 ${MOTION_DASHBOARD_BUTTON}`}
          >
            <Users className="size-4" aria-hidden />
            Open interactive dashboard
          </a>
        </div>

        <HeroDashboardPreviewMockup />
      </div>
    </section>
  );
}