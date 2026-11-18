# Engineering Roadmap — `07-PORTFOLIO-WEBSITE`

## Completed (v1.0.0)
- [x] **Workspace & Toolchain Setup**: Strict TypeScript (`tsconfig.json`), Vite 6 relative-base build config (`vite.config.ts`), MIT License, `.gitignore`, `.env.example`.
- [x] **Automated Workspace Sync Engine**: Implemented `scripts/sync_portfolio_data.py` scanning `01-AEROLENS`..`06-CELLGUARD`, `.git` commits, BOM files, KiCad/Gerbers, STL/SCAD CAD files, test files, and `00-PORTFOLIO-MANAGEMENT` tables into `src/data/projects.json`.
- [x] **Bespoke Aerospace HUD UI**: Deep obsidian `#07090E` grid design system, Space Grotesk / Inter / JetBrains Mono typography, responsive layout, domain category filters, and `/` keyboard search.
- [x] **Interactive Project Deep-Dive Modal**: Problem statement, interactive SVG bus/module diagram, disk-verified file & test tree, BOM & STL/PCB cards, copyable local CLI workflow.
- [x] **4-Mode Interactive Engineering Labs**: Live SVG/Canvas physics and DSP calculations for 21700 battery discharge, AeroLens IMU FFT, SwarmForge A*/RRT*/APF trajectories, and SARVision/RoverSAR kinematics.
- [x] **Production Bundle & FastAPI Server**: Static `dist/` build served seamlessly via `server.py` with `/api/health` and `/api/projects`.
- [x] **Verification Suite**: `tests/test_portfolio_integrity.py` covering directory backing, schema/graph invariants, BOM checks, forbidden URL patterns, `dist/` integrity, and FastAPI integration.

## Upcoming Milestones (v1.1+)
- [ ] Re-run `scripts/sync_portfolio_data.py` after final Phase 3 Agent 08 verification and GitHub push to reflect final remote GitHub URLs and total test counts.
- [ ] Embed verified real dashboard screenshots (captured via browser QA) inside project detail tabs under `public/screenshots/` once generated.
- [ ] Add GitHub Actions CI workflow (`.github/workflows/ci.yml`) running `npm run typecheck && npm run build && pytest` on every push to `main`.
