export interface StellarParameters {
  name: string;
  teff_k: number;
  radius_sun: number;
  mass_sun: number;
  log_g: number;
}

export interface PlanetaryParameters {
  name: string;
  radius_jupiter: number;
  mass_jupiter: number;
  orbital_period_days: number;
  semi_major_axis_au: number;
  inclination_deg: number;
  equilibrium_temp_k: number;
}

export interface LightCurve {
  orbital_phase: number[];
  normalized_flux: number[];
  n_points: number;
  phase_range: [number, number];
  noise_model: string;
  noise_rms_ppm: number;
}

export interface DerivedPhysicalParameters {
  secondary_eclipse_depth_ppm: number;
  day_side_thermal_temperature_k: number;
  geometric_albedo_ag: number;
}

export interface TargetSystem {
  target_id: string;
  stellar_parameters: StellarParameters;
  planetary_parameters: PlanetaryParameters;
  light_curve: LightCurve;
  derived_physical_parameters: DerivedPhysicalParameters;
  metadata: {
    reference_frame: string;
    primary_transit_phase: number;
    secondary_eclipse_phase: number;
    flux_units: string;
    data_provenance?: "cache" | "synthetic" | "nasa_tap";
    spherex_band?: number;
    spherex_wavelength_um?: number;
    spherex_epoch?: 1 | 2 | 3;
  };
}

export interface ExoplanetDataset {
  application: string;
  schema_version: string;
  description: string;
  targets: TargetSystem[];
}