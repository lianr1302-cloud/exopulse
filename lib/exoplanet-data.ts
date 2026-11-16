import type { ExoplanetDataset } from "@/types/exoplanet";

import rawDataset from "../exoplanet_data.json";

export function getExoplanetDataset(): ExoplanetDataset {
  return rawDataset as ExoplanetDataset;
}

export function getTargetOptions(dataset: ExoplanetDataset): string[] {
  return dataset.targets.map((t) => t.target_id);
}