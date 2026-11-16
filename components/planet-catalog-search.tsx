"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, Loader2, Search } from "lucide-react";

export interface CatalogHit {
  pl_name: string;
  hostname: string;
  st_teff?: number | null;
  st_rad?: number | null;
  pl_orbper?: number | null;
  pl_eqt?: number | null;
}

interface PlanetCatalogSearchProps {
  localTargets: string[];
  value: string;
  onSelect: (plName: string, fromCache: boolean) => void;
}

/** NASA TAP infinite catalog search (Planet X & SPHEREx challenge target picker). */
export function SearchableTargetSelector(props: PlanetCatalogSearchProps) {
  return <PlanetCatalogSearch {...props} />;
}

export function PlanetCatalogSearch({ localTargets, value, onSelect }: PlanetCatalogSearchProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remoteHits, setRemoteHits] = useState<CatalogHit[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const localFiltered = useMemoLocal(localTargets, query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runCatalogQuery = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setRemoteHits([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/nasa-tap/catalog?q=${encodeURIComponent(q.trim())}`);
        const payload = await res.json();
        setRemoteHits(Array.isArray(payload.results) ? payload.results : []);
      } catch {
        setRemoteHits([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      void runCatalogQuery(query);
    }, 320);
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query, open, runCatalogQuery]);

  const pick = (plName: string, fromCache: boolean) => {
    onSelect(plName, fromCache);
    setQuery(plName);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full lg:max-w-md">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Infinite NASA Exoplanet Archive catalog (TAP)
      </span>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="planet-catalog-listbox"
          placeholder="TRAPPIST-1 e, K2-18 b, TOI-700 d, WASP-121b…"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-10 text-sm outline-none ring-accent focus:ring-2"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const first = remoteHits[0]?.pl_name ?? localFiltered[0];
              if (first) {
                const fromCache = localFiltered.some(
                  (id) => id.toLowerCase() === first.toLowerCase().replace(/\s+/g, ""),
                );
                pick(first, fromCache);
              }
            }
          }}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" />
        ) : (
          <Globe2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-accent" />
        )}
      </div>
      {open ? (
        <ul
          id="planet-catalog-listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-2xl"
        >
          {localFiltered.length > 0 ? (
            <li className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted">Local cache</li>
          ) : null}
          {localFiltered.map((id) => (
            <li key={`local-${id}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent/10"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(id, true);
                }}
              >
                {id} <span className="text-xs text-muted">· cached light curve</span>
              </button>
            </li>
          ))}
          {remoteHits.length > 0 ? (
            <li className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted">NASA Archive</li>
          ) : null}
          {remoteHits.map((hit) => (
            <li key={hit.pl_name}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent/10"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const fromCache = localTargets.some(
                    (id) => id.toLowerCase() === hit.pl_name.toLowerCase().replace(/\s+/g, ""),
                  );
                  pick(hit.pl_name, fromCache);
                }}
              >
                {hit.pl_name}
                <span className="ml-1 text-xs text-muted">
                  · {hit.hostname} · P={hit.pl_orbper ?? "—"} d
                </span>
              </button>
            </li>
          ))}
          {!loading && localFiltered.length === 0 && remoteHits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">Type a confirmed planet name to query TAP.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function useMemoLocal(localTargets: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return localTargets;
  }
  return localTargets.filter((id) => id.toLowerCase().includes(q));
}