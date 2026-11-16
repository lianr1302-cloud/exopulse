import { computeSpherExCandidateScore } from "@/lib/spherex-model";

export interface LeapsScorecard {
  candidateConfidencePercent: number;
  rocAuc: number;
  snrSigma: number;
  redNoiseFiltered: boolean;
}

export function computeLeapsScorecard(
  eclipseDepthPpm: number,
  noisePpm: number,
  smoothing: number,
  bandId: number,
): LeapsScorecard {
  const base = computeSpherExCandidateScore(eclipseDepthPpm, noisePpm, smoothing, bandId);
  const rocAuc = Math.min(0.99, 0.82 + 0.02 * Math.min(base.snrSigma, 8));
  const candidateConfidencePercent = Math.min(
    99.5,
    Math.max(55, base.scorePercent * 0.98 + 2.2 * Math.log10(Math.max(base.snrSigma, 1))),
  );

  return {
    candidateConfidencePercent: Math.round(candidateConfidencePercent * 10) / 10,
    rocAuc: Math.round(rocAuc * 1000) / 1000,
    snrSigma: base.snrSigma,
    redNoiseFiltered: smoothing > 0.05,
  };
}