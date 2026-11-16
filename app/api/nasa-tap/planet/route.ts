import { NextRequest, NextResponse } from "next/server";

import { fetchTapJson, parseTapNumber, sanitizeAdqlLiteral } from "@/lib/tap-client";
import type { NasaPlanetRecord } from "@/lib/target-resolver";

const SELECT_FIELDS = [
  "pl_name",
  "hostname",
  "st_teff",
  "st_rad",
  "st_mass",
  "st_logg",
  "st_met",
  "pl_radj",
  "pl_rade",
  "pl_orbper",
  "pl_orbsmax",
  "pl_eqt",
  "pl_trandep",
].join(",");

function rowToPlanetRecord(row: Record<string, unknown>): NasaPlanetRecord {
  return {
    pl_name: String(row.pl_name ?? ""),
    hostname: String(row.hostname ?? ""),
    st_teff: parseTapNumber(row.st_teff),
    st_rad: parseTapNumber(row.st_rad),
    st_mass: parseTapNumber(row.st_mass),
    st_logg: parseTapNumber(row.st_logg),
    st_met: parseTapNumber(row.st_met),
    pl_radj: parseTapNumber(row.pl_radj),
    pl_rade: parseTapNumber(row.pl_rade),
    pl_orbper: parseTapNumber(row.pl_orbper),
    pl_orbsmax: parseTapNumber(row.pl_orbsmax),
    pl_eqt: parseTapNumber(row.pl_eqt),
    pl_trandep: parseTapNumber(row.pl_trandep),
  };
}

async function lookupPlanet(plName: string): Promise<NasaPlanetRecord | null> {
  const exactSql = [
    `select ${SELECT_FIELDS}`,
    "from ps",
    `where default_flag=1 and pl_name='${sanitizeAdqlLiteral(plName)}'`,
  ].join(" ");

  let rows = await fetchTapJson(exactSql);
  if (rows[0]) {
    return rowToPlanetRecord(rows[0]);
  }

  const normalized = plName.trim().replace(/b$/i, " b");
  if (normalized !== plName) {
    rows = await fetchTapJson(
      [
        `select ${SELECT_FIELDS}`,
        "from ps",
        `where default_flag=1 and pl_name='${sanitizeAdqlLiteral(normalized)}'`,
      ].join(" "),
    );
    if (rows[0]) {
      return rowToPlanetRecord(rows[0]);
    }
  }

  const fuzzy = sanitizeAdqlLiteral(plName.split(" ")[0] ?? plName);
  const fuzzySql = [
    `select top 5 ${SELECT_FIELDS}`,
    "from ps",
    "where default_flag=1",
    `and pl_name like '${fuzzy}%'`,
    "order by pl_name asc",
  ].join(" ");

  rows = await fetchTapJson(fuzzySql);
  const compact = plName.toLowerCase().replace(/\s+/g, "");
  const match =
    rows.find((r) => String(r.pl_name ?? "").toLowerCase().replace(/\s+/g, "") === compact) ?? rows[0];

  return match ? rowToPlanetRecord(match) : null;
}

export async function GET(request: NextRequest) {
  const plName = request.nextUrl.searchParams.get("pl_name")?.trim();
  const targetId = request.nextUrl.searchParams.get("targetId")?.trim();

  if (!plName && !targetId) {
    return NextResponse.json({ error: "Provide pl_name or targetId." }, { status: 400 });
  }

  const queryName = plName ?? targetId!.replace(/b$/i, " b").replace(/([a-z])(\d)/i, "$1-$2");

  try {
    const row = await lookupPlanet(queryName);
    if (!row) {
      return NextResponse.json(
        { row: null, error: "Planet not found in NASA Exoplanet Archive." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      source: "NASA Exoplanet Archive TAP",
      fetchedAt: new Date().toISOString(),
      row,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TAP planet lookup failed";
    return NextResponse.json({ row: null, error: message }, { status: 502 });
  }
}