#!/usr/bin/env python3
"""Synchronize portfolio metadata from sibling project workspaces (01..06) and
00-PORTFOLIO-MANAGEMENT governance docs into src/data/projects.json.

Only real files, real git commits, and parsed status matrix metrics are marked
as live workspace artifacts; missing sibling files are honestly reported as
initializing/blueprint status without fabricating fake live demo links.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    ".pio",
    ".pioenvs",
    ".piolibdeps",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "dist",
    "build",
}


@dataclass(frozen=True)
class ProjectBlueprint:
    """Authoritative domain blueprint metadata for a portfolio system."""

    id: str
    code: str
    folder: str
    name: str
    tagline: str
    category: str
    domain_badge: str
    target_repo_name: str
    problem_statement: str
    solution_summary: str
    key_highlights: list[str]
    core_tech_stack: list[str]
    architecture: dict[str, Any]
    hardware_spec: dict[str, Any]
    default_local_launch: dict[str, Any]


BLUEPRINTS: list[ProjectBlueprint] = [
    ProjectBlueprint(
        id="aerolens",
        code="SYS-01",
        folder="01-AEROLENS",
        name="AeroLens",
        tagline="Modular Drone Flight Log Analytics, Spectral Anomaly Detection & Reporting Platform",
        category="Software & AI",
        domain_badge="Aerospace Telemetry",
        target_repo_name="aerolens-flight-analytics",
        problem_statement=(
            "Raw ArduPilot (.bin), PX4 (.ulg), and MAVLink flight logs encapsulate multi-rate IMU, "
            "ESC, GPS, and battery messages where transient rotor harmonics, voltage sags, and sensor "
            "glitches are tedious to isolate manually across post-flight debriefs."
        ),
        solution_summary=(
            "End-to-end flight telemetry ingestion and diagnostics pipeline combining deterministic "
            "ULog/MAVLink parsing, spectral FFT vibration & electrical anomaly detection, SQLite run "
            "persistence, FastAPI REST endpoints, PDF/HTML/CSV reporting, and a React + Plotly UI."
        ),
        key_highlights=[
            "Multi-format ArduPilot/PX4 ULog & MAVLink log ingestion",
            "Spectral FFT harmonic peak, voltage brownout & GPS HDOP anomaly engine",
            "SQLite flight history persistence with FastAPI REST API",
            "Automated PDF, interactive HTML & CSV flight diagnostics export",
        ],
        core_tech_stack=[
            "Python 3.12",
            "FastAPI",
            "SQLAlchemy",
            "NumPy",
            "SciPy",
            "React",
            "TypeScript",
            "Plotly",
            "SQLite",
        ],
        architecture={
            "summary": "Multi-stage telemetry ingestion, signal spectral diagnostics, persistent storage, and interactive reporting pipeline.",
            "nodes": [
                {"id": "ingest", "label": "ULog / MAVLink Parser", "layer": "Ingestion", "detail": "Decodes multi-rate ArduPilot/PX4 telemetry streams & synthetic flight logs."},
                {"id": "sync", "label": "Time-Series Resampler", "layer": "Signal Prep", "detail": "Aligns asynchronous IMU, baro, GPS & ESC frames onto uniform Δt grid."},
                {"id": "anomaly", "label": "Spectral & Power Anomaly Engine", "layer": "Diagnostics", "detail": "Runs Welch/FFT vibration peaks, Z-score attitude drift & V_bat sag checks."},
                {"id": "store", "label": "SQLite + SQLAlchemy Store", "layer": "Persistence", "detail": "Indexes flight sessions, severity markers & summary KPIs."},
                {"id": "api", "label": "FastAPI REST + Exporters", "layer": "Backend API", "detail": "Serves JSON time-series and exports PDF, HTML, and CSV mission briefs."},
                {"id": "ui", "label": "React + TS + Plotly HUD", "layer": "Frontend", "detail": "Interactive synchronized flight waveforms, anomaly pins & FFT overlays."},
            ],
            "links": [
                {"from": "ingest", "to": "sync", "bus": "Typed Telemetry Frames"},
                {"from": "sync", "to": "anomaly", "bus": "Uniform Float64 Arrays"},
                {"from": "anomaly", "to": "store", "bus": "Anomaly Events + KPIs"},
                {"from": "store", "to": "api", "bus": "ORM Queries"},
                {"from": "api", "to": "ui", "bus": "REST JSON / Export Blob"},
            ],
        },
        hardware_spec={
            "has_hardware": False,
            "summary": "Pure software flight log analytics suite; ingests real Pixhawk / ArduPilot / PX4 hardware logs.",
        },
        default_local_launch={
            "mode_label": "Local Backend + Frontend Dev",
            "commands": [
                "cd 01-AEROLENS",
                "uvicorn backend.main:app --reload --port 8001",
                "cd frontend && npm run dev",
            ],
            "default_endpoints": ["http://127.0.0.1:8001/docs", "http://127.0.0.1:5173"],
        },
    ),
    ProjectBlueprint(
        id="sarvision",
        code="SYS-02",
        folder="02-SARVISION",
        name="SARVision",
        tagline="AI-Powered Aerial Search & Rescue Tiled Vision, Geolocation & Verification System",
        category="Software & AI",
        domain_badge="AI / Computer Vision",
        target_repo_name="sarvision-ai",
        problem_statement=(
            "High-resolution UAV nadir/oblique imagery renders stranded hikers or distress markers as "
            "sub-32px targets that disappear under whole-image resizing, while uncalibrated pixel boxes "
            "lack verified latitude/longitude coordinates for ground rescue dispatch."
        ),
        solution_summary=(
            "Overlapping aerial image tiler with global Non-Maximum Suppression (NMS), dual ONNX/PyTorch "
            "+ OpenCV spectral SAR target detector, EXIF pinhole camera GPS raycaster, Precision/Recall/IoU "
            "evaluator, and a human-in-the-loop verification queue."
        ),
        key_highlights=[
            "Overlapping high-res aerial tiler + global cross-tile NMS deduplication",
            "ONNX Runtime / PyTorch + OpenCV spectral contrast SAR target detector",
            "EXIF metadata pinhole camera model projecting pixel boxes to GPS lat/lon",
            "Precision/Recall/IoU evaluator + operator verification workflow UI",
        ],
        core_tech_stack=[
            "Python 3.12",
            "PyTorch",
            "ONNX Runtime",
            "OpenCV",
            "FastAPI",
            "React",
            "TypeScript",
            "Pillow / EXIF",
        ],
        architecture={
            "summary": "Tiled inference pipeline preserving small-object resolution with photogrammetric GPS raycasting and human verification.",
            "nodes": [
                {"id": "tiler", "label": "High-Res Aerial Tiler", "layer": "Preprocessing", "detail": "Slices 4K/8K orthophotos into overlapping inference patches with margin guards."},
                {"id": "detector", "label": "ONNX / OpenCV SAR Detector", "layer": "Inference", "detail": "Detects high-contrast distress gear, thermal/spectral signatures & persons."},
                {"id": "nms", "label": "Global Coordinate NMS", "layer": "Fusion", "detail": "Merges duplicate detections across overlapping tile borders in frame coordinates."},
                {"id": "geo", "label": "EXIF Pinhole GPS Raycaster", "layer": "Geolocation", "detail": "Projects pixel centroids onto ground plane using focal length, AGL & gimbal yaw/pitch."},
                {"id": "eval", "label": "P/R/IoU Evaluator & Queue", "layer": "QA / Ops", "detail": "Scores synthetic validation sets and stages detections for operator confirmation."},
                {"id": "ui", "label": "React + TS Inspector UI", "layer": "Frontend", "detail": "Visualizes tiled detections, confidence thresholds & exported GPS waypoints."},
            ],
            "links": [
                {"from": "tiler", "to": "detector", "bus": "Overlapping RGB Patches"},
                {"from": "detector", "to": "nms", "bus": "Tile-Local BBoxes"},
                {"from": "nms", "to": "geo", "bus": "Global Frame Detections"},
                {"from": "geo", "to": "eval", "bus": "WGS84 Target Pins"},
                {"from": "eval", "to": "ui", "bus": "FastAPI Verification Queue"},
            ],
        },
        hardware_spec={
            "has_hardware": False,
            "summary": "AI computer vision software platform calibrated for UAV RGB/thermal camera EXIF intrinsics.",
        },
        default_local_launch={
            "mode_label": "Local Inference API + Inspector UI",
            "commands": [
                "cd 02-SARVISION",
                "uvicorn backend.main:app --reload --port 8002",
                "cd frontend && npm run dev",
            ],
            "default_endpoints": ["http://127.0.0.1:8002/docs", "http://127.0.0.1:5174"],
        },
    ),
    ProjectBlueprint(
        id="swarmforge",
        code="SYS-03",
        folder="03-SWARMFORGE",
        name="SwarmForge",
        tagline="Multi-Drone 3D Autonomous Mission Planning (A*, RRT*, APF) & WebGL Digital Twin",
        category="Simulation",
        domain_badge="3D Swarm Simulation",
        target_repo_name="swarmforge-uav-simulator",
        problem_statement=(
            "Coordinating multi-UAV search swarms in cluttered 3D airspace requires validating path "
            "planners under wind disturbance, battery energy constraints, geofences, and RF link loss "
            "before risking physical multi-rotor hardware."
        ),
        solution_summary=(
            "Deterministic 3D multi-UAV physics and energy simulation engine featuring 3D A*, RRT*, and "
            "Artificial Potential Field (APF) planners with live benchmark comparison, collision/geofence "
            "enforcement, comm-loss RTL failsafe, FastAPI WebSockets, and a React + Three.js 3D twin."
        ),
        key_highlights=[
            "3D UAV kinematics with aerodynamic drag, wind vector & battery depletion",
            "Pluggable 3D A*, RRT*, and APF trajectory planners with benchmark comparator",
            "Real-time inter-agent collision avoidance, cylindrical geofences & comm-loss RTL",
            "20 Hz FastAPI WebSocket state stream driving a Three.js 3D digital twin",
        ],
        core_tech_stack=[
            "Python 3.12",
            "NumPy",
            "SciPy",
            "FastAPI WebSockets",
            "React",
            "TypeScript",
            "Three.js",
            "WebGL",
        ],
        architecture={
            "summary": "Real-time 3D multi-agent physics and planner comparator streaming telemetry over WebSockets to a WebGL twin.",
            "nodes": [
                {"id": "planners", "label": "3D A* / RRT* / APF Planners", "layer": "Autonomy", "detail": "Generates 3D obstacle-free trajectories and benchmarks compute time vs optimality."},
                {"id": "safety", "label": "Collision & Geofence Guard", "layer": "Safety Layer", "detail": "Enforces separation radii, airspace boundaries & link-loss Return-to-Launch."},
                {"id": "physics", "label": "3D Kinematic + Wind + Battery", "layer": "Simulation", "detail": "Integrates 6-DoF-simplified velocity, wind shear & LiPo current draw."},
                {"id": "bench", "label": "Planner Benchmark Engine", "layer": "Analytics", "detail": "Compares path length, minimum obstacle clearance & CPU latency across planners."},
                {"id": "ws", "label": "FastAPI WebSocket Broker", "layer": "Transport", "detail": "Broadcasts agent pose, waypoints, battery % & safety alerts at real-time ticks."},
                {"id": "twin", "label": "React + Three.js 3D Twin", "layer": "Visualization", "detail": "Renders 3D drones, obstacle volumes, trajectory trails & HUD telemetry."},
            ],
            "links": [
                {"from": "planners", "to": "safety", "bus": "Candidate 3D Waypoints"},
                {"from": "safety", "to": "physics", "bus": "Validated Velocity Commands"},
                {"from": "physics", "to": "bench", "bus": "Trajectory & Energy Metrics"},
                {"from": "physics", "to": "ws", "bus": "20 Hz State Snapshots"},
                {"from": "ws", "to": "twin", "bus": "WebSocket JSON Stream"},
            ],
        },
        hardware_spec={
            "has_hardware": False,
            "summary": "Software-in-the-loop 3D multi-UAV swarm simulation & planner benchmarking digital twin.",
        },
        default_local_launch={
            "mode_label": "WebSocket Sim Engine + Three.js Twin",
            "commands": [
                "cd 03-SWARMFORGE",
                "uvicorn backend.main:app --reload --port 8003",
                "cd frontend && npm run dev",
            ],
            "default_endpoints": ["http://127.0.0.1:8003/docs", "http://127.0.0.1:5175"],
        },
    ),
    ProjectBlueprint(
        id="flightcore",
        code="SYS-04",
        folder="04-FLIGHTCORE",
        name="FlightCore",
        tagline="Modular ESP32 Drone Sensor Suite & CRC-16 LoRa Telemetry System (KiCad + PlatformIO)",
        category="Embedded & Hardware",
        domain_badge="Embedded Avionics PCB",
        target_repo_name="flightcore-telemetry",
        problem_statement=(
            "Custom research multi-rotors need a lightweight, EMI-resilient telemetry avionics board "
            "capable of fusing IMU attitude, laser altitude, rotor RPM, and pack health into CRC-16 "
            "protected LoRa packets independent of main flight controller lockups."
        ),
        solution_summary=(
            "Modular ESP32 PlatformIO firmware + KiCad 8 custom PCB integrating MPU6050 6-axis IMU, "
            "VL53L0X ToF lidar, Hall-effect RPM capture, ADC voltage/current/NTC channels, and SX1278 "
            "433/915 MHz LoRa telemetry with Gerbers, BOM, and BenchTwin workbench export."
        ),
        key_highlights=[
            "Deterministic ESP32 PlatformIO C++ firmware with modular sensor drivers",
            "Custom binary LoRa packet framing with CRC-16 integrity verification",
            "KiCad 8 schematic, 2/4-layer PCB layout, manufacturing Gerbers & BOM",
            "Automated C++/Python packet & sensor calibration verification suite",
        ],
        core_tech_stack=[
            "ESP32 (C++ / PlatformIO)",
            "SX1278 LoRa (SPI)",
            "MPU6050 IMU (I2C)",
            "VL53L0X ToF (I2C)",
            "KiCad 8",
            "Python Verification",
            "BenchTwin 3D",
        ],
        architecture={
            "summary": "Real-time ESP32 sensor acquisition fused into CRC-16 LoRa telemetry frames on a custom KiCad avionics carrier PCB.",
            "nodes": [
                {"id": "imu_tof", "label": "MPU6050 + VL53L0X Bus", "layer": "I2C Sensors", "detail": "Samples 6-axis gyro/accel & laser AGL range at 400 kHz Fast-Mode I2C."},
                {"id": "analog_rpm", "label": "Hall RPM + ADC V/I/NTC", "layer": "Power & Prop", "detail": "Interrupt-driven rotor RPM timer + 12-bit ADC pack voltage, shunt & temp."},
                {"id": "esp32", "label": "ESP32 Telemetry Core", "layer": "MCU / Firmware", "detail": "FreeRTOS task scheduler running sensor fusion & binary packet encoder."},
                {"id": "lora", "label": "SX1278 LoRa Transceiver", "layer": "RF Downlink", "detail": "SPI interface transmitting CRC-16 frames with RSSI/SNR link telemetry."},
                {"id": "pcb", "label": "KiCad 8 Avionics PCB", "layer": "Hardware", "detail": "Buck 5V->3.3V LDO regulation, RF keep-out zone, ESD headers & Gerbers."},
                {"id": "benchtwin", "label": "BenchTwin + Ground Parser", "layer": "Verification", "detail": "BenchTwin 3D circuit model & Python CRC-16 frame decoder tests."},
            ],
            "links": [
                {"from": "imu_tof", "to": "esp32", "bus": "I2C 400 kHz"},
                {"from": "analog_rpm", "to": "esp32", "bus": "GPIO ISR + ADC1"},
                {"from": "esp32", "to": "lora", "bus": "VSPI 10 MHz + DIO0"},
                {"from": "pcb", "to": "esp32", "bus": "3.3V Regulated Rail"},
                {"from": "lora", "to": "benchtwin", "bus": "CRC-16 RF Frame"},
            ],
        },
        hardware_spec={
            "has_hardware": True,
            "mcu": "ESP32-WROOM-32E (Dual-Core Xtensa LX6 @ 240 MHz)",
            "sensors": ["MPU6050 6-DoF IMU", "VL53L0X Time-of-Flight (2m)", "A3144 Hall RPM", "NTC 10kΩ Thermistor", "Voltage Divider + Shunt Sense"],
            "comms": "SX1278 LoRa Sub-GHz (SPI, CRC-16 Framed)",
            "pcb_summary": "KiCad 8 custom avionics carrier with 3.3V buck/LDO power tree, RF impedance feed & full Gerber/Drill export.",
            "stl_summary": "Optional 3D-printable vibration-damped M3 mounting tray & LoRa SMA bulkhead bracket.",
            "reference_bom": [
                {"designator": "U1", "part": "ESP32-WROOM-32E", "spec": "Wi-Fi/BLE Dual-Core MCU, 4MB Flash", "qty": 1},
                {"designator": "U2", "part": "SX1278 LoRa Module", "spec": "433 MHz SPI RF Transceiver (+20 dBm)", "qty": 1},
                {"designator": "U3", "part": "MPU6050", "spec": "6-Axis Gyro + Accelerometer (QFN-24)", "qty": 1},
                {"designator": "U4", "part": "VL53L0X", "spec": "I2C Time-of-Flight Laser Ranging", "qty": 1},
                {"designator": "U5", "part": "AMS1117-3.3 / Buck", "spec": "5V-to-3.3V Low-Noise Regulator", "qty": 1},
                {"designator": "U6", "part": "A3144 / Hall Sensor", "spec": "Rotor RPM Magnetic Pickup", "qty": 1},
            ],
        },
        default_local_launch={
            "mode_label": "PlatformIO Firmware Build & Telemetry Decoder Tests",
            "commands": [
                "cd 04-FLIGHTCORE",
                "cd firmware && pio run",
                "pytest -q",
            ],
            "default_endpoints": ["Serial UART @ 115200 baud", "LoRa CRC-16 Frame Test Harness"],
        },
    ),
    ProjectBlueprint(
        id="roversar",
        code="SYS-05",
        folder="05-ROVERSAR",
        name="RoverSAR",
        tagline="Autonomous Search & Rescue Differential-Drive Ground Robot, STL CAD & Nav Simulator",
        category="Embedded & Hardware",
        domain_badge="Autonomous Robotics",
        target_repo_name="roversar-autonomous-robot",
        problem_statement=(
            "Disaster-zone indoor reconnaissance requires a compact differential-drive rover with "
            "hardware-enforced failsafes (comm-loss stop & E-STOP), closed-loop wheel odometry, "
            "reproducible 3D-printable chassis mechanics, and a paired kinematics simulator."
        ),
        solution_summary=(
            "Integrated robotics stack combining ESP32 PID differential-drive firmware (encoder feedback, "
            "MPU6050, VL53L0X, 500ms comm-loss failsafe), Python/FastAPI navigation simulator + web "
            "control HUD, OpenSCAD/STL 3D printable chassis, KiCad carrier PCB, and BenchTwin export."
        ),
        key_highlights=[
            "ESP32 closed-loop wheel encoder PID + 500ms comm-loss & E-STOP safety latch",
            "Python differential-drive kinematics simulator with WebSocket control dashboard",
            "Parametric OpenSCAD & 3D-printable STL rover chassis + sensor mounts",
            "KiCad motor/sensor carrier schematic, BOM & BenchTwin circuit model",
        ],
        core_tech_stack=[
            "ESP32 (PlatformIO C++)",
            "Python 3.12",
            "FastAPI / WebSockets",
            "OpenSCAD / STL CAD",
            "KiCad 8",
            "React / Web HUD",
            "BenchTwin 3D",
        ],
        architecture={
            "summary": "Dual-environment robotics architecture coupling an ESP32 hardware safety/PID loop with a WebSocket kinematics simulator and parametric STL chassis.",
            "nodes": [
                {"id": "cmd", "label": "Web Dashboard / Nav Planner", "layer": "High-Level Control", "detail": "Sends twist commands (v, ω) and visualizes lidar/odometry pose over WebSocket."},
                {"id": "sim", "label": "Python Diff-Drive Simulator", "layer": "SIL Twin", "detail": "Simulates unicycle kinematics, obstacle rays & encoder ticks for dry-run tests."},
                {"id": "failsafe", "label": "500ms Watchdog & E-STOP", "layer": "Safety Core", "detail": "Zeros PWM H-bridge outputs immediately upon command timeout or E-STOP trigger."},
                {"id": "pid", "label": "ESP32 Dual-Wheel PID Loop", "layer": "Embedded Control", "detail": "Reads quadrature Hall encoders + MPU6050 yaw to track velocity setpoints."},
                {"id": "drive", "label": "Dual H-Bridge + VL53L0X", "layer": "Actuation / Sense", "detail": "Drives geared DC motors and reads front laser range obstacle clearance."},
                {"id": "mech", "label": "OpenSCAD / STL + KiCad PCB", "layer": "Physical CAD", "detail": "3D-printable modular chassis plates, motor brackets & custom power/logic PCB."},
            ],
            "links": [
                {"from": "cmd", "to": "sim", "bus": "WebSocket Twist (v, ω)"},
                {"from": "cmd", "to": "failsafe", "bus": "Heartbeat + E-STOP"},
                {"from": "failsafe", "to": "pid", "bus": "Armed Velocity Setpoint"},
                {"from": "pid", "to": "drive", "bus": "20 kHz PWM + Encoder ISR"},
                {"from": "mech", "to": "drive", "bus": "Chassis Mounts + Motor Bus"},
            ],
        },
        hardware_spec={
            "has_hardware": True,
            "mcu": "ESP32-WROOM-32 (Dual-Core + Hardware PCNT Quadrature Counters)",
            "sensors": ["Dual Quadrature Wheel Encoders", "VL53L0X Front Obstacle ToF", "MPU6050 6-DoF Odometry IMU", "Hardware E-STOP Switch"],
            "comms": "Wi-Fi WebSocket Telemetry + UART Bridge",
            "pcb_summary": "KiCad 8 rover carrier board separating high-current motor power rails from regulated 3.3V ESP32 logic.",
            "stl_summary": "OpenSCAD-generated STL chassis deck, DC motor clamp mounts, caster housing & VL53L0X front bumper.",
            "reference_bom": [
                {"designator": "U1", "part": "ESP32 DevKit / WROOM", "spec": "Main Kinematics & PID Controller", "qty": 1},
                {"designator": "U2", "part": "TB6612FNG / L298N", "spec": "Dual H-Bridge Motor Driver", "qty": 1},
                {"designator": "M1-M2", "part": "JGA25-370 Encoder Motor", "spec": "12V Geared DC + Quadrature Hall", "qty": 2},
                {"designator": "U3", "part": "VL53L0X", "spec": "Front Time-of-Flight Obstacle Sensor", "qty": 1},
                {"designator": "U4", "part": "MPU6050", "spec": "6-DoF Heading Stabilization IMU", "qty": 1},
                {"designator": "SW1", "part": "NC E-STOP Latch", "spec": "Hardware Safety Interlock", "qty": 1},
            ],
        },
        default_local_launch={
            "mode_label": "Nav Simulator + Web HUD + PlatformIO",
            "commands": [
                "cd 05-ROVERSAR",
                "uvicorn backend.main:app --reload --port 8005",
                "cd dashboard && npm run dev",
                "cd firmware && pio run",
            ],
            "default_endpoints": ["http://127.0.0.1:8005", "http://127.0.0.1:8005/docs"],
        },
    ),
    ProjectBlueprint(
        id="cellguard",
        code="SYS-06",
        folder="06-CELLGUARD",
        name="CellGuard",
        tagline="Intelligent 21700 Li-Ion Battery Monitor, Thermal Runaway Guard & SoC/SoH Analytics",
        category="Embedded & Hardware",
        domain_badge="Power / BMS Hardware",
        target_repo_name="cellguard-battery-monitor",
        problem_statement=(
            "High-rate 4S/6S 21700 UAV battery packs experience voltage sag, capacity fade (SoH), "
            "internal DC resistance (R_dc) rise, and dangerous thermal runaway transients (dT/dt) "
            "that coarse voltage-only fuel gauges fail to predict."
        ),
        solution_summary=(
            "Precision 4S/6S 21700 pack monitor pairing an ESP32 + INA226 16-bit Kelvin-shunt current/bus "
            "monitor + multi-point NTC dT/dt thermal watchdog + Coulomb/OCV SoC/SoH/R_dc estimation "
            "with NVS calibration, KiCad 8 2oz-copper Kelvin PCB, Safety Guide, and FastAPI analytics."
        ),
        key_highlights=[
            "INA226 16-bit Kelvin-sense shunt (2 mΩ) + multi-NTC dT/dt thermal runaway guard",
            "Hybrid Coulomb Counting + OCV lookup SoC, SoH & DC Internal Resistance (R_dc)",
            "KiCad 8 Kelvin-sense PCB layout, 2oz copper thermal reliefs, Gerbers & Safety Guide",
            "ESP32 NVS calibration storage + FastAPI discharge telemetry analytics dashboard",
        ],
        core_tech_stack=[
            "ESP32 (PlatformIO C++)",
            "INA226 16-bit Sense",
            "NTC Thermistor Array",
            "KiCad 8 (Kelvin PCB)",
            "FastAPI",
            "Python Analytics",
            "BenchTwin 3D",
        ],
        architecture={
            "summary": "Precision Kelvin-shunt acquisition, hybrid OCV/Coulomb state estimation, dT/dt thermal protection, and FastAPI lifecycle analytics.",
            "nodes": [
                {"id": "pack", "label": "4S / 6S 21700 Li-Ion Pack", "layer": "Energy Stage", "detail": "Molicel/Samsung 21700 pack wired through 2 mΩ 4-terminal Kelvin shunt."},
                {"id": "ina_ntc", "label": "INA226 + Multi-NTC Front-End", "layer": "Precision Sense", "detail": "16-bit ADC measures shunt µV & bus V up to 36V; ADC samples cell NTC probes."},
                {"id": "estimator", "label": "Coulomb + OCV + R_dc Estimator", "layer": "ESP32 Algorithm", "detail": "Tracks net mAh integration, step-load ΔV/ΔI impedance & rest OCV drift."},
                {"id": "thermal", "label": "dT/dt Thermal Runaway Guard", "layer": "Safety Watchdog", "detail": "Triggers fault latch if T > 60°C or thermal slope exceeds safe °C/min."},
                {"id": "pcb", "label": "KiCad 8 Kelvin-Shunt PCB", "layer": "Hardware", "detail": "4-wire differential shunt routing, TVS surge protection & XT60/XT30 pads."},
                {"id": "api_ui", "label": "FastAPI BMS Analytics HUD", "layer": "Software Twin", "detail": "Plots real-time discharge curves, R_dc aging trends & cycle health logs."},
            ],
            "links": [
                {"from": "pack", "to": "ina_ntc", "bus": "4-Wire Kelvin Shunt + Cell Temp"},
                {"from": "ina_ntc", "to": "estimator", "bus": "I2C 400 kHz + 12-bit ADC"},
                {"from": "ina_ntc", "to": "thermal", "bus": "NTC Steinhart-Hart °C"},
                {"from": "estimator", "to": "api_ui", "bus": "JSON/Serial Telemetry"},
                {"from": "pcb", "to": "pack", "bus": "High-Current XT60 Path"},
            ],
        },
        hardware_spec={
            "has_hardware": True,
            "mcu": "ESP32-WROOM-32E (with NVS Flash Calibration Storage)",
            "sensors": ["TI INA226 16-bit Current/Voltage Monitor", "2 mΩ 4-Terminal Kelvin Shunt (3W)", "3x 10kΩ B=3950 NTC Cell Probes"],
            "comms": "I2C Sensor Bus + Wi-Fi/UART JSON Telemetry",
            "pcb_summary": "KiCad 8 high-current Kelvin-sense BMS monitor PCB with 2oz copper pours, isolated analog ground return & Gerbers.",
            "stl_summary": "Ventilated 21700 sensor carrier housing & XT60 strain-relief shroud.",
            "reference_bom": [
                {"designator": "U1", "part": "ESP32-WROOM-32E", "spec": "Telemetry, SoC/SoH & NVS Calibration MCU", "qty": 1},
                {"designator": "U2", "part": "INA226AIDGSR", "spec": "36V, 16-Bit Bidirectional I2C Current/Power Monitor", "qty": 1},
                {"designator": "R_SHUNT", "part": "WSL2512 2mΩ 1%", "spec": "4-Terminal Kelvin Current Sense Resistor (3W)", "qty": 1},
                {"designator": "TH1-TH3", "part": "NTC 10kΩ B=3950", "spec": "Cell Surface Thermal Runaway Probes", "qty": 3},
                {"designator": "U3", "part": "LM2596 / TPS5430", "spec": "Wide-Input 36V->5V/3.3V Buck Converter", "qty": 1},
                {"designator": "J1-J2", "part": "Amass XT60PW", "spec": "PCB-Mount High-Current Pack Connectors", "qty": 2},
            ],
        },
        default_local_launch={
            "mode_label": "BMS Analytics Dashboard + PlatformIO Firmware",
            "commands": [
                "cd 06-CELLGUARD",
                "uvicorn backend.main:app --reload --port 8006",
                "cd dashboard && npm run dev",
                "cd firmware && pio run",
            ],
            "default_endpoints": ["http://127.0.0.1:8006", "http://127.0.0.1:8006/docs"],
        },
    ),
]


def parse_markdown_table(md_text: str) -> list[dict[str, str]]:
    """Parse the first GitHub-flavored markdown table in text into row dicts."""
    lines = [ln.strip() for ln in md_text.splitlines() if ln.strip().startswith("|")]
    if len(lines) < 3:
        return []
    headers = [h.strip().strip("*") for h in lines[0].strip("|").split("|")]
    rows: list[dict[str, str]] = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != len(headers):
            continue
        row = {headers[i]: cells[i].replace("`", "").strip("* ") for i in range(len(headers))}
        rows.append(row)
    return rows


def safe_int(val: str | None, default: int = 0) -> int:
    if not val:
        return default
    m = re.search(r"\d+", val)
    return int(m.group(0)) if m else default


def inspect_git(project_dir: Path) -> dict[str, Any]:
    """Read local git repository initialization, branch, and short HEAD hash."""
    git_dir = project_dir / ".git"
    if not git_dir.exists():
        return {"git_initialized": False, "branch": "main", "latest_commit": None}
    try:
        branch_res = subprocess.run(
            ["git", "-C", str(project_dir), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        hash_res = subprocess.run(
            ["git", "-C", str(project_dir), "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        branch = branch_res.stdout.strip() if branch_res.returncode == 0 else "main"
        commit = hash_res.stdout.strip() if hash_res.returncode == 0 else None
        return {
            "git_initialized": True,
            "branch": branch or "main",
            "latest_commit": commit or None,
        }
    except (OSError, subprocess.SubprocessError):
        return {"git_initialized": True, "branch": "main", "latest_commit": None}


def count_tests_in_file(path: Path) -> int:
    """Statically count test cases inside Python, TypeScript, or C++ test files."""
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return 0
    suffix = path.suffix.lower()
    if suffix == ".py":
        return len(re.findall(r"^\s*(?:async\s+)?def\s+test_", text, flags=re.MULTILINE))
    if suffix in {".ts", ".tsx", ".js", ".jsx"}:
        return len(re.findall(r"\b(?:it|test)\s*\(", text))
    if suffix in {".cpp", ".c", ".cc"}:
        gtest_count = len(re.findall(r"\bTEST(?:_F)?\s*\(", text))
        if gtest_count > 0:
            return gtest_count
        unity_run = len(re.findall(r"\bRUN_TEST\s*\(", text))
        if unity_run > 0:
            return unity_run
        return len(re.findall(r"^\s*void\s+test_", text, flags=re.MULTILINE))
    return 0


def parse_bom_file(bom_path: Path) -> list[dict[str, Any]]:
    """Parse real BOM items from CSV, JSON, or Markdown table files if present."""
    items: list[dict[str, Any]] = []
    suffix = bom_path.suffix.lower()
    try:
        raw = bom_path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return items

    if suffix == ".csv":
        reader = csv.DictReader(raw.splitlines())
        for row in reader:
            norm = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}
            part = norm.get("part") or norm.get("value") or norm.get("component") or norm.get("name") or ""
            designator = norm.get("designator") or norm.get("ref") or norm.get("reference") or "-"
            spec = norm.get("spec") or norm.get("description") or norm.get("footprint") or norm.get("mpn") or ""
            qty = safe_int(norm.get("qty") or norm.get("quantity"), 1)
            if part:
                items.append({"designator": designator, "part": part, "spec": spec, "qty": qty})
    elif suffix == ".json":
        try:
            loaded = json.loads(raw)
            seq = loaded if isinstance(loaded, list) else loaded.get("items", [])
            for entry in seq:
                if isinstance(entry, dict) and (entry.get("part") or entry.get("name")):
                    items.append(
                        {
                            "designator": str(entry.get("designator", entry.get("ref", "-"))),
                            "part": str(entry.get("part", entry.get("name", ""))),
                            "spec": str(entry.get("spec", entry.get("description", ""))),
                            "qty": int(entry.get("qty", entry.get("quantity", 1))),
                        }
                    )
        except (ValueError, TypeError):
            pass
    elif suffix == ".md":
        for row in parse_markdown_table(raw):
            lower = {k.lower(): v for k, v in row.items()}
            part = lower.get("part") or lower.get("component") or lower.get("item") or ""
            if part:
                items.append(
                    {
                        "designator": lower.get("designator") or lower.get("ref") or "-",
                        "part": part,
                        "spec": lower.get("spec") or lower.get("description") or lower.get("notes") or "",
                        "qty": safe_int(lower.get("qty") or lower.get("quantity"), 1),
                    }
                )
    return items[:25]


def detect_technologies_from_disk(project_dir: Path, files: list[Path]) -> list[str]:
    """Detect frameworks and hardware ecosystems directly from manifest files."""
    detected: list[str] = []
    rel_names = {f.name.lower() for f in files}
    for f in files:
        lname = f.name.lower()
        if lname in {"requirements.txt", "pyproject.toml"}:
            txt = f.read_text(encoding="utf-8", errors="ignore").lower()
            for pkg, label in [
                ("fastapi", "FastAPI"),
                ("sqlalchemy", "SQLAlchemy"),
                ("numpy", "NumPy"),
                ("scipy", "SciPy"),
                ("opencv", "OpenCV"),
                ("onnxruntime", "ONNX Runtime"),
                ("torch", "PyTorch"),
                ("pydantic", "Pydantic"),
                ("pytest", "pytest"),
            ]:
                if pkg in txt and label not in detected:
                    detected.append(label)
        elif lname == "package.json":
            try:
                pkg_json = json.loads(f.read_text(encoding="utf-8", errors="ignore"))
                deps = {**pkg_json.get("dependencies", {}), **pkg_json.get("devDependencies", {})}
                for key, label in [
                    ("react", "React"),
                    ("typescript", "TypeScript"),
                    ("vite", "Vite"),
                    ("three", "Three.js"),
                    ("plotly.js", "Plotly"),
                ]:
                    if any(key in d.lower() for d in deps) and label not in detected:
                        detected.append(label)
            except (OSError, ValueError):
                pass
        elif lname == "platformio.ini":
            if "PlatformIO" not in detected:
                detected.append("PlatformIO")
            txt = f.read_text(encoding="utf-8", errors="ignore").lower()
            if "esp32" in txt and "ESP32" not in detected:
                detected.append("ESP32")

    if any(n.endswith(".kicad_sch") or n.endswith(".kicad_pcb") for n in rel_names):
        detected.append("KiCad 8")
    if any(n.endswith(".stl") or n.endswith(".scad") for n in rel_names):
        detected.append("OpenSCAD / STL")
    return detected


def extract_readme_excerpt(project_dir: Path) -> str | None:
    """Extract a concise non-heading summary paragraph from README.md if present."""
    readme = project_dir / "README.md"
    if not readme.exists():
        return None
    try:
        lines = readme.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return None
    para: list[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            if para:
                break
            continue
        if s.startswith("#") or s.startswith("|") or s.startswith("```") or s.startswith("[!"):
            continue
        para.append(s.lstrip("> "))
    excerpt = " ".join(para).strip()
    return excerpt[:320] + ("..." if len(excerpt) > 320 else "") if excerpt else None


def scan_project_directory(project_dir: Path) -> dict[str, Any]:
    """Walk a project workspace and summarize real code, tests, CAD, PCB & BOM files."""
    if not project_dir.exists():
        return {
            "exists": False,
            "file_count": 0,
            "key_files": [],
            "test_files": [],
            "detected_test_cases": 0,
            "kicad_files": [],
            "gerber_files": [],
            "stl_files": [],
            "bom_items": [],
            "bom_source": "hardware_spec",
            "benchtwin_files": [],
            "detected_tech": [],
            "readme_excerpt": None,
            "git": {"git_initialized": False, "branch": "main", "latest_commit": None},
        }

    all_files: list[Path] = []
    for p in project_dir.rglob("*"):
        if any(part in IGNORED_DIRS for part in p.parts):
            continue
        if p.is_file():
            all_files.append(p)

    rel_paths = sorted(str(p.relative_to(project_dir)).replace("\\", "/") for p in all_files)

    test_files: list[str] = []
    detected_test_cases = 0
    kicad_files: list[str] = []
    gerber_files: list[str] = []
    stl_files: list[str] = []
    benchtwin_files: list[str] = []
    parsed_bom: list[dict[str, Any]] = []

    for p in all_files:
        rel = str(p.relative_to(project_dir)).replace("\\", "/")
        lname = p.name.lower()
        lsuf = p.suffix.lower()

        is_test = (
            lname.startswith("test_") and lsuf in {".py", ".cpp", ".c"}
        ) or lname.endswith("_test.py") or ".test." in lname
        if is_test:
            test_files.append(rel)
            detected_test_cases += count_tests_in_file(p)

        if lsuf in {".kicad_sch", ".kicad_pcb", ".kicad_pro"}:
            kicad_files.append(rel)
        if lsuf in {".gbr", ".drl", ".gtl", ".gbl", ".gts", ".gbs", ".gto", ".gbo"} or "gerber" in rel.lower():
            gerber_files.append(rel)
        if lsuf in {".stl", ".scad", ".step", ".stp"}:
            stl_files.append(rel)
        if "benchtwin" in rel.lower():
            benchtwin_files.append(rel)
        if "bom" in lname and lsuf in {".csv", ".json", ".md"} and not parsed_bom:
            parsed_bom = parse_bom_file(p)

    return {
        "exists": True,
        "file_count": len(all_files),
        "key_files": rel_paths[:28],
        "test_files": sorted(test_files),
        "detected_test_cases": detected_test_cases,
        "kicad_files": sorted(kicad_files),
        "gerber_files": sorted(gerber_files),
        "stl_files": sorted(stl_files),
        "bom_items": parsed_bom,
        "bom_source": "parsed_workspace_bom" if parsed_bom else "hardware_spec",
        "benchtwin_files": sorted(benchtwin_files),
        "detected_tech": detect_technologies_from_disk(project_dir, all_files),
        "readme_excerpt": extract_readme_excerpt(project_dir),
        "git": inspect_git(project_dir),
    }


def extract_real_remote_url(raw_cell: str) -> str | None:
    """Return an explicit https://github.com/... URL only if verified present (never fabricate)."""
    m = re.search(r"https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", raw_cell or "")
    return m.group(0) if m else None


def build_portfolio_data(portfolio_root: Path) -> dict[str, Any]:
    """Assemble synchronized portfolio JSON payload from governance docs and sibling folders."""
    mgmt_dir = portfolio_root / "00-PORTFOLIO-MANAGEMENT"
    status_path = mgmt_dir / "PROJECT-STATUS.md"
    repos_path = mgmt_dir / "github-repositories.md"

    status_rows: dict[str, dict[str, str]] = {}
    if status_path.exists():
        for row in parse_markdown_table(status_path.read_text(encoding="utf-8", errors="ignore")):
            proj_key = row.get("Project", "").strip()
            if proj_key:
                status_rows[proj_key] = row

    repo_rows: dict[str, dict[str, str]] = {}
    if repos_path.exists():
        for row in parse_markdown_table(repos_path.read_text(encoding="utf-8", errors="ignore")):
            folder_key = row.get("Project Folder", "").strip()
            if folder_key:
                repo_rows[folder_key] = row

    projects_payload: list[dict[str, Any]] = []
    total_disk_files = 0
    total_tests_reported = 0
    total_detected_tests = 0
    verified_count = 0
    active_build_count = 0
    initializing_count = 0

    for bp in BLUEPRINTS:
        proj_dir = portfolio_root / bp.folder
        scan = scan_project_directory(proj_dir)
        st = status_rows.get(bp.folder, {})
        rp = repo_rows.get(bp.folder, {})

        status_passed = safe_int(st.get("Tests Passed"), 0)
        status_failed = safe_int(st.get("Tests Failed"), 0)
        detected_cases = scan["detected_test_cases"]
        file_count = scan["file_count"]

        if file_count == 0:
            workspace_state = "initializing"
            initializing_count += 1
        elif (status_passed > 0 or detected_cases > 0) and status_failed == 0 and file_count >= 5:
            workspace_state = "verified"
            verified_count += 1
        else:
            workspace_state = "active_build"
            active_build_count += 1

        total_disk_files += file_count
        total_tests_reported += status_passed
        total_detected_tests += detected_cases

        remote_url = extract_real_remote_url(rp.get("Remote GitHub URL", "")) or extract_real_remote_url(
            st.get("GitHub Repo URL", "")
        )
        push_status = rp.get("Push Status") or ("Remote pushed" if remote_url else "Local only (pending gh auth)")
        git_commit = scan["git"]["latest_commit"]
        if not git_commit:
            recorded = st.get("Latest Commit", "")
            if recorded and "pending" not in recorded.lower() and recorded != "—":
                git_commit = recorded

        hardware_block = dict(bp.hardware_spec)
        if hardware_block.get("has_hardware"):
            hardware_block["bom_items"] = (
                scan["bom_items"] if scan["bom_items"] else hardware_block.pop("reference_bom", [])
            )
            hardware_block["bom_source"] = scan["bom_source"]
            hardware_block["kicad_files_detected"] = scan["kicad_files"]
            hardware_block["gerber_files_detected"] = scan["gerber_files"]
            hardware_block["stl_files_detected"] = scan["stl_files"]
            hardware_block["benchtwin_files_detected"] = scan["benchtwin_files"]
            hardware_block["benchtwin_status"] = st.get("BenchTwin Status & Exports", "Pending verification")
        else:
            hardware_block["bom_items"] = []
            hardware_block["bom_source"] = "none"
            hardware_block["kicad_files_detected"] = []
            hardware_block["gerber_files_detected"] = []
            hardware_block["stl_files_detected"] = []
            hardware_block["benchtwin_files_detected"] = []
            hardware_block["benchtwin_status"] = "N/A (Software)"

        merged_tech = list(dict.fromkeys(bp.core_tech_stack + scan["detected_tech"]))

        projects_payload.append(
            {
                "id": bp.id,
                "code": bp.code,
                "folder": bp.folder,
                "name": bp.name,
                "tagline": bp.tagline,
                "category": bp.category,
                "domain_badge": bp.domain_badge,
                "problem_statement": bp.problem_statement,
                "solution_summary": scan["readme_excerpt"] or bp.solution_summary,
                "key_highlights": bp.key_highlights,
                "architecture": bp.architecture,
                "tech_stack": {
                    "core": merged_tech,
                    "detected_from_disk": scan["detected_tech"],
                },
                "hardware": hardware_block,
                "repo": {
                    "target_repo_name": rp.get("Target Repository Name") or bp.target_repo_name,
                    "branch": scan["git"]["branch"] or rp.get("Branch") or "main",
                    "git_initialized": scan["git"]["git_initialized"],
                    "latest_commit": git_commit,
                    "remote_url": remote_url,
                    "push_status": push_status,
                },
                "local_launch": bp.default_local_launch,
                "verification": {
                    "stage": st.get("Stage", "Dispatched"),
                    "assigned_agent": st.get("Assigned Agent", "Unassigned"),
                    "workspace_state": workspace_state,
                    "disk_file_count": file_count,
                    "key_files": scan["key_files"],
                    "test_files": scan["test_files"],
                    "detected_test_cases": detected_cases,
                    "status_tests_passed": status_passed,
                    "status_tests_failed": status_failed,
                    "blockers": st.get("Blockers", "None"),
                },
            }
        )

    return {
        "schema_version": "1.0.0",
        "generated_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "portfolio_owner": "Jagjyot",
        "portfolio_meta": {
            "total_projects": len(projects_payload),
            "verified_count": verified_count,
            "active_build_count": active_build_count,
            "initializing_count": initializing_count,
            "total_disk_files": total_disk_files,
            "total_tests_reported": total_tests_reported,
            "total_detected_test_cases": total_detected_tests,
            "software_systems_count": sum(1 for p in projects_payload if p["category"] == "Software & AI"),
            "simulation_systems_count": sum(1 for p in projects_payload if p["category"] == "Simulation"),
            "hardware_systems_count": sum(1 for p in projects_payload if p["category"] == "Embedded & Hardware"),
        },
        "projects": projects_payload,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Synchronize Jagjyot Engineering Portfolio metadata JSON.")
    parser.add_argument(
        "--portfolio-root",
        type=Path,
        default=Path(__file__).resolve().parents[2],
        help="Path to ENGINEERING-PORTFOLIO root directory.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src" / "data" / "projects.json",
        help="Output path for generated projects.json.",
    )
    args = parser.parse_args()

    payload = build_portfolio_data(args.portfolio_root.resolve())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    meta = payload["portfolio_meta"]
    print(
        f"[sync_portfolio_data] Synced {meta['total_projects']} systems -> {args.output} "
        f"(files={meta['total_disk_files']}, detected_tests={meta['total_detected_test_cases']}, "
        f"verified={meta['verified_count']}, active={meta['active_build_count']}, "
        f"initializing={meta['initializing_count']})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
