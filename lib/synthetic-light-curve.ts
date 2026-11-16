import {
  scaleEclipseDepthForBand,
  spherexEpochModifiers,
  type SpherExEpoch,
} from "@/lib/spherex-model";

const N_POINTS = 500;
const RJUP_PER_RSUN = 0.10045;

export interface SyntheticPhysicsInput {
  st_teff: number;
  st_rad: number;
  pl_radj: number;
  pl_orbsmax: number;
  pl_eqt: number;
  transit_depth_frac?: number | null;
  t_day_k: number;
  geometric_albedo?: number;
  noise_ppm?: number;
  seed?: number;
  spherex_wavelength_um?: number;
  spherex_epoch?: SpherExEpoch;
}

export interface SyntheticLightCurveResult {
  orbital_phase: number[];
  normalized_flux: number[];
  transit_depth_frac: number;
  secondary_eclipse_depth_ppm: number;
  n_points: number;
}

function wrapPhaseDelta(phases: number[], center: number): number[] {
  return phases.map((phase) => {
    const d = Math.abs(phase - center);
    return Math.min(d, 1 - d);
  });
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function eclipseComponents(
  stTeff: number,
  stRad: number,
  plRadJ: number,
  semiMajorAu: number,
  tDay: number,
  albedo: number,
): { thermal: number; reflected: number; total: number } {
  const rpRs = (plRadJ * RJUP_PER_RSUN) / stRad;
  const aOverRs = semiMajorAu * 215;
  const thermal = rpRs ** 2 * (tDay / stTeff) ** 4;
  const reflected = albedo * rpRs ** 2 * (stRad / aOverRs) ** 2;
  return { thermal, reflected, total: thermal + reflected };
}

export function generateSyntheticLightCurve(
  input: SyntheticPhysicsInput,
): SyntheticLightCurveResult {
  const {
    st_teff,
    st_rad,
    pl_radj,
    pl_orbsmax,
    t_day_k,
    geometric_albedo = 0.08,
    noise_ppm = 120,
    seed = 42,
    spherex_wavelength_um = 3.0,
    spherex_epoch = 1,
  } = input;

  const epochMod = spherexEpochModifiers(spherex_epoch);
  const rpRs = (pl_radj * RJUP_PER_RSUN) / st_rad;
  const transitDepth =
    input.transit_depth_frac ?? Math.min(0.2, Math.max(0.001, rpRs ** 2 * 1.05));
  const components = eclipseComponents(
    st_teff,
    st_rad,
    pl_radj,
    pl_orbsmax,
    t_day_k,
    geometric_albedo,
  );
  let eclipseFrac = scaleEclipseDepthForBand(
    components.thermal,
    components.reflected,
    spherex_wavelength_um,
  );
  eclipseFrac *= epochMod.eclipseDepthScale;

  const phases = Array.from({ length: N_POINTS }, (_, i) => i / N_POINTS);
  const transitWidth = 0.025;
  const eclipseWidth = 0.018;
  const rng = mulberry32(seed);
  const sigma = noise_ppm * epochMod.noiseScale * 1e-6;

  const flux = phases.map((phase) => {
    let value = 1;

    for (const center of [0, 1]) {
      const delta = Math.min(Math.abs(phase - center), 1 - Math.abs(phase - center));
      if (delta < 4 * transitWidth) {
        const bump = Math.exp(-0.5 * (delta / transitWidth) ** 2);
        value *= 1 - transitDepth * bump;
      }
    }

    const eclipseDelta = wrapPhaseDelta([phase], 0.5)[0];
    if (eclipseDelta < 4 * eclipseWidth) {
      const bump = Math.exp(-0.5 * (eclipseDelta / eclipseWidth) ** 2);
      value *= 1 - eclipseFrac * bump;
    }

    return value + epochMod.fluxOffset + (rng() - 0.5) * 2 * sigma;
  });

  return {
    orbital_phase: phases,
    normalized_flux: flux,
    transit_depth_frac: transitDepth,
    secondary_eclipse_depth_ppm: eclipseFrac * 1e6,
    n_points: N_POINTS,
  };
}

export function targetIdFromPlName(plName: string): string {
  return plName.toLowerCase().replace(/\s+/g, "");
}