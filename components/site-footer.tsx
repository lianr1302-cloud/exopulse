const FOOTER_LINK =
  "text-blue-400 underline-offset-2 transition-colors hover:text-blue-300 hover:underline";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-sm text-slate-400">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="leading-relaxed">
          Built for the 2026 NASA Space Apps Challenge | Powered by{" "}
          <a
            className={FOOTER_LINK}
            href="https://exoplanetarchive.ipac.caltech.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            NASA Exoplanet Archive TAP API
          </a>
          ,{" "}
          <a
            className={FOOTER_LINK}
            href="https://archive.stsci.edu/missions-and-data/tess"
            target="_blank"
            rel="noopener noreferrer"
          >
            MAST TESS Archive
          </a>
          {" "}
          &amp;{" "}
          <a
            className={FOOTER_LINK}
            href="https://data.nasa.gov/dataset/kepler"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kepler Open Dataset
          </a>
        </p>
        <p className="mt-3 text-xs text-slate-500">
          © {new Date().getFullYear()} ExoPulse — Secondary Eclipse &amp; Thermal Emission Profiler
        </p>
      </div>
    </footer>
  );
}