import {
  getSpherExBandFromChannel,
  type SpherExBand,
  wavelengthUmForSpherexBand,
} from "@/lib/spherex-channels";

export type { SpherExBand };

export const SPHEREX_BANDS: SpherExBand[] = [
  { id: 1, label: "Band 1", wavelength_um: 0.75 },
  { id: 25, label: "Band 25", wavelength_um: 1.8 },
  { id: 50, label: "Band 50", wavelength_um: 3.0 },
  { id: 102, label: "Band 102", wavelength_um: 5.0 },
];

export type SpherExEpoch = 1 | 2 | 3;

export interface SpherExViewConfig {
  bandId: number;
  epoch: SpherExEpoch;
}

export function getSpherExBand(bandId: number): SpherExBand {
  const anchor = SPHEREX_BANDS.find((b) => b.id === bandId);
  if (anchor) {
    return anchor;
  }
  return getSpherExBandFromChannel(bandId);
}

export function spherexBandWavelengthUm(bandId: number): number {
  const anchor = SPHEREX_BANDS.find((b) => b.id === bandId);
  return anchor?.wavelength_um ?? wavelengthUmForSpherexBand(bandId);
}

/** Relative thermal eclipse emission vs Band 50 reference (3.0 µm). */
export function spherexThermalBandScale(wavelength_um: number): number {
  const reference = 3.0;
  return Math.pow(wavelength_um / reference, 1.35);
}

/** Reflected-light contribution falls off toward longer NIR wavelengths. */
export function spherexReflectedBandScale(wavelength_um: number): number {
  return Math.pow(0.75 / wavelength_um, 0.45);
}

export function scaleEclipseDepthForBand(
  thermalDepth: number,
  reflectedDepth: number,
  wavelength_um: number,
): number {
  return (
    thermalDepth * spherexThermalBandScale(wavelength_um) +
    reflectedDepth * spherexReflectedBandScale(wavelength_um)
  );
}

export function spherexEpochModifiers(epoch: SpherExEpoch): {
  fluxOffset: number;
  eclipseDepthScale: number;
  noiseScale: number;
} {
  if (epoch === 2) {
    return {
      fluxOffset: 8e-6,
      eclipseDepthScale: 1.018,
      noiseScale: 1.08,
    };
  }
  if (epoch === 3) {
    return {
      fluxOffset: 1.4e-5,
      eclipseDepthScale: 1.032,
      noiseScale: 1.12,
    };
  }
  return { fluxOffset: 0, eclipseDepthScale: 1, noiseScale: 1 };
}

export interface SpherExCandidateScore {
  scorePercent: number;
  snrSigma: number;
}

export function computeSpherExCandidateScore(
  eclipseDepthPpm: number,
  noisePpm: number,
  smoothing: number,
  bandId: number,
): SpherExCandidateScore {
  const wavelength = spherexBandWavelengthUm(bandId);
  const bandSnrBoost = 0.92 + 0.12 * spherexThermalBandScale(wavelength);
  const effectiveNoise = noisePpm / Math.sqrt(1 + smoothing * 1.2);
  const snr = (eclipseDepthPpm / Math.max(effectiveNoise, 1)) * bandSnrBoost;
  const score = Math.round(Math.min(99, Math.max(55, 60 + 11 * Math.log10(Math.max(snr, 0.85)))));
  return { scorePercent: score, snrSigma: snr };
}