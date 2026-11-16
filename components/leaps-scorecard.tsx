import { BadgeCheck } from "lucide-react";

import type { LeapsScorecard } from "@/lib/leaps-score";

interface LeapsScorecardPanelProps {
  scorecard: LeapsScorecard;
  planetName: string;
  loading?: boolean;
}

export function LeapsScorecardPanel({ scorecard, planetName, loading }: LeapsScorecardPanelProps) {
  return (
    <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/90 px-4 py-4 text-sm shadow-lg shadow-violet-500/5">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
        <BadgeCheck className="size-4" aria-hidden />
        ML Signal Diagnostic Scorecard (LEAPS Model)
      </p>
      <ul className="space-y-2 text-slate-200">
        <li>
          <span className="text-muted">Candidate Confidence Rating:</span>{" "}
          <span className="font-mono font-medium text-cyan-300">
            {scorecard.candidateConfidencePercent.toFixed(1)}%
          </span>{" "}
          <span className="text-slate-400">
            (ROC-AUC = {scorecard.rocAuc.toFixed(3)}, Leave-One-Planet-Out CV)
          </span>
        </li>
        <li>
          <span className="text-muted">Signal-to-Noise Significance:</span>{" "}
          <span className="font-mono font-medium text-cyan-300">S/N = {scorecard.snrSigma.toFixed(1)}σ</span>
        </li>
        <li>
          <span className="text-muted">Red-Noise Diagnostic:</span>{" "}
          <span className="text-slate-100">
            {scorecard.redNoiseFiltered
              ? "Instrumental Systematics Filtered (Random Forest Residual Classifier)"
              : "Raw photometry — enable smoothing for RF residual filtering"}
          </span>
        </li>
      </ul>
      {loading ? (
        <p className="mt-2 text-xs text-muted">Resolving target via TAP…</p>
      ) : (
        <p className="mt-2 text-xs text-muted">Target: {planetName}</p>
      )}
    </div>
  );
}