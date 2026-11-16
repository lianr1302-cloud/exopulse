import { NextRequest, NextResponse } from "next/server";

import { NASA_PLANET_NAMES, type NasaStellarRow } from "@/lib/nasa-archive";

const TAP_BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

function parseJsonField(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: NextRequest) {
  const targetId = request.nextUrl.searchParams.get("targetId")?.trim();
  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId query parameter." }, { status: 400 });
  }

  const planetName = NASA_PLANET_NAMES[targetId] ?? targetId.replace(/b$/, " b");
  const sql = [
    "select pl_name,hostname,st_teff,st_rad,st_mass,st_logg,st_met",
    "from ps",
    `where default_flag=1 and pl_name='${planetName.replace(/'/g, "''")}'`,
  ].join(" ");

  const url = `${TAP_BASE}?query=${encodeURIComponent(sql)}&format=json`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          source: "NASA Exoplanet Archive TAP",
          planetQuery: planetName,
          row: null,
          fetchedAt: new Date().toISOString(),
          error: `Archive returned HTTP ${response.status}`,
        },
        { status: 502 },
      );
    }

    const body = await response.json();
    const record = Array.isArray(body) ? body[0] : body?.data?.[0] ?? body?.rows?.[0];

    if (!record) {
      const fallbackSql = [
        "select pl_name,hostname,st_teff,st_rad,st_mass,st_logg,st_met",
        "from ps",
        `where default_flag=1 and pl_name like '${planetName.split(" ")[0].replace(/'/g, "''")}%'`,
      ].join(" ");
      const fallbackUrl = `${TAP_BASE}?query=${encodeURIComponent(fallbackSql)}&format=json`;
      const fallbackRes = await fetch(fallbackUrl, { headers: { Accept: "application/json" } });
      const fallbackBody = await fallbackRes.json();
      const candidates = Array.isArray(fallbackBody) ? fallbackBody : fallbackBody?.data ?? [];
      const match =
        candidates.find(
          (r: { pl_name?: string }) =>
            r.pl_name?.toLowerCase().replace(/\s+/g, "") === targetId.toLowerCase(),
        ) ?? candidates[0];

      if (!match) {
        return NextResponse.json({
          source: "NASA Exoplanet Archive TAP",
          planetQuery: planetName,
          row: null,
          fetchedAt: new Date().toISOString(),
          error: "No matching planet row in Planetary Systems table.",
        });
      }

      const row: NasaStellarRow = {
        pl_name: String(match.pl_name ?? ""),
        hostname: String(match.hostname ?? ""),
        st_teff: parseJsonField(match.st_teff),
        st_rad: parseJsonField(match.st_rad),
        st_mass: parseJsonField(match.st_mass),
        st_logg: parseJsonField(match.st_logg),
        st_met: parseJsonField(match.st_met),
      };

      return NextResponse.json({
        source: "NASA Exoplanet Archive TAP",
        planetQuery: row.pl_name,
        row,
        fetchedAt: new Date().toISOString(),
      });
    }

    const row: NasaStellarRow = {
      pl_name: String(record.pl_name ?? ""),
      hostname: String(record.hostname ?? ""),
      st_teff: parseJsonField(record.st_teff),
      st_rad: parseJsonField(record.st_rad),
      st_mass: parseJsonField(record.st_mass),
      st_logg: parseJsonField(record.st_logg),
      st_met: parseJsonField(record.st_met),
    };

    return NextResponse.json({
      source: "NASA Exoplanet Archive TAP",
      planetQuery: planetName,
      row,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TAP request failed";
    return NextResponse.json(
      {
        source: "NASA Exoplanet Archive TAP",
        planetQuery: planetName,
        row: null,
        fetchedAt: new Date().toISOString(),
        error: message,
      },
      { status: 500 },
    );
  }
}