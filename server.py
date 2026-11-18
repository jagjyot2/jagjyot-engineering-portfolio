#!/usr/bin/env python3
"""Production FastAPI server & JSON telemetry endpoint for Jagjyot Engineering Portfolio.

Serves the built Vite bundle from ./dist out-of-the-box while exposing live
synchronized metadata endpoints (/api/health, /api/projects).
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "dist"
DATA_PATH = ROOT_DIR / "src" / "data" / "projects.json"

app = FastAPI(
    title="Jagjyot Engineering Portfolio Server",
    version="1.0.0",
    description="Static bundle server and synchronized project telemetry API.",
)


def load_projects_payload() -> dict[str, Any]:
    if not DATA_PATH.exists():
        raise HTTPException(status_code=404, detail="projects.json not synced yet.")
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    data = load_projects_payload()
    return {
        "status": "ok",
        "service": "jagjyot-engineering-portfolio",
        "bundle_ready": (DIST_DIR / "index.html").exists(),
        "projects_count": len(data.get("projects", [])),
        "generated_at": data.get("generated_at"),
    }


@app.get("/api/projects")
def get_projects() -> dict[str, Any]:
    return load_projects_payload()


@app.get("/api/projects/{project_id}")
def get_project(project_id: str) -> dict[str, Any]:
    data = load_projects_payload()
    for proj in data.get("projects", []):
        if proj.get("id") == project_id:
            return proj
    raise HTTPException(status_code=404, detail=f"Unknown project id: {project_id}")


if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")


@app.get("/{full_path:path}")
def serve_spa(full_path: str) -> FileResponse:
    index_file = DIST_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(
            status_code=503,
            detail="Production bundle dist/index.html missing. Run 'npm run build'.",
        )
    candidate = (DIST_DIR / full_path).resolve()
    if full_path and candidate.is_file() and candidate.is_relative_to(DIST_DIR.resolve()):
        return FileResponse(candidate)
    return FileResponse(index_file)


if __name__ == "__main__":
    host = os.getenv("PORTFOLIO_HOST", "127.0.0.1")
    port = int(os.getenv("PORTFOLIO_PORT", "8070"))
    uvicorn.run("server:app", host=host, port=port, reload=False)
