"use client";

import { ChevronDown } from "lucide-react";

function FormulaBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{title}</p>
      <div className="mt-2 font-mono text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function PhysicsMethodologyCard() {
  return (
    <details className="group rounded-xl border border-border bg-card/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground marker:content-none sm:px-5">
        Physics &amp; Mathematical Methodology
        <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-3 border-t border-border/70 px-4 py-4 sm:px-5">
        <FormulaBlock title="Secondary Eclipse Depth">
          <p>
            δ<sub>eclipse</sub> = (R<sub>p</sub> / R<sub>★</sub>)<sup>2</sup> · (B<sub>λ</sub>(T<sub>day</sub>) /
            B<sub>λ</sub>(T<sub>★</sub>))
          </p>
          <p className="mt-1 text-xs text-muted">Planck-weighted thermal contrast at band λ (SPHEREx NIR).</p>
        </FormulaBlock>
        <FormulaBlock title="Geometric Albedo">
          <p>
            A<sub>g</sub> = δ<sub>reflected</sub> · (a / R<sub>p</sub>)<sup>2</sup>
          </p>
        </FormulaBlock>
        <FormulaBlock title="Day-side Thermal Equilibrium">
          <p>
            T<sub>day</sub> = T<sub>★</sub> · (R<sub>★</sub> / a)<sup>0.5</sup> · [f · (1 − A<sub>g</sub>)]<sup>0.25</sup>
          </p>
          <p className="mt-1 text-xs text-muted">f is the atmospheric heat redistribution factor (¼–⅔).</p>
        </FormulaBlock>
      </div>
    </details>
  );
}