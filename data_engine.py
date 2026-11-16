"""
ExoPulse AI — backend data engine for hot-Jupiter phase-folded light curves.
Generates synthetic observables and derived physical parameters for eight hot-Jupiter targets.
"""

from __future__ import annotations

import json
import random
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np


OUTPUT_PATH = Path(__file__).resolve().parent / "exoplanet_data.json"
N_PHASE_POINTS = 500
random.seed(42)


@dataclass(frozen=True)
class StellarParams:
    name: str
    teff_k: float
    radius_sun: float
    mass_sun: float
    log_g: float


@dataclass(frozen=True)
class PlanetaryParams:
    name: str
    radius_jupiter: float
    mass_jupiter: float
    orbital_period_days: float
    semi_major_axis_au: float
    inclination_deg: float
    equilibrium_temp_k: float


@dataclass(frozen=True)
class SystemTruth:
    """Intrinsic atmospheric / thermal properties used to build the light curve."""
    transit_depth_frac: float
    secondary_eclipse_depth_ppm: float
    day_side_temp_k: float
    geometric_albedo: float


# Literature-informed parameters (approximate; suitable for visualization / teaching).
SYSTEMS: dict[str, dict] = {
    "WASP-12b": {
        "star": StellarParams(
            name="WASP-12",
            teff_k=6300.0,
            radius_sun=1.59,
            mass_sun=1.35,
            log_g=4.27,
        ),
        "planet": PlanetaryParams(
            name="WASP-12b",
            radius_jupiter=1.83,
            mass_jupiter=1.47,
            orbital_period_days=1.091423,
            semi_major_axis_au=0.0229,
            inclination_deg=82.5,
            equilibrium_temp_k=2580.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0172,
            secondary_eclipse_depth_ppm=485.0,
            day_side_temp_k=2640.0,
            geometric_albedo=0.06,
        ),
    },
    "WASP-18b": {
        "star": StellarParams(
            name="WASP-18",
            teff_k=6400.0,
            radius_sun=1.24,
            mass_sun=1.24,
            log_g=4.33,
        ),
        "planet": PlanetaryParams(
            name="WASP-18b",
            radius_jupiter=1.17,
            mass_jupiter=10.3,
            orbital_period_days=0.941451,
            semi_major_axis_au=0.0203,
            inclination_deg=87.6,
            equilibrium_temp_k=2700.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0110,
            secondary_eclipse_depth_ppm=412.0,
            day_side_temp_k=2780.0,
            geometric_albedo=0.08,
        ),
    },
    "Kepler-13b": {
        "star": StellarParams(
            name="Kepler-13A",
            teff_k=7720.0,
            radius_sun=1.89,
            mass_sun=1.66,
            log_g=4.15,
        ),
        "planet": PlanetaryParams(
            name="Kepler-13Ab",
            radius_jupiter=1.41,
            mass_jupiter=8.0,
            orbital_period_days=1.7633,
            semi_major_axis_au=0.0343,
            inclination_deg=85.0,
            equilibrium_temp_k=2450.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0088,
            secondary_eclipse_depth_ppm=335.0,
            day_side_temp_k=2520.0,
            geometric_albedo=0.12,
        ),
    },
    "WASP-19b": {
        "star": StellarParams(
            name="WASP-19",
            teff_k=5500.0,
            radius_sun=0.933,
            mass_sun=0.909,
            log_g=4.47,
        ),
        "planet": PlanetaryParams(
            name="WASP-19b",
            radius_jupiter=1.31,
            mass_jupiter=1.166,
            orbital_period_days=0.7888209,
            semi_major_axis_au=0.01655,
            inclination_deg=88.0,
            equilibrium_temp_k=1980.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0196,
            secondary_eclipse_depth_ppm=318.0,
            day_side_temp_k=2050.0,
            geometric_albedo=0.10,
        ),
    },
    "WASP-121b": {
        "star": StellarParams(
            name="WASP-121",
            teff_k=6460.0,
            radius_sun=1.35,
            mass_sun=1.353,
            log_g=4.22,
        ),
        "planet": PlanetaryParams(
            name="WASP-121b",
            radius_jupiter=1.875,
            mass_jupiter=1.183,
            orbital_period_days=1.275376,
            semi_major_axis_au=0.0254,
            inclination_deg=87.6,
            equilibrium_temp_k=2350.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0193,
            secondary_eclipse_depth_ppm=528.0,
            day_side_temp_k=2480.0,
            geometric_albedo=0.05,
        ),
    },
    "KELT-9b": {
        "star": StellarParams(
            name="KELT-9",
            teff_k=10170.0,
            radius_sun=2.362,
            mass_sun=1.978,
            log_g=3.93,
        ),
        "planet": PlanetaryParams(
            name="KELT-9b",
            radius_jupiter=1.836,
            mass_jupiter=2.44,
            orbital_period_days=1.4811235,
            semi_major_axis_au=0.0369,
            inclination_deg=86.2,
            equilibrium_temp_k=4050.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0061,
            secondary_eclipse_depth_ppm=412.0,
            day_side_temp_k=4050.0,
            geometric_albedo=0.0,
        ),
    },
    "KELT-20b": {
        "star": StellarParams(
            name="KELT-20A",
            teff_k=6220.0,
            radius_sun=1.476,
            mass_sun=1.211,
            log_g=4.31,
        ),
        "planet": PlanetaryParams(
            name="KELT-20Ab",
            radius_jupiter=1.23,
            mass_jupiter=0.698,
            orbital_period_days=3.47422,
            semi_major_axis_au=0.0412,
            inclination_deg=88.7,
            equilibrium_temp_k=2120.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0070,
            secondary_eclipse_depth_ppm=285.0,
            day_side_temp_k=2180.0,
            geometric_albedo=0.11,
        ),
    },
    "HAT-P-7b": {
        "star": StellarParams(
            name="HAT-P-7",
            teff_k=6350.0,
            radius_sun=1.36,
            mass_sun=1.28,
            log_g=4.14,
        ),
        "planet": PlanetaryParams(
            name="HAT-P-7b",
            radius_jupiter=1.363,
            mass_jupiter=1.775,
            orbital_period_days=3.035338,
            semi_major_axis_au=0.0379,
            inclination_deg=86.2,
            equilibrium_temp_k=2620.0,
        ),
        "truth": SystemTruth(
            transit_depth_frac=0.0101,
            secondary_eclipse_depth_ppm=364.0,
            day_side_temp_k=2680.0,
            geometric_albedo=0.04,
        ),
    },
}

