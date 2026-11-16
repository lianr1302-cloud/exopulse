"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SpherExSpectrumPoint } from "@/lib/spherex-spectrum";

interface SpherExSpectrumChartProps {
  data: SpherExSpectrumPoint[];
  activeWavelengthUm?: number;
}

export function SpherExSpectrumChart({ data, activeWavelengthUm }: SpherExSpectrumChartProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/40 p-4">
      <h4 className="text-sm font-medium text-foreground">SPHEREx multi-band eclipse spectrum</h4>
      <p className="mt-1 text-xs text-muted">
        Secondary eclipse depth (ppm) vs. wavelength — 102 NIR channels (0.75–5.0 µm)
      </p>
      <div className="mt-3 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#1e2a45" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="wavelength_um"
              type="number"
              domain={[0.75, 5]}
              tick={{ fill: "#8b9bb8", fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(1)}µm`}
            />
            <YAxis
              tick={{ fill: "#8b9bb8", fontSize: 11 }}
              width={48}
              tickFormatter={(v) => `${Math.round(v)}`}
              label={{ value: "ppm", angle: -90, position: "insideLeft", fill: "#8b9bb8", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? value.toFixed(2) : value,
                name === "planck_fit_ppm" ? "Planck fit" : "Observed depth",
              ]}
              labelFormatter={(w) => `λ = ${Number(w).toFixed(3)} µm`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="depth_ppm"
              name="Eclipse depth"
              stroke="#3B82F6"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="planck_fit_ppm"
              name="Planck thermal fit"
              stroke="#06B6D4"
              strokeWidth={1.75}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {activeWavelengthUm ? (
        <p className="mt-2 text-xs text-muted">
          Selected band λ = {activeWavelengthUm.toFixed(2)} µm highlighted on primary light curve.
        </p>
      ) : null}
    </div>
  );
}