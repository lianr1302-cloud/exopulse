"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  Download,
  Loader2,
  Orbit,
  Sun,
  Thermometer,
  Telescope,
  ZoomIn,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LeapsScorecardPanel } from "@/components/leaps-scorecard";
import { PhysicsMethodologyCard } from "@/components/physics-methodology";
import { MetricTooltip } from "@/components/metric-tooltip";
import { SearchableTargetSelector } from "@/components/planet-catalog-search";
import { SpherExSpectrumChart } from "@/components/spherex-spectrum-chart";
import { BENCHMARK_PRESETS } from "@/lib/benchmark-presets";
import { buildSpherexSpectrumCurve } from "@/lib/spherex-spectrum";
import { buildSmoothedLightCurve } from "@/lib/light-curve-smooth";
import { computeLeapsScorecard } from "@/lib/leaps-score";
import { MOTION_DASHBOARD_BUTTON, MOTION_INTERACTIVE } from "@/lib/ui-motion";
import { downloadLightCurveCsv, downloadResearchReportJson } from "@/lib/export-report";
import { NASA_PLANET_NAMES } from "@/lib/nasa-archive";
import {
  SPHEREX_ANCHOR_BANDS,
  SPHEREX_MAX_BAND,
  SPHEREX_MIN_BAND,
  wavelengthUmForSpherexBand,
} from "@/lib/spherex-channels";
import { cachedTargetToNasaRecord } from "@/lib/target-from-cache";
import { buildTargetFromNasa, type NasaPlanetRecord } from "@/lib/target-resolver";
import { getSpherExBand, type SpherExEpoch } from "@/lib/spherex-model";
import { theoreticalDayTemperatureK } from "@/lib/thermal-model";
import type { ExoplanetDataset, TargetSystem } from "@/types/exoplanet";

interface ExoPulseDashboardProps {
  dataset: ExoplanetDataset;
}

function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function findCachedTarget(dataset: ExoplanetDataset, key: string): TargetSystem | undefined {
  const compact = key.toLowerCase().replace(/\s+/g, "");
  return dataset.targets.find(
    (t) =>
      t.target_id.toLowerCase() === compact ||
      t.planetary_parameters.name.toLowerCase().replace(/\s+/g, "") === compact,
  );
}

function toPlName(key: string): string {
  return NASA_PLANET_NAMES[key] ?? (key.includes(" ") ? key : key.replace(/b$/i, " b"));
}

export function ExoPulseDashboard({ dataset }: ExoPulseDashboardProps) {
  const localIds = useMemo(() => dataset.targets.map((t) => t.target_id), [dataset.targets]);
  const initial = dataset.targets[0];

  const [activeTarget, setActiveTarget] = useState<TargetSystem | null>(initial ?? null);
  const [selectedLabel, setSelectedLabel] = useState(initial?.target_id ?? "");
  const [nasaRow, setNasaRow] = useState<NasaPlanetRecord | null>(null);
  const [smoothing, setSmoothing] = useState(0);
  const [heatRedistribution, setHeatRedistribution] = useState(0.5);
  const [zoomEclipse, setZoomEclipse] = useState(false);
  const [nasaLoading, setNasaLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [spherexBandId, setSpherexBandId] = useState(50);
  const [spherexEpoch, setSpherexEpoch] = useState<SpherExEpoch>(1);
  const [showPassOverlay, setShowPassOverlay] = useState(true);

  useEffect(() => {
    if (initial) {
      setNasaRow(cachedTargetToNasaRecord(initial));
    }
  }, [initial]);

  const remixWithRedistribution = useCallback(
    (
      row: NasaPlanetRecord,
      f: number,
      source: "cache" | "synthetic",
      bandId: number,
      epoch: SpherExEpoch,
    ) => {
      const rebuilt = buildTargetFromNasa(row, f, source, bandId, epoch);
      setActiveTarget(rebuilt);
    },
    [],
  );

  const isDefaultSpherExView = spherexBandId === 50 && spherexEpoch === 1;

  useEffect(() => {
    if (!nasaRow) {
      return;
    }
    const cached = findCachedTarget(dataset, selectedLabel);
    if (cached && Math.abs(heatRedistribution - 0.5) < 0.005 && isDefaultSpherExView) {
      setActiveTarget({
        ...cached,
        derived_physical_parameters: {
          ...cached.derived_physical_parameters,
          day_side_thermal_temperature_k: theoreticalDayTemperatureK(
            cached.planetary_parameters.equilibrium_temp_k,
            heatRedistribution,
          ),
        },
      });
      return;
    }
    remixWithRedistribution(
      nasaRow,
      heatRedistribution,
      cached ? "cache" : "synthetic",
      spherexBandId,
      spherexEpoch,
    );
  }, [
    heatRedistribution,
    nasaRow,
    remixWithRedistribution,
    dataset,
    selectedLabel,
    spherexBandId,
    spherexEpoch,
    isDefaultSpherExView,
  ]);

  const resolvePlanet = async (name: string, fromCacheHint: boolean) => {
    setResolveLoading(true);
    setSelectedLabel(name);
    const cached = fromCacheHint ? findCachedTarget(dataset, name) : findCachedTarget(dataset, name);

    try {
      const plQuery = toPlName(name);
      const res = await fetch(
        `/api/nasa-tap/planet?pl_name=${encodeURIComponent(plQuery)}&targetId=${encodeURIComponent(name)}`,
      );
      const payload = await res.json();
      const row = payload.row as NasaPlanetRecord | null;

      if (row) {
        setNasaRow(row);
        if (cached && Math.abs(heatRedistribution - 0.5) < 0.005 && isDefaultSpherExView) {
          setActiveTarget({
            ...cached,
            derived_physical_parameters: {
              ...cached.derived_physical_parameters,
              day_side_thermal_temperature_k: theoreticalDayTemperatureK(
                cached.planetary_parameters.equilibrium_temp_k,
                heatRedistribution,
              ),
            },
          });
        } else {
          remixWithRedistribution(
            row,
            heatRedistribution,
            cached ? "cache" : "synthetic",
            spherexBandId,
            spherexEpoch,
          );
        }
      } else if (cached) {
        setNasaRow(cachedTargetToNasaRecord(cached));
        setActiveTarget(cached);
      }
    } finally {
      setResolveLoading(false);
    }
  };

  const applyBenchmarkPreset = async (targetId: string, heatF: number, bandId: number) => {
    setSmoothing(0);
    setHeatRedistribution(heatF);
    setSpherexBandId(bandId);
    setSpherexEpoch(1);
    setSelectedLabel(targetId);
    setResolveLoading(true);

    try {
      const cached = findCachedTarget(dataset, targetId);
      const plQuery = toPlName(targetId);
      const res = await fetch(
        `/api/nasa-tap/planet?pl_name=${encodeURIComponent(plQuery)}&targetId=${encodeURIComponent(targetId)}`,
      );
      const payload = await res.json();
      const row = (payload.row as NasaPlanetRecord | null) ?? (cached ? cachedTargetToNasaRecord(cached) : null);

      if (!row) {
        return;
      }
      setNasaRow(row);
      remixWithRedistribution(row, heatF, cached ? "cache" : "synthetic", bandId, 1);
    } finally {
      setResolveLoading(false);
    }
  };

  const fetchNasaTap = async () => {
    if (!selectedLabel) {
      return;
    }
    setNasaLoading(true);
    try {
      await resolvePlanet(selectedLabel, Boolean(findCachedTarget(dataset, selectedLabel)));
    } finally {
      setNasaLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!activeTarget) {
      return [];
    }
    const phases = activeTarget.light_curve.orbital_phase;
    const flux = activeTarget.light_curve.normalized_flux;

    const passSmoothed = ([1, 2, 3] as const).map((epoch) => {
      if (!nasaRow || !showPassOverlay) {
        return null;
      }
      const cached = findCachedTarget(dataset, selectedLabel);
      const rebuilt = buildTargetFromNasa(
        nasaRow,
        heatRedistribution,
        cached ? "cache" : "synthetic",
        spherexBandId,
        epoch,
      );
      return buildSmoothedLightCurve(phases, rebuilt.light_curve.normalized_flux, smoothing);
    });

    const activeSmoothed = buildSmoothedLightCurve(phases, flux, smoothing);

    let rows = activeSmoothed.map((row, i) => ({
      ...row,
      pass1: passSmoothed[0]?.[i]?.fittedFlux,
      pass2: passSmoothed[1]?.[i]?.fittedFlux,
      pass3: passSmoothed[2]?.[i]?.fittedFlux,
    }));

    if (zoomEclipse) {
      rows = rows.filter((row) => row.phase >= 0.45 && row.phase <= 0.55);
    }
    return rows;
  }, [
    activeTarget,
    smoothing,
    zoomEclipse,
    nasaRow,
    showPassOverlay,
    dataset,
    selectedLabel,
    heatRedistribution,
    spherexBandId,
  ]);

  const spherexSpectrum = useMemo(() => {
    if (!activeTarget) {
      return [];
    }
    const { stellar_parameters: s, planetary_parameters: p, derived_physical_parameters: d } =
      activeTarget;
    const tDay = theoreticalDayTemperatureK(p.equilibrium_temp_k, heatRedistribution);
    return buildSpherexSpectrumCurve({
      st_teff: s.teff_k,
      st_rad: s.radius_sun,
      pl_radj: p.radius_jupiter,
      semi_major_au: p.semi_major_axis_au,
      t_day_k: tDay,
      geometric_albedo: d.geometric_albedo_ag,
      epoch: spherexEpoch,
    });
  }, [activeTarget, heatRedistribution, spherexEpoch]);

  if (!activeTarget) {
    return (
      <section id="dashboard" className="scroll-mt-24 py-12 text-center text-muted">
        No targets available — run data_engine.py
      </section>
    );
  }

  const { derived_physical_parameters: derived, planetary_parameters: planet, stellar_parameters: star } =
    activeTarget;

  const tDayTheoretical = theoreticalDayTemperatureK(
    planet.equilibrium_temp_k,
    heatRedistribution,
  );

  const spherexBand = getSpherExBand(spherexBandId);
  const leapsScore = computeLeapsScorecard(
    derived.secondary_eclipse_depth_ppm,
    activeTarget.light_curve.noise_rms_ppm,
    smoothing,
    spherexBandId,
  );
  const bandWavelengthUm = wavelengthUmForSpherexBand(spherexBandId);

  const fluxValues = chartData.map((d) => d.fittedFlux);
  const yMin = fluxValues.length ? Math.min(...fluxValues) : 0.99;
  const yMax = fluxValues.length ? Math.max(...fluxValues) : 1.01;
  const yPad = (yMax - yMin) * 0.2 || 0.0003;

  const exportReport = () => {
    const derivedOut = {
      ...derived,
      day_side_thermal_temperature_k: tDayTheoretical,
    };
    downloadResearchReportJson({
      generatedAt: new Date().toISOString(),
      platform: "ExoPulse",
      challenge: "2026 NASA Space Apps — Planet X & SPHEREx",
      target_id: activeTarget.target_id,
      stellar_parameters: star,
      planetary_parameters: planet,
      derived: derivedOut,
      light_curve: activeTarget.light_curve,
      spherex_channel_flux: spherexSpectrum,
      target: {
        ...activeTarget,
        derived_physical_parameters: derivedOut,
      },
      analysis: {
        heat_redistribution_factor: heatRedistribution,
        leaps_candidate_confidence_percent: leapsScore.candidateConfidencePercent,
        leaps_roc_auc: leapsScore.rocAuc,
        ai_snr_sigma: leapsScore.snrSigma,
        red_noise_filtered: leapsScore.redNoiseFiltered,
        spherex_band: spherexBandId,
        spherex_wavelength_um: bandWavelengthUm,
        spherex_epoch: spherexEpoch,
        smoothing_factor: smoothing,
      },
    });
    downloadLightCurveCsv(activeTarget);
  };

  return (
    <section id="dashboard" className="scroll-mt-24 border-t border-border/60 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a
              href="#dashboard"
              className={`inline-flex w-fit items-center rounded-lg border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:border-accent hover:bg-blue-600/30 ${MOTION_DASHBOARD_BUTTON}`}
            >
              Explore Dashboard
            </a>
            <div className="mt-1 flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="ExoPulse logo"
                width={36}
                height={36}
                className="shrink-0 rounded-md"
              />
              <h2 className="text-3xl font-semibold tracking-tight">ExoPulse</h2>
            </div>
            <p className="text-sm text-accent">SPHEREx Near-Infrared &amp; Exoplanet Thermal Profiler</p>
            <p className="mt-2 max-w-xl text-sm text-muted">
              2026 NASA Space Apps — Planet X &amp; SPHEREx: query any confirmed world via TAP, fold
              photometry in 102 NIR channels, and export thermal retrieval metrics.
            </p>
          </div>
          <SearchableTargetSelector
            localTargets={localIds}
            value={selectedLabel}
            onSelect={(name, fromCache) => void resolvePlanet(name, fromCache)}
          />
        </header>

        <LeapsScorecardPanel
          scorecard={leapsScore}
          planetName={planet.name}
          loading={resolveLoading}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Activity}
            label="Secondary Eclipse Depth"
            tooltipId="tooltip-eclipse-depth"
            tooltip="Measures the micro-flux drop (in ppm) when the planet passes behind its host star, isolating planetary thermal heat and reflected light."
            value={formatNumber(derived.secondary_eclipse_depth_ppm, 1)}
            unit="ppm"
          />
          <MetricCard
            icon={Thermometer}
            label="Day-Side Temperature (T_day)"
            tooltipId="tooltip-t-day"
            tooltip="Calculates the planet's day-side equilibrium temperature in Kelvin using Planck blackbody radiation."
            detail={`f = ${heatRedistribution.toFixed(2)} · λ = ${spherexBand.wavelength_um} µm`}
            value={formatNumber(tDayTheoretical, 0)}
            unit="K"
          />
          <MetricCard
            icon={Sun}
            label="Geometric Albedo (A_g)"
            tooltipId="tooltip-albedo"
            tooltip="Measures atmospheric reflectivity (0.00 = total absorption, 1.00 = total reflection)."
            detail={`SPHEREx Band ${spherexBandId} (${bandWavelengthUm.toFixed(2)} µm) · Pass ${spherexEpoch}`}
            value={formatNumber(derived.geometric_albedo_ag, 3)}
            unit="A_g"
          />
        </section>

        <section className="rounded-2xl border border-violet-500/25 bg-card/60 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium">SPHEREx 102-Band Near-Infrared Spectrophotometry</h3>
              <p className="text-xs text-muted">
                Channels 0.75–5.0 µm · thermal eclipse depth strengthens toward longer wavelengths
              </p>
            </div>
          </div>
          <label className="mb-4 flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Wavelength channel — Band {spherexBandId} ({bandWavelengthUm.toFixed(3)} µm)
            </span>
            <input
              type="range"
              min={SPHEREX_MIN_BAND}
              max={SPHEREX_MAX_BAND}
              step={1}
              value={spherexBandId}
              onChange={(e) => setSpherexBandId(Number(e.target.value))}
              className="accent-violet-400"
            />
            <div className="flex flex-wrap gap-2">
              {SPHEREX_ANCHOR_BANDS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setSpherexBandId(band)}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    spherexBandId === band
                      ? "border-violet-400/60 bg-violet-500/20 text-violet-200"
                      : "border-border text-muted hover:border-violet-400/40"
                  }`}
                >
                  Band {band} · {wavelengthUmForSpherexBand(band).toFixed(2)} µm
                </button>
              ))}
            </div>
          </label>
          <SpherExSpectrumChart data={spherexSpectrum} activeWavelengthUm={bandWavelengthUm} />
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Telescope className="size-5 text-accent" />
              <h3 className="text-lg font-medium">Phase-folded light curve</h3>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Orbit className="size-3.5" />
                P = {formatNumber(planet.orbital_period_days, 4)} d
              </span>
              <span>Host: {star.name}</span>
              <span>T★ = {formatNumber(star.teff_k, 0)} K</span>
              <span>R★ = {formatNumber(star.radius_sun, 3)} R☉</span>
              <span>R_p = {formatNumber(planet.radius_jupiter, 2)} R_J</span>
            </div>
          </div>

          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {BENCHMARK_PRESETS.map((preset) => (
              <button
                key={preset.targetId}
                type="button"
                onClick={() =>
                  void applyBenchmarkPreset(preset.targetId, preset.heatRedistribution, preset.spherexBandId)
                }
                className={`rounded-xl border border-border bg-card/70 px-3 py-3 text-left text-sm ${MOTION_INTERACTIVE} hover:border-accent/50`}
              >
                <span className="font-medium text-foreground">{preset.title}</span>
                <span className="mt-1 block text-xs text-muted">{preset.subtitle}</span>
              </button>
            ))}
          </div>

          <div className="mb-5 grid gap-4 rounded-xl border border-border/70 bg-background/40 p-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Signal noise reduction ({smoothing <= 0 ? "0× raw" : `${smoothing.toFixed(1)}× smooth`})
              </span>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
                className="accent-accent"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Atmospheric heat redistribution f = {heatRedistribution.toFixed(2)} (¼–⅔)
              </span>
              <input
                type="range"
                min={0.25}
                max={0.667}
                step={0.01}
                value={heatRedistribution}
                onChange={(e) => setHeatRedistribution(Number(e.target.value))}
                className="accent-amber-400"
              />
            </label>
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                SPHEREx channel (linked to inspector above)
              </span>
              <input
                type="range"
                min={SPHEREX_MIN_BAND}
                max={SPHEREX_MAX_BAND}
                step={1}
                value={spherexBandId}
                onChange={(e) => setSpherexBandId(Number(e.target.value))}
                className="accent-accent"
              />
              <span className="text-xs text-muted">
                Band {spherexBandId} · λ = {bandWavelengthUm.toFixed(3)} µm
              </span>
            </label>
            <div className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Survey Pass Epoch (6-month cadence)
              </span>
              <div className="inline-flex flex-wrap rounded-lg border border-border bg-card p-1">
                {(
                  [
                    { epoch: 1 as const, label: "Pass 1 · Month 0" },
                    { epoch: 2 as const, label: "Pass 2 · Month 6" },
                    { epoch: 3 as const, label: "Pass 3 · Month 12" },
                  ] as const
                ).map(({ epoch, label }) => (
                  <button
                    key={epoch}
                    type="button"
                    onClick={() => setSpherexEpoch(epoch)}
                    className={`rounded-md px-3 py-1.5 text-xs ${
                      spherexEpoch === epoch ? "bg-accent/20 text-accent" : "text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="mt-1 flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={showPassOverlay}
                  onChange={(e) => setShowPassOverlay(e.target.checked)}
                  className="accent-accent"
                />
                Overlay phase-folded curves for all survey passes
              </label>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setZoomEclipse((z) => !z)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${MOTION_INTERACTIVE} ${
                zoomEclipse ? "border-accent bg-accent/15 text-accent" : "border-border bg-card"
              }`}
            >
              <ZoomIn className="size-4" />
              Zoom secondary eclipse
            </button>
            <button
              type="button"
              onClick={() => void fetchNasaTap()}
              disabled={nasaLoading}
              className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100 ${MOTION_INTERACTIVE}`}
            >
              {nasaLoading ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4 text-accent" />}
              Fetch NASA TAP API
            </button>
            <button
              type="button"
              onClick={exportReport}
              className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-accent/60 ${MOTION_INTERACTIVE}`}
            >
              <Download className="size-4 text-accent" />
              Export Research Report
            </button>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid stroke="#1e2a45" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="phase"
                  type="number"
                  domain={zoomEclipse ? [0.45, 0.55] : [0, 1]}
                  tickCount={zoomEclipse ? 5 : 6}
                  tick={{ fill: "#8b9bb8", fontSize: 12 }}
                  axisLine={{ stroke: "#1e2a45" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[yMin - yPad, yMax + yPad]}
                  tick={{ fill: "#8b9bb8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.toFixed(5)}
                  width={62}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1424",
                    border: "1px solid #1e2a45",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      fittedFlux: `Pass ${spherexEpoch} (active)`,
                      flux: "Observed flux",
                      pass1: "Pass 1 · Month 0",
                      pass2: "Pass 2 · Month 6",
                      pass3: "Pass 3 · Month 12",
                    };
                    return [
                      typeof value === "number" ? value.toFixed(6) : value,
                      labels[String(name)] ?? String(name),
                    ];
                  }}
                />
                {!zoomEclipse ? (
                  <ReferenceLine x={0} stroke="#4f8cff" strokeDasharray="4 4" strokeOpacity={0.6} />
                ) : null}
                <ReferenceLine x={0.5} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
                {smoothing > 0 ? (
                  <Line
                    type="monotone"
                    dataKey="flux"
                    stroke="#64748b"
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    opacity={0.45}
                  />
                ) : null}
                {showPassOverlay && nasaRow ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="pass1"
                      stroke="#94a3b8"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive={false}
                      opacity={spherexEpoch === 1 ? 0.35 : 0.65}
                    />
                    <Line
                      type="monotone"
                      dataKey="pass2"
                      stroke="#a78bfa"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive={false}
                      opacity={spherexEpoch === 2 ? 0.35 : 0.65}
                    />
                    <Line
                      type="monotone"
                      dataKey="pass3"
                      stroke="#f472b6"
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive={false}
                      opacity={spherexEpoch === 3 ? 0.35 : 0.65}
                    />
                  </>
                ) : null}
                <Line
                  type="monotone"
                  dataKey="fittedFlux"
                  stroke="#4f8cff"
                  strokeWidth={smoothing > 0 ? 2.25 : 1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5">
            <PhysicsMethodologyCard />
          </div>
        </section>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  tooltip,
  tooltipId,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  tooltip?: string;
  tooltipId?: string;
  detail?: string;
}) {
  return (
    <article className={`rounded-xl border border-border bg-card/80 p-5 ${MOTION_INTERACTIVE}`}>
      <div className="mb-3 flex items-center gap-2 text-muted">
        <Icon className="size-4 text-accent" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        {tooltip && tooltipId ? <MetricTooltip id={tooltipId} text={tooltip} /> : null}
      </div>
      <p className="font-mono text-2xl font-semibold">
        {value}
        <span className="ml-1.5 text-sm font-normal text-muted">{unit}</span>
      </p>
      {detail ? <p className="mt-2 text-xs text-muted">{detail}</p> : null}
    </article>
  );
}