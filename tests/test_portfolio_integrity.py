"""Comprehensive verification suite for Jagjyot Engineering Portfolio (Project 07).

Checks:
1. Real directory backing for all 6 showcased systems (01..06).
2. JSON schema, architecture graph referential integrity, and hardware BOM validity.
3. Strict absence of fabricated live cloud demo URLs or placeholder copy.
4. Synchronization fidelity against 00-PORTFOLIO-MANAGEMENT governance docs.
5. Valid built Vite production bundle (dist/index.html + hashed JS/CSS assets).
6. FastAPI server endpoints (/api/health, /api/projects, SPA fallback).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO_ROOT = PROJECT_ROOT.parent

sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

import server  # noqa: E402
import sync_portfolio_data as syncer  # noqa: E402

EXPECTED_FOLDERS = [
    "01-AEROLENS",
    "02-SARVISION",
    "03-SWARMFORGE",
    "04-FLIGHTCORE",
    "05-ROVERSAR",
    "06-CELLGUARD",
]

FORBIDDEN_URL_PATTERNS = [
    r"netlify\.app",
    r"vercel\.app",
    r"herokuapp\.com",
    r"render\.com",
    r"example\.com",
    r"lorem\s+ipsum",
    r"demo\.aerolens",
    r"demo\.sarvision",
]


@pytest.fixture(scope="module")
def synced_data() -> dict:
    data_path = PROJECT_ROOT / "src" / "data" / "projects.json"
    assert data_path.exists(), "src/data/projects.json missing; run scripts/sync_portfolio_data.py"
    return json.loads(data_path.read_text(encoding="utf-8"))


def test_all_project_directories_exist(synced_data: dict) -> None:
    projects = synced_data["projects"]
    assert len(projects) == 6
    folders = [p["folder"] for p in projects]
    assert folders == EXPECTED_FOLDERS
    for folder in folders:
        assert (PORTFOLIO_ROOT / folder).is_dir(), f"Missing real workspace folder: {folder}"


def test_projects_schema_and_architecture_graph_integrity(synced_data: dict) -> None:
    assert synced_data["schema_version"] == "1.0.0"
    assert synced_data["portfolio_owner"] == "Jagjyot"
    meta = synced_data["portfolio_meta"]
    assert meta["total_projects"] == 6
    assert meta["hardware_systems_count"] == 3
    assert meta["software_systems_count"] == 2
    assert meta["simulation_systems_count"] == 1

    required_keys = {
        "id",
        "code",
        "folder",
        "name",
        "tagline",
        "category",
        "domain_badge",
        "problem_statement",
        "solution_summary",
        "key_highlights",
        "architecture",
        "tech_stack",
        "hardware",
        "repo",
        "local_launch",
        "verification",
    }

    for proj in synced_data["projects"]:
        assert required_keys.issubset(proj.keys()), f"Missing keys in {proj.get('id')}"
        assert proj["category"] in {"Software & AI", "Simulation", "Embedded & Hardware"}
        assert len(proj["key_highlights"]) >= 3
        assert len(proj["local_launch"]["commands"]) >= 2

        nodes = proj["architecture"]["nodes"]
        links = proj["architecture"]["links"]
        node_ids = {n["id"] for n in nodes}
        assert len(nodes) >= 4
        for link in links:
            assert link["from"] in node_ids, f"Invalid link source {link['from']} in {proj['id']}"
            assert link["to"] in node_ids, f"Invalid link target {link['to']} in {proj['id']}"


def test_hardware_bom_integrity(synced_data: dict) -> None:
    for proj in synced_data["projects"]:
        hw = proj["hardware"]
        if proj["category"] == "Embedded & Hardware":
            assert hw["has_hardware"] is True
            assert hw["mcu"]
            assert len(hw["bom_items"]) >= 4
            for item in hw["bom_items"]:
                assert item["part"]
                assert item["qty"] >= 1
        else:
            assert hw["has_hardware"] is False
            assert hw["bom_items"] == []


def test_target_repos_match_governance_registry(synced_data: dict) -> None:
    registry_path = PORTFOLIO_ROOT / "00-PORTFOLIO-MANAGEMENT" / "github-repositories.md"
    assert registry_path.exists()
    rows = syncer.parse_markdown_table(registry_path.read_text(encoding="utf-8"))
    by_folder = {r["Project Folder"]: r for r in rows}

    for proj in synced_data["projects"]:
        reg = by_folder.get(proj["folder"])
        assert reg is not None, f"{proj['folder']} missing from github-repositories.md"
        assert proj["repo"]["target_repo_name"] == reg["Target Repository Name"]
        remote_url = proj["repo"]["remote_url"]
        if remote_url is not None:
            assert remote_url.startswith("https://github.com/")
            assert proj["repo"]["target_repo_name"] in remote_url


def test_no_fabricated_demo_urls_or_placeholders() -> None:
    files_to_scan = [
        PROJECT_ROOT / "src" / "data" / "projects.json",
        PROJECT_ROOT / "README.md",
        PROJECT_ROOT / "ARCHITECTURE.md",
        *list((PROJECT_ROOT / "src").rglob("*.ts")),
        *list((PROJECT_ROOT / "src").rglob("*.tsx")),
    ]
    for path in files_to_scan:
        content = path.read_text(encoding="utf-8", errors="ignore")
        for pat in FORBIDDEN_URL_PATTERNS:
            assert not re.search(pat, content, flags=re.IGNORECASE), (
                f"Forbidden placeholder pattern '{pat}' found in {path}"
            )


def test_production_vite_bundle_valid() -> None:
    dist_dir = PROJECT_ROOT / "dist"
    index_html = dist_dir / "index.html"
    assert index_html.is_file(), "dist/index.html missing; run npm run build"

    html = index_html.read_text(encoding="utf-8")
    assert '<div id="root"></div>' in html
    assert "JAGJYOT" in html

    # Verify all referenced local JS/CSS assets exist inside dist/
    asset_refs = re.findall(r'(?:src|href)=["\'](\.?/?assets/[^"\']+)["\']', html)
    assert len(asset_refs) >= 2, "Expected compiled JS and CSS assets in dist/index.html"
    for ref in asset_refs:
        clean_ref = ref.lstrip("./")
        assert (dist_dir / clean_ref).is_file(), f"Referenced bundle asset missing: {clean_ref}"


def test_fastapi_server_endpoints() -> None:
    client = TestClient(server.app)

    health = client.get("/api/health")
    assert health.status_code == 200
    h_json = health.json()
    assert h_json["status"] == "ok"
    assert h_json["bundle_ready"] is True
    assert h_json["projects_count"] == 6

    all_projects = client.get("/api/projects")
    assert all_projects.status_code == 200
    assert len(all_projects.json()["projects"]) == 6

    fc = client.get("/api/projects/flightcore")
    assert fc.status_code == 200
    assert fc.json()["name"] == "FlightCore"

    missing = client.get("/api/projects/does-not-exist")
    assert missing.status_code == 404

    spa = client.get("/")
    assert spa.status_code == 200
    assert "text/html" in spa.headers["content-type"]


def test_sync_helpers_parse_bom_and_urls(tmp_path: Path) -> None:
    csv_bom = tmp_path / "test_bom.csv"
    csv_bom.write_text(
        "Designator,Part,Spec,Qty\nU1,ESP32-WROOM-32E,WiFi/BLE MCU,1\nR1,WSL2512 2mOhm,Kelvin Shunt,2\n",
        encoding="utf-8",
    )
    items = syncer.parse_bom_file(csv_bom)
    assert len(items) == 2
    assert items[0]["part"] == "ESP32-WROOM-32E"
    assert items[1]["qty"] == 2

    assert syncer.extract_real_remote_url("Pending gh auth") is None
    assert (
        syncer.extract_real_remote_url("https://github.com/Jagjyot/aerolens-flight-analytics")
        == "https://github.com/Jagjyot/aerolens-flight-analytics"
    )

    unity_test = tmp_path / "test_unity.cpp"
    unity_test.write_text("void setUp(){}\nRUN_TEST(test_crc);\nRUN_TEST(test_frame);\n", encoding="utf-8")
    assert syncer.count_tests_in_file(unity_test) == 2

    py_test = tmp_path / "test_mod.py"
    py_test.write_text("def test_one(): pass\nasync def test_two(): pass\n", encoding="utf-8")
    assert syncer.count_tests_in_file(py_test) == 2
