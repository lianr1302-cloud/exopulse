export const TAP_BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

export function parseTapNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function fetchTapJson<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const url = `${TAP_BASE}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`TAP HTTP ${response.status}`);
  }
  const body = await response.json();
  if (Array.isArray(body)) {
    return body as T[];
  }
  if (Array.isArray(body?.data)) {
    return body.data as T[];
  }
  return [];
}

export function sanitizeAdqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}