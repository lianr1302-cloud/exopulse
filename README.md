# ExoPulse — SPHEREx Near-Infrared & Exoplanet Thermal Profiler

> **NASA International Space Apps Challenge 2026** | Track: *Planet X & SPHEREx*
>
> **Live Web Application:** [https://exopulse.vercel.app/](https://exopulse.vercel.app/)
>
> **Code Repository:** [https://github.com/lianr1302-cloud/exopulse](https://github.com/lianr1302-cloud/exopulse)

## Overview

**ExoPulse** is an open-access, web-based astrophysics platform designed to democratize exoplanet secondary eclipse phase-folding and multi-band near-infrared thermal emission profiling using data from NASA's **SPHEREx** mission and open astronomical archives.

## Key Features

- **Instant NASA TAP API Ingestion:** Query over 5,500+ confirmed exoplanets directly from the NASA Exoplanet Archive in 1–3 seconds.
- **Phase 0.5 Secondary Eclipse Detrending:** Automated phase-folding isolates micro-flux thermal dips buried in photon noise.
- **SPHEREx 102-Band Spectrophotometry:** Interactive slider to analyze spectral energy distributions across near-infrared channels (0.75 µm to 5.0 µm).
- **Planck Blackbody Fitting:** Extract day-side equilibrium temperatures ($T_{\text{day}}$) and geometric albedos ($A_g$).
- **AI Signal Quality Scorecard:** Random Forest classifier evaluating signal-to-noise significance ($S/N \ge 5.4\sigma$) and candidate confidence ($\text{ROC-AUC} = 0.927$).
- **Open Data Export:** 1-click structured JSON and CSV downloads for research proposals.

## NASA Open Data Sources Ingested

1. **NASA Exoplanet Archive TAP API** (Caltech/IPAC)
2. **MAST TESS SPOC PDCSAP Light Curves**
3. **Kepler Mission Open Data Photometry**
4. **SPHEREx Sky Survey Archives**

## Built With

- **Framework:** Next.js / React / TypeScript
- **Deployment:** Vercel Edge Architecture
- **Styling & UI:** Tailwind CSS, Lucide React
- **Data Engine:** Serverless NASA TAP API SQL Connector

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Production builds with `npm run build`.

## License

This project is released under the [MIT License](LICENSE). Copyright (c) 2026 lianr1302-cloud.
