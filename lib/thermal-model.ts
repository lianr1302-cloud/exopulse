export function theoreticalDayTemperatureK(tEqK: number, redistributionFactor: number): number {
  const f = Math.max(0.2, Math.min(0.75, redistributionFactor));
  return tEqK * Math.pow(2 / f, 0.25);
}

export interface EclipseConfidence {
  scorePercent: number;
  label: string;
  snrSigma: number;
}

export function computeEclipseConfidence(
  eclipseDepthPpm: number,
  noisePpm: number,
  smoothing: number,
): EclipseConfidence {
  const effectiveNoise = noisePpm / Math.sqrt(1 + smoothing * 1.2);
  const snr = eclipseDepthPpm / Math.max(effectiveNoise, 1);
  const score = Math.round(Math.min(99, Math.max(52, 58 + 12 * Math.log10(Math.max(snr, 0.8)))));

  let label = "Moderate Red Noise";
  if (snr > 8) {
    label = "Low Red Noise";
  } else if (snr > 5) {
    label = "Acceptable Baseline";
  } else if (snr > 3) {
    label = "Elevated Scatter";
  } else {
    label = "Marginal Detection";
  }

  return {
    scorePercent: score,
    label,
    snrSigma: snr,
  };
}