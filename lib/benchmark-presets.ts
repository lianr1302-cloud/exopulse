export interface BenchmarkPreset {
  targetId: string;
  title: string;
  subtitle: string;
  heatRedistribution: number;
  spherexBandId: number;
}

export const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    targetId: "WASP-121b",
    title: "WASP-121b",
    subtitle: "Thermal Inversion & Strong Emission",
    heatRedistribution: 0.42,
    spherexBandId: 50,
  },
  {
    targetId: "KELT-9b",
    title: "KELT-9b",
    subtitle: "Ultra-Hot Jupiter — 4,050 K T_day",
    heatRedistribution: 0.28,
    spherexBandId: 102,
  },
  {
    targetId: "Kepler-13b",
    title: "Kepler-13b",
    subtitle: "High Optical Albedo",
    heatRedistribution: 0.58,
    spherexBandId: 1,
  },
];