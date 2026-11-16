import type { SpherExSpectrumPoint } from "@/lib/spherex-spectrum";
import type { TargetSystem } from "@/types/exoplanet";

export interface ResearchReportPayload {
  generatedAt: string;
  platform: "ExoPulse";
  challenge: "2026 NASA Space Apps — Planet X & SPHEREx";
  target_id: string;
  stellar_parameters: TargetSystem["stellar_parameters"];
  planetary_parameters: TargetSystem["planetary_parameters"];
  derived: TargetSystem["derived_physical_parameters"];
  light_curve: TargetSystem["light_curve"];
  spherex_channel_flux: SpherExSpectrumPoint[];
  analysis: {
    heat_redistribution_factor: number;
    leaps_candidate_confidence_percent: number;
    leaps_roc_auc: number;
    ai_snr_sigma: number;
    red_noise_filtered: boolean;
    spherex_band: number;
    spherex_wavelength_um: number;
    spherex_epoch: 1 | 2 | 3;
    smoothing_factor: number;
  };
  target: TargetSystem;
}

export function downloadResearchReportJson(payload: ResearchReportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  triggerDownload(blob, `exopulse-${payload.target_id}-data.json`);
}

export function downloadLightCurveCsv(target: TargetSystem) {
  const header = "orbital_phase,normalized_flux\n";
  const rows = target.light_curve.orbital_phase
    .map((phase, i) => `${phase},${target.light_curve.normalized_flux[i]}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `exopulse-${target.target_id}-data.csv`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}