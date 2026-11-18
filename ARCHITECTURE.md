# System Architecture — `07-PORTFOLIO-WEBSITE`

## 1. High-Level Pipeline

```
../00-PORTFOLIO-MANAGEMENT/       ../01..06 Project Folders
 (PROJECT-STATUS.md,               (README, BOM CSV/MD, KiCad,
  github-repositories.md)           STL/SCAD, tests/, .git)
            │                                  │
            └──────────────┬───────────────────┘
                           ▼
             scripts/sync_portfolio_data.py
                           │
                           ▼
                 src/data/projects.json
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
   Vite + React + TS                   FastAPI server.py
  (dist/index.html + assets/)         (/api/health, /api/projects,
                                       static SPA fallback)
```

## 2. Frontend Module Responsibilities

- **`src/types/portfolio.ts`**: Strict TypeScript contracts enforcing schema parity with `projects.json`.
- **`src/utils/simulationMath.ts`**: Deterministic physics/math engine (zero external charting dependencies):
  - `computeDischargeCurve`: 21700 Li-Ion OCV piecewise interpolation, temperature/SoH impedance model, thermal rise ODE approximation.
  - `computeFlightSpectralProfile`: 128-point Hann-windowed DFT magnitude calculation and anomaly Z-score estimator.
  - `simulateSwarmMission`: Multi-agent obstacle deflection trajectories and benchmark metrics across A*, RRT*, and APF.
  - `computeSarAndRoverTelemetry`: EXIF pinhole GSD/swath raycasting and differential-drive turning radius kinematics.
- **`src/components/NavbarHUD.tsx`**: Sticky navigation telemetry bar, synchronized file counters, `/` shortcut trigger.
- **`src/components/HeroTelemetry.tsx`**: Asymmetric editorial hero + interactive 6-node constellation scope.
- **`src/components/FilterBar.tsx`**: Domain filter tabs (`All`, `Software & AI`, `Simulation`, `Embedded & Hardware`) and instant multi-field search.
- **`src/components/ProjectCard.tsx`**: System card summarizing status, highlights, stack, file/test counts, and git commit hash.
- **`src/components/ArchitectureDiagram.tsx`**: Interactive SVG schematic rendering subsystem nodes and signal/power buses with click inspection.
- **`src/components/ProjectModal.tsx`**: Deep-dive tabbed modal (`Problem & Architecture`, `Stack & Files`, `Hardware BOM & CAD`, `Local CLI & Verification`).
- **`src/components/InteractiveLabs.tsx`**: Four-tab interactive telemetry engineering bench (SVG + HTML5 Canvas).
- **`src/components/HardwareShowcase.tsx`**: Side-by-side comparison of FlightCore, RoverSAR, and CellGuard PCB/BOM/STL/BenchTwin readiness.
- **`src/components/RepoVerificationTable.tsx`**: Ground-truth verification table displaying real scanned test counts, file counts, and repo push status.

## 3. Truthfulness & Security Guarantees

1. **No Fabricated Live URLs**: `sync_portfolio_data.py` only emits `remote_url` if a verified `https://github.com/...` URL exists in `github-repositories.md`. Unpushed repositories display target repository names and local execution commands.
2. **Path Traversal Protection**: `server.py` validates SPA static file paths with `Path.is_relative_to(DIST_DIR.resolve())`.
3. **Automated Regression Gate**: `tests/test_portfolio_integrity.py` asserts directory backing, architecture link validity, BOM consistency, forbidden placeholder patterns, `dist/` bundle assets, and FastAPI HTTP responses.
