# Jagjyot Engineering Portfolio (`jagjyot-engineering-portfolio`)

> Bespoke dark-mode aerospace, robotics, AI vision, and embedded hardware portfolio web application synchronized directly with local multi-project workspaces (`01-AEROLENS` through `06-CELLGUARD`) and `00-PORTFOLIO-MANAGEMENT/`.

## Overview

Built with **React 19 + TypeScript + Vite**, a lightweight **FastAPI** production server (`server.py`), and a Python synchronization script (`scripts/sync_portfolio_data.py`), this portfolio presents six engineering systems with verified workspace metrics, interactive SVG system architectures, hardware BOM/PCB/STL summaries, and real-time mathematical engineering mini-labs.

### Showcased Engineering Systems

| Code | System | Domain | Workspace Folder | Target GitHub Repo |
|---|---|---|---|---|
| `SYS-01` | **AeroLens** | Aerospace Telemetry & Flight Log Analytics | `../01-AEROLENS/` | `aerolens-flight-analytics` |
| `SYS-02` | **SARVision** | Tiled AI Aerial Search & Rescue Vision | `../02-SARVISION/` | `sarvision-ai` |
| `SYS-03` | **SwarmForge** | Multi-UAV 3D Mission Planning & WebGL Twin | `../03-SWARMFORGE/` | `swarmforge-uav-simulator` |
| `SYS-04` | **FlightCore** | ESP32 + LoRa + KiCad Avionics Telemetry PCB | `../04-FLIGHTCORE/` | `flightcore-telemetry` |
| `SYS-05` | **RoverSAR** | Autonomous Diff-Drive SAR Robot & STL CAD | `../05-ROVERSAR/` | `roversar-autonomous-robot` |
| `SYS-06` | **CellGuard** | 21700 Li-Ion Kelvin-Shunt BMS & SoC/SoH Monitor | `../06-CELLGUARD/` | `cellguard-battery-monitor` |

## Key Features

- **Industrial Aerospace Obsidian HUD**: `#07090E` deep obsidian canvas, minor/major blueprint coordinate grid, fiducial panel brackets, Space Grotesk / Inter / JetBrains Mono typography, cyan (`#00F0FF`) and amber (`#FFB800`) telemetry accents.
- **Truth-Grounded Workspace Sync (`scripts/sync_portfolio_data.py`)**: Scans actual project folders, `PROJECT-STATUS.md`, `github-repositories.md`, KiCad schematics, Gerbers, STL/OpenSCAD files, BOM tables, test counts, and Git commit hashes into `src/data/projects.json`. Zero fabricated live cloud URLs.
- **Interactive System Inspector Modal**: Problem statement, clickable SVG architecture block diagram, disk-detected tech stack & file tree, hardware BOM & STL/PCB summary, and copyable local CLI instructions.
- **4 Interactive Physics & Signal Telemetry Labs**:
  1. **CellGuard / FlightCore 21700 Pack Simulator**: 4S/6S Li-Ion OCV lookup, temperature & SoH-adjusted $R_{\text{dc}}$ voltage sag, $I^2R$ thermal rise, and interactive hover crosshair.
  2. **AeroLens IMU Spectral FFT Lab**: 512 Hz synthetic vibration/brownout waveforms + Hann-windowed DFT magnitude spectrum (0–256 Hz).
  3. **SwarmForge Path Planner Comparator**: HTML5 Canvas 2D multi-UAV avoidance arena comparing `3D A*`, `RRT*`, and `APF` optimality vs latency.
  4. **SARVision Geo-Raycast & RoverSAR Kinematics**: EXIF pinhole Ground Sample Distance (GSD), slant range, WGS84 delta projection, and differential-drive turning radius.

## Quick Start

### 1. Synchronize Live Project Data
```bash
python scripts/sync_portfolio_data.py
```

### 2. Run Development Server (Vite)
```bash
npm install
npm run dev
```

### 3. Build & Serve Production Bundle (FastAPI + Static `dist/`)
```bash
npm run build
python server.py
# Or: uvicorn server:app --host 127.0.0.1 --port 8070
```
Open `http://127.0.0.1:8070` for the web portfolio, `http://127.0.0.1:8070/api/health` for health telemetry, and `http://127.0.0.1:8070/api/projects` for live JSON data.

### 4. Run Integrity & Bundle Verification Tests
```bash
pytest -v
```

## License

MIT License — see [`LICENSE`](./LICENSE).
