/** Map local target_id keys to NASA Exoplanet Archive `pl_name` values. */
export const NASA_PLANET_NAMES: Record<string, string> = {
  "WASP-12b": "WASP-12 b",
  "WASP-18b": "WASP-18 b",
  "Kepler-13b": "Kepler-13 A b",
  "WASP-19b": "WASP-19 b",
  "WASP-121b": "WASP-121 b",
  "KELT-9b": "KELT-9 b",
  "KELT-20b": "KELT-20 A b",
  "HAT-P-7b": "HAT-P-7 b",
};

export interface NasaStellarRow {
  pl_name: string;
  hostname: string;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_logg: number | null;
  st_met: number | null;
}

export interface NasaTapPayload {
  source: string;
  planetQuery: string;
  row: NasaStellarRow | null;
  fetchedAt: string;
  error?: string;
}