import type { NasaPlanetRecord } from "@/lib/target-resolver";
import type { TargetSystem } from "@/types/exoplanet";

export function cachedTargetToNasaRecord(target: TargetSystem): NasaPlanetRecord {
  const { stellar_parameters: star, planetary_parameters: planet } = target;
  return {
    pl_name: planet.name,
    hostname: star.name,
    st_teff: star.teff_k,
    st_rad: star.radius_sun,
    st_mass: star.mass_sun,
    st_logg: star.log_g,
    st_met: null,
    pl_radj: planet.radius_jupiter,
    pl_rade: null,
    pl_orbper: planet.orbital_period_days,
    pl_orbsmax: planet.semi_major_axis_au,
    pl_eqt: planet.equilibrium_temp_k,
    pl_trandep: null,
  };
}