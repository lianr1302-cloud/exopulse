import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ExoPulseLogo } from "@/components/logo";
import { MOTION_DASHBOARD_BUTTON, MOTION_INTERACTIVE, MOTION_LINK } from "@/lib/ui-motion";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#users", label: "Our Users" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
] as const;

const NAV_PROVENANCE = { href: "#provenance", label: "NASA Data Provenance" } as const;
const NAV_DASHBOARD = { href: "#dashboard", label: "Explore Dashboard" } as const;

const NASA_DATA_LINKS = [
  {
    label: "NASA Open Data Portal",
    href: "https://exoplanetarchive.ipac.caltech.edu",
    primary: true,
  },
  {
    label: "MAST TESS Archive",
    href: "https://archive.stsci.edu/missions-and-data/tess",
    primary: false,
  },
  {
    label: "NASA Kepler Open Dataset",
    href: "https://data.nasa.gov/dataset/kepler",
    primary: false,
  },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="#" className={`flex items-center gap-2 text-foreground ${MOTION_LINK}`}>
            <ExoPulseLogo size={34} className="shrink-0 rounded-md" priority />
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-wide sm:text-base">ExoPulse</span>
              <span className="hidden text-[10px] font-normal text-muted sm:block">
                Secondary Eclipse &amp; Thermal Emission Profiler
              </span>
            </span>
          </Link>
          <nav
            className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs sm:gap-x-5 sm:text-sm"
            aria-label="Primary"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-muted hover:text-accent ${MOTION_LINK}`}
                >
                  {item.label}
                </a>
              ))}
              <a
                href={NAV_PROVENANCE.href}
                className={`text-muted hover:text-accent ${MOTION_LINK}`}
              >
                {NAV_PROVENANCE.label}
              </a>
            </div>
            <a
              href={NAV_DASHBOARD.href}
              className={`shrink-0 rounded-lg border border-accent/35 bg-accent/10 px-3 py-1.5 font-medium text-accent hover:border-accent hover:bg-blue-600/30 sm:ml-2 ${MOTION_DASHBOARD_BUTTON}`}
            >
              {NAV_DASHBOARD.label}
            </a>
          </nav>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
          {NASA_DATA_LINKS.map((link) =>
            link.primary ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-lg border border-accent bg-accent/15 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/25 sm:text-sm ${MOTION_INTERACTIVE}`}
              >
                NASA Open Data Portal
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] text-muted hover:border-accent/50 hover:text-accent sm:text-xs ${MOTION_INTERACTIVE}`}
              >
                {link.label}
                <ExternalLink className="size-3 opacity-70" aria-hidden />
              </a>
            ),
          )}
        </div>
      </div>
    </header>
  );
}