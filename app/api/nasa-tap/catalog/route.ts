import { NextRequest, NextResponse } from "next/server";

import { fetchTapJson, sanitizeAdqlLiteral } from "@/lib/tap-client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  const literal = sanitizeAdqlLiteral(q.replace(/\s+/g, " "));
  const sql = [
    "select top 40 pl_name,hostname,st_teff,st_rad,pl_radj,pl_rade,pl_orbper,pl_eqt",
    "from ps",
    "where default_flag=1",
    `and (pl_name like '%${literal}%' or hostname like '%${literal}%')`,
    "order by pl_name asc",
  ].join(" ");

  try {
    const results = await fetchTapJson<Record<string, unknown>>(sql);
    return NextResponse.json({
      query: q,
      count: results.length,
      results: results.map((row) => ({
        pl_name: String(row.pl_name ?? ""),
        hostname: String(row.hostname ?? ""),
        st_teff: row.st_teff ?? null,
        st_rad: row.st_rad ?? null,
        pl_orbper: row.pl_orbper ?? null,
        pl_eqt: row.pl_eqt ?? null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TAP catalog query failed";
    return NextResponse.json({ query: q, results: [], error: message }, { status: 502 });
  }
}