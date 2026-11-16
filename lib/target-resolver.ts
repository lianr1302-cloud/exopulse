import {
  generateSyntheticLightCurve,
  targetIdFromPlName,
  type SyntheticLightCurveResult,
} from "@/lib/synthetic-light-curve";
import { getSpherExBand, type SpherExEpoch } from "@/lib/spherex-model";
import { theoreticalDayTemperatureK } from "@/lib/thermal-model";
import type { DerivedPhysicalParameters, PlanetaryParameters, StellarParameters, TargetSystem } from "@/types/exoplanet";

export interface NasaPlanetRecord {
  pl_name: string;
  hostname: string;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_logg: number | null;
  st_met: number | null;
  pl_radj: number | null;
  pl_rade: number | null;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_eqt: number | null;
  pl_trandep: number | null;
}

const RJUP_FROM_REARTH = 1 / 11.209;

export function planetRadiusJupiter(row: NasaPlanetRecord): number {
  if (row.pl_radj && row.pl_radj > 0) {
    return row.pl_radj;
  }
  if (row.pl_rade && row.pl_rade > 0) {
    return row.pl_rade * RJUP_FROM_REARTH;
  }
  return 1.05;
}

export function buildTargetFromNasa(
  row: NasaPlanetRecord,
  redistributionFactor: number,
  source: "cache" | "synthetic",
  spherexBandId = 50,
  spherexEpoch: SpherExEpoch = 1,
): TargetSystem {
  const band = getSpherExBand(spherexBandId);
  const stTeff = row.st_teff ?? 5700;
  const stRad = row.st_rad ?? 1;
  const plRad = planetRadiusJupiter(row);
  const orbPer = row.pl_orbper ?? 3;
  const sma = row.pl_orbsmax ?? 0.05;
  const tEq = row.pl_eqt ?? 1200;
  const tDay = theoreticalDayTemperatureK(tEq, redistributionFactor);
  const transitFromArchive =
    row.pl_trandep !== null && row.pl_trandep !== undefined
      ? Math.abs(row.pl_trandep) / 100
      : null;

  const synthetic: SyntheticLightCurveResult = generateSyntheticLightCurve({
    st_teff: stTeff,
    st_rad: stRad,
    pl_radj: plRad,
    pl_orbsmax: sma,
    pl_eqt: tEq,
    transit_depth_frac: transitFromArchive,
    t_day_k: tDay,
    seed: targetIdFromPlName(row.pl_name).length * 97,
    spherex_wavelength_um: band.wavelength_um,
    spherex_epoch: spherexEpoch,
  });

  const stellar: StellarParameters = {
    name: row.hostname || row.pl_name.split(" ")[0],
    teff_k: stTeff,
    radius_sun: stRad,
    mass_sun: row.st_mass ?? 1,
    log_g: row.st_logg ?? 4.3,
  };

  const planetary: PlanetaryParameters = {
    name: row.pl_name,
    radius_jupiter: plRad,
    mass_jupiter: 1,
    orbital_period_days: orbPer,
    semi_major_axis_au: sma,
    inclination_deg: 89,
    equilibrium_temp_k: tEq,
  };

  const derived: DerivedPhysicalParameters = {
    secondary_eclipse_depth_ppm: synthetic.secondary_eclipse_depth_ppm,
    day_side_thermal_temperature_k: tDay,
    geometric_albedo_ag: 0.08,
  };

  return {
    target_id: targetIdFromPlName(row.pl_name),
    stellar_parameters: stellar,
    planetary_parameters: planetary,
    light_curve: {
      orbital_phase: synthetic.orbital_phase,
      normalized_flux: synthetic.normalized_flux,
      n_points: synthetic.n_points,
      phase_range: [0, 1],
      noise_model: "Gaussian",
      noise_rms_ppm: 120,
    },
    derived_physical_parameters: derived,
    metadata: {
      reference_frame: "phase_folded",
      primary_transit_phase: 0,
      secondary_eclipse_phase: 0.5,
      flux_units: "relative_to_out_of_transit",
      data_provenance: source === "cache" ? "cache" : "nasa_tap",
      spherex_band: band.id,
      spherex_wavelength_um: band.wavelength_um,
      spherex_epoch: spherexEpoch,
    },
  };
}