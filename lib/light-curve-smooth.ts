/**
 * Moving-average smooth for normalized flux vs phase (0 = no smoothing).
 */
export function smoothFluxSeries(
  flux: number[],
  smoothingFactor: number,
): number[] {
  if (smoothingFactor <= 0 || flux.length === 0) {
    return [...flux];
  }

  const windowSize = Math.max(1, Math.min(flux.length, Math.round(1 + smoothingFactor * 4)));
  if (windowSize <= 1) {
    return [...flux];
  }

  const half = Math.floor(windowSize / 2);
  return flux.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(flux.length, i + half + 1);
    const slice = flux.slice(start, end);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
}

export function buildSmoothedLightCurve(
  phase: number[],
  flux: number[],
  smoothingFactor: number,
): { phase: number; flux: number; fittedFlux: number }[] {
  const fitted = smoothFluxSeries(flux, smoothingFactor);
  return phase.map((p, i) => ({
    phase: p,
    flux: flux[i],
    fittedFlux: fitted[i],
  }));
}