import {
  Activity,
  BadgeCheck,
  BookOpen,
  Database,
  Download,
  FlaskConical,
  GraduationCap,
  Layers,
  Microscope,
  Rocket,
  Thermometer,
} from "lucide-react";

import { MOTION_INTERACTIVE } from "@/lib/ui-motion";

export function ResearchPlatformSections() {
  return (
  <>
      <section id="about" className="scroll-mt-24 border-b border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">About</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">ExoPulse</h2>
          <p className="mt-1 text-base text-accent sm:text-lg">
            SPHEREx Near-Infrared &amp; Exoplanet Thermal Profiler
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            ExoPulse is an open-access, web-based astrophysics platform designed to democratize exoplanet
            secondary eclipse phase-folding and multi-band near-infrared thermal emission profiling using
            data from NASA&apos;s SPHEREx mission and open astronomical archives.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Database}
              title="Instant NASA TAP API Ingestion"
              body="Query 5,500+ confirmed exoplanets directly from the NASA Exoplanet Archive in 1–3 seconds."
            />
            <FeatureCard
              icon={Activity}
              title="Phase 0.5 Secondary Eclipse Detrending"
              body="Automated phase-folding isolates micro-flux thermal dips buried in photon noise."
            />
            <FeatureCard
              icon={Layers}
              title="SPHEREx 102-Band Spectrophotometry"
              body="Interactive slider across near-infrared channels from 0.75 µm to 5.0 µm."
            />
            <FeatureCard
              icon={Thermometer}
              title="Planck Blackbody Fitting"
              body="Extract day-side equilibrium temperatures (T_day) and geometric albedos (A_g)."
            />
            <FeatureCard
              icon={BadgeCheck}
              title="AI Signal Quality Scorecard"
              body="Random Forest classifier for S/N ≥ 5.4σ significance and candidate confidence (ROC-AUC = 0.927)."
            />
            <FeatureCard
              icon={Download}
              title="Open Data Export"
              body="One-click structured JSON and CSV downloads for research proposals."
            />
          </div>
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
            Live catalog and host parameters are retrieved through the NASA Exoplanet Archive TAP sync
            service (Planetary Systems table, default_flag=1). Local JSON caches (eight curated hot Jupiters
            from
            <code className="mx-1 rounded bg-card px-1.5 py-0.5 text-xs">data_engine.py</code>) supplement
            offline demos when remote queries are rate-limited.
          </p>
          <ol className="mt-5 max-w-3xl list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>NASA Exoplanet Archive TAP API (Caltech/IPAC)</li>
            <li>MAST TESS SPOC PDCSAP Light Curves</li>
            <li>Kepler Mission Open Data Photometry</li>
            <li>SPHEREx Sky Survey Archives</li>
          </ol>
          <p className="mt-4 text-sm text-muted">
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

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <article className={`rounded-2xl border border-border bg-card/50 p-5 ${MOTION_INTERACTIVE}`}>
      <Icon className="size-5 text-accent" aria-hidden />
      <h3 className="mt-3 text-base font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
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
