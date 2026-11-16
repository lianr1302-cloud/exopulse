import {
  scaleEclipseDepthForBand,
  spherexEpochModifiers,
  spherexThermalBandScale,
  type SpherExEpoch,
} from "@/lib/spherex-model";
import { eclipseComponents } from "@/lib/synthetic-light-curve";

export const SPHEREX_CHANNEL_COUNT = 102;

export interface SpherExSpectrumPoint {
  channel: number;
  wavelength_um: number;
  depth_ppm: number;
  planck_fit_ppm: number;
}

export function spherexWavelengthGrid(channels = SPHEREX_CHANNEL_COUNT): number[] {
  return Array.from({ length: channels }, (_, i) => {
    const t = channels === 1 ? 0 : i / (channels - 1);
    return 0.75 + t * (5.0 - 0.75);
  });
}

export function buildSpherexSpectrumCurve(input: {
  st_teff: number;
  st_rad: number;
  pl_radj: number;
  semi_major_au: number;
  t_day_k: number;
  geometric_albedo: number;
  epoch: SpherExEpoch;
}): SpherExSpectrumPoint[] {
  const wavelengths = spherexWavelengthGrid();
  const components = eclipseComponents(
    input.st_teff,
    input.st_rad,
    input.pl_radj,
    input.semi_major_au,
    input.t_day_k,
    input.geometric_albedo,
  );
  const epochMod = spherexEpochModifiers(input.epoch);

  return wavelengths.map((wavelength_um, index) => {
    const depth =
      scaleEclipseDepthForBand(components.thermal, components.reflected, wavelength_um) *
      epochMod.eclipseDepthScale;
    const thermalOnly =
      components.thermal * spherexThermalBandScale(wavelength_um) * epochMod.eclipseDepthScale;
    return {
      channel: index + 1,
      wavelength_um,
      depth_ppm: depth * 1e6,
      planck_fit_ppm: thermalOnly * 1e6,
    };
  });
}