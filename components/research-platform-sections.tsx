import { BookOpen, FlaskConical, GraduationCap, Microscope, Rocket } from "lucide-react";

import { MOTION_INTERACTIVE } from "@/lib/ui-motion";

export function ResearchPlatformSections() {
  return (
  <>
      <section id="about" className="scroll-mt-24 border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">About</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">ExoPulse</h2>
          <p className="mt-1 text-base text-accent sm:text-lg">
            Secondary Eclipse &amp; Thermal Emission Profiler
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            ExoPulse is a NASA-aligned research environment for characterizing exoplanet atmospheres from
            phase-folded photometry. The platform ingests confirmed systems through TAP, detrends orbital
            signals, and extracts day-side thermal emission plus geometric albedo metrics with transparent,
            documented methodology.
          </p>
        </div>
      </section>

      <section id="users" className="scroll-mt-24 border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Users</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Who relies on ExoPulse</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <UserCard
              icon={Rocket}
              title="NASA Scientists"
              body="Mission architects validating secondary eclipse depths before JWST or Roman community follow-up programs."
            />
            <UserCard
              icon={Microscope}
              title="Exoplanet Researchers"
              body="Atmospheric modelers comparing thermal redistribution factors across hot Jupiters and ultra-hot Neptune regimes."
            />
            <UserCard
              icon={GraduationCap}
              title="Science Educators"
              body="Instructors demonstrating phase folding, detrending, and S/N-aware eclipse confidence in undergraduate labs."
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">How It Works</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Three-stage inference pipeline</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            <PipelineStep
              step={1}
              title="NASA TAP Ingest"
              detail="Query the Exoplanet Archive ps table for confirmed planets, host parameters, transit depths, and equilibrium temperatures."
            />
            <PipelineStep
              step={2}
              title="Signal Processing & Detrending"
              detail="Apply phase folding, optional 0–5× smoothing, and secondary-eclipse zoom windows to isolate planetary photometry."
            />
            <PipelineStep
              step={3}
              title="Thermal Emission & Albedo Extraction"
              detail="Map secondary eclipses across SPHEREx NIR bands and survey epochs, then report SPHEREx signal confidence scores."
            />
          </ol>
        </div>
      </section>

      <section id="use-cases" className="scroll-mt-24 border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Use Cases</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Example research scenarios</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ScenarioCard
              planet="WASP-121b"
              headline="Thermal inversion tracer"
              summary="Inflated ultra-short-period planet with strong day-side redistribution signatures and deep eclipse residuals ideal for smoothing stress tests."
            />
            <ScenarioCard
              planet="KELT-9b"
              headline="Ultra-hot atmosphere laboratory"
              summary="B-type host star and 4000 K+ irradiation — benchmark for eclipse confidence scoring when planetary flux rivals stellar photon noise."
            />
          </div>
        </div>
      </section>

      <section id="provenance" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">NASA Data Provenance</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Archive-linked science data</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Live catalog and host parameters are retrieved through the NASA Exoplanet Archive TAP sync service
            (Planetary Systems table, default_flag=1). Local JSON caches (eight curated hot Jupiters from
            <code className="mx-1 rounded bg-card px-1.5 py-0.5 text-xs">data_engine.py</code>) supplement offline demos
            when remote queries are rate-limited.
          </p>
          <p className="mt-3 text-sm text-muted">
            Service endpoint:{" "}
            <a
              className="text-accent underline-offset-2 hover:underline"
              href="https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
              target="_blank"
              rel="noopener noreferrer"
            >
              exoplanetarchive.ipac.caltech.edu/TAP/sync
            </a>
          </p>
        </div>
      </section>
  </>
  );
}

function UserCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <article className={`rounded-2xl border border-border bg-card/50 p-6 ${MOTION_INTERACTIVE}`}>
      <Icon className="size-6 text-accent" aria-hidden />
      <h3 className="mt-3 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function PipelineStep({
  step,
  title,
  detail,
}: {
  step: number;
  title: string;
  detail: string;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card/40 p-6">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
        {step}
      </span>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
    </li>
  );
}

function ScenarioCard({
  planet,
  headline,
  summary,
}: {
  planet: string;
  headline: string;
  summary: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-border bg-gradient-to-br from-card/80 to-background p-6 ${MOTION_INTERACTIVE}`}
    >
      <div className="flex items-center gap-2 text-accent">
        <FlaskConical className="size-5" aria-hidden />
        <span className="font-mono text-sm">{planet}</span>
      </div>
      <h3 className="mt-3 text-xl font-medium">{headline}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted">
        <BookOpen className="size-3.5" aria-hidden />
        Jump to dashboard and select {planet} in the catalog search.
      </p>
    </article>
  );
}