RJUP_M_PER_SUN_R = 0.10045  # Jupiter radius in solar radii (approx.)
RSUN_M = 6.957e8


def _wrap_phase_delta(phases: np.ndarray, center: float) -> np.ndarray:
    """Shortest angular distance on the unit circle (phase)."""
    d = np.abs(phases - center)
    return np.minimum(d, 1.0 - d)


def generate_phase_folded_light_curve(
    transit_depth: float,
    eclipse_depth_frac: float,
    noise_ppm: float,
    n_points: int = N_PHASE_POINTS,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Phase-folded normalized flux from 0.0 to 1.0.
    Primary transit centered at 0.0; secondary eclipse at 0.5.
    """
    phase = np.linspace(0.0, 1.0, n_points, endpoint=False)

    transit_width = 0.025
    eclipse_width = 0.018

    flux = np.ones_like(phase)

    for center in (0.0, 1.0):
        delta = _wrap_phase_delta(phase, center)
        mask = delta < 4 * transit_width
        bump = np.exp(-0.5 * (delta[mask] / transit_width) ** 2)
        bump /= bump.max()
        flux[mask] *= 1.0 - transit_depth * bump

    eclipse_delta = _wrap_phase_delta(phase, 0.5)
    e_mask = eclipse_delta < 4 * eclipse_width
    e_bump = np.exp(-0.5 * (eclipse_delta[e_mask] / eclipse_width) ** 2)
    e_bump /= e_bump.max()
    flux[e_mask] *= 1.0 - eclipse_depth_frac * e_bump

    sigma = noise_ppm * 1e-6
    noise = np.array([random.gauss(0.0, sigma) for _ in range(n_points)])
    flux_noisy = flux + noise
    return phase, flux_noisy


def measure_secondary_eclipse_depth_ppm(phase: np.ndarray, flux: np.ndarray) -> float:
    """Estimate eclipse depth from flux minimum near phase 0.5 (out-of-eclipse baseline)."""
    quiet = ((phase > 0.09) & (phase < 0.41)) | ((phase > 0.59) & (phase < 0.91))
    baseline = float(np.median(flux[quiet])) if np.any(quiet) else float(np.median(flux))
    window = (phase > 0.47) & (phase < 0.53)
    if not np.any(window):
        return 0.0
    min_flux = float(np.min(flux[window]))
    depth_frac = max(0.0, (baseline - min_flux) / baseline)
    return depth_frac * 1e6


def eclipse_depth_fraction_from_physics(
    star: StellarParams,
    planet: PlanetaryParams,
    t_day_k: float,
    geometric_albedo: float,
) -> float:
    """Total secondary eclipse depth (fractional flux) from thermal + reflected components."""
    rp_rs = (planet.radius_jupiter * RJUP_M_PER_SUN_R) / star.radius_sun
    a_over_rs = planet.semi_major_axis_au * 215.0  # AU -> stellar radii (approx.)
    thermal = (rp_rs**2) * (t_day_k / star.teff_k) ** 4
    reflected = geometric_albedo * (rp_rs**2) * (star.radius_sun / a_over_rs) ** 2
    return thermal + reflected


def compute_derived_physical_parameters(
    star: StellarParams,
    planet: PlanetaryParams,
    secondary_eclipse_depth_ppm: float,
) -> dict[str, float]:
    """
    Derive day-side temperature and geometric albedo from measured eclipse depth.

    Model at secondary eclipse (fractional flux obscured):
      δ ≈ (Rp/Rs)² (T_day/T★)⁴ + A_g (Rp/Rs)² (R★/a)²
    Thermal term is inverted for T_day; reflected remainder yields A_g.
    """
    rp_rs = (planet.radius_jupiter * RJUP_M_PER_SUN_R) / star.radius_sun
    a_over_rs = planet.semi_major_axis_au * 215.0
    scatter_factor = (rp_rs**2) * (star.radius_sun / a_over_rs) ** 2

    delta = secondary_eclipse_depth_ppm * 1e-6
    t_day = star.teff_k * (delta / max(rp_rs**2, 1e-12)) ** 0.25
    a_g = 0.0
    for _ in range(12):
        thermal_frac = (rp_rs**2) * (t_day / star.teff_k) ** 4
        a_g = max(delta - thermal_frac, 0.0) / max(scatter_factor, 1e-12)
        thermal_target = max(delta - a_g * scatter_factor, 1e-12)
        t_day = star.teff_k * (thermal_target / max(rp_rs**2, 1e-12)) ** 0.25

    return {
        "secondary_eclipse_depth_ppm": float(secondary_eclipse_depth_ppm),
        "day_side_thermal_temperature_k": float(t_day),
        "geometric_albedo_ag": float(np.clip(a_g, 0.0, 1.0)),
    }


def build_target_dataset(target_key: str) -> dict:
    entry = SYSTEMS[target_key]
    star: StellarParams = entry["star"]
    planet: PlanetaryParams = entry["planet"]
    truth: SystemTruth = entry["truth"]

    eclipse_frac = eclipse_depth_fraction_from_physics(
        star, planet, truth.day_side_temp_k, truth.geometric_albedo
    )
    phase, flux = generate_phase_folded_light_curve(
        transit_depth=truth.transit_depth_frac,
        eclipse_depth_frac=eclipse_frac,
        noise_ppm=120.0,
    )

    measured_ppm = measure_secondary_eclipse_depth_ppm(phase, flux)
    derived = compute_derived_physical_parameters(star, planet, measured_ppm)

    return {
        "target_id": target_key,
        "stellar_parameters": asdict(star),
        "planetary_parameters": asdict(planet),
        "light_curve": {
            "orbital_phase": phase.tolist(),
            "normalized_flux": flux.tolist(),
            "n_points": len(phase),
            "phase_range": [0.0, 1.0],
            "noise_model": "Gaussian",
            "noise_rms_ppm": 120.0,
        },
        "derived_physical_parameters": derived,
        "metadata": {
            "reference_frame": "phase_folded",
            "primary_transit_phase": 0.0,
            "secondary_eclipse_phase": 0.5,
            "flux_units": "relative_to_out_of_transit",
        },
    }


def export_exoplanet_data(path: Path = OUTPUT_PATH) -> Path:
    payload = {
        "application": "ExoPulse AI",
        "schema_version": "1.0.0",
        "description": "Synthetic phase-folded light curves and derived parameters for eight hot Jupiters.",
        "targets": [build_target_dataset(name) for name in SYSTEMS],
    }

    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)

    return path


def main() -> None:
    out = export_exoplanet_data()
    print(f"ExoPulse AI data engine: successfully wrote structured dataset to {out}")


if __name__ == "__main__":
    main()