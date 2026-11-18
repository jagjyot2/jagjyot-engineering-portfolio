import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BatteryCharging, Activity, Compass, Crosshair } from 'lucide-react';
import {
  computeDischargeCurve,
  computeFlightSpectralProfile,
  computeSarAndRoverTelemetry,
  simulateSwarmMission,
  type FlightScenario,
  type PlannerType,
} from '../utils/simulationMath';

type LabMode = 'battery' | 'aerolens' | 'swarm' | 'sar_rover';

export const InteractiveLabs: React.FC = () => {
  const [labMode, setLabMode] = useState<LabMode>('battery');

  // Lab 1: CellGuard / FlightCore 21700 Battery Controls
  const [seriesCells, setSeriesCells] = useState<4 | 6>(6);
  const [loadCurrentA, setLoadCurrentA] = useState<number>(18);
  const [ambientTempC, setAmbientTempC] = useState<number>(22);
  const [sohPct, setSohPct] = useState<number>(96);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Lab 2: AeroLens Spectral FFT Controls
  const [scenario, setScenario] = useState<FlightScenario>('bearing_harmonic');
  const [noiseAmp, setNoiseAmp] = useState<number>(0.18);

  // Lab 3: SwarmForge Planner Controls
  const [planner, setPlanner] = useState<PlannerType>('A_STAR');
  const [obstacleDensity, setObstacleDensity] = useState<'low' | 'high'>('high');
  const swarmCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lab 4: SARVision + RoverSAR Controls
  const [altitudeM, setAltitudeM] = useState<number>(65);
  const [focalMm, setFocalMm] = useState<number>(8.8);
  const [gimbalPitchDeg, setGimbalPitchDeg] = useState<number>(28);
  const [leftWheelMps, setLeftWheelMps] = useState<number>(0.85);
  const [rightWheelMps, setRightWheelMps] = useState<number>(0.55);

  const batteryRes = useMemo(
    () => computeDischargeCurve({ seriesCells, loadCurrentA, ambientTempC, sohPct }),
    [seriesCells, loadCurrentA, ambientTempC, sohPct]
  );

  const flightRes = useMemo(
    () => computeFlightSpectralProfile(scenario, noiseAmp),
    [scenario, noiseAmp]
  );

  const swarmRes = useMemo(
    () => simulateSwarmMission(planner, obstacleDensity),
    [planner, obstacleDensity]
  );

  const sarRoverRes = useMemo(
    () =>
      computeSarAndRoverTelemetry({
        altitudeM,
        focalMm,
        gimbalPitchDeg,
        leftWheelMps,
        rightWheelMps,
      }),
    [altitudeM, focalMm, gimbalPitchDeg, leftWheelMps, rightWheelMps]
  );

  // Draw SwarmForge Canvas 2D trajectory arena
  useEffect(() => {
    if (labMode !== 'swarm') return;
    const canvas = swarmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle coordinate grid
    ctx.fillStyle = '#06080D';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Geofence perimeter
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.35)';
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.setLineDash([]);

    // Target zone
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(435, 125, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Obstacles + safety radii
    for (const obs of swarmRes.obstacles) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.28)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.r + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.24)';
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // UAV Trajectories
    for (const uav of swarmRes.uavPaths) {
      ctx.strokeStyle = uav.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      uav.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      const startPt = uav.points[0];
      const endPt = uav.points[uav.points.length - 1];
      if (startPt) {
        ctx.fillStyle = uav.color;
        ctx.beginPath();
        ctx.arc(startPt.x, startPt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (endPt) {
        ctx.fillStyle = '#07090E';
        ctx.strokeStyle = uav.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [labMode, swarmRes]);

  // SVG coordinate helpers for Battery Lab
  const batW = 620;
  const batH = 240;
  const minPackV = seriesCells * 2.6;
  const maxPackV = seriesCells * 4.25;
  const hoveredBatSample =
    hoverIdx !== null ? batteryRes.samples[hoverIdx] : batteryRes.samples[Math.floor(batteryRes.samples.length / 2)];

  const batPointsLoad = batteryRes.samples
    .map((s, i) => {
      const x = 44 + (i / (batteryRes.samples.length - 1)) * (batW - 70);
      const y = 20 + (1 - (s.loadedPackV - minPackV) / (maxPackV - minPackV)) * (batH - 54);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const batPointsOcv = batteryRes.samples
    .map((s, i) => {
      const ocvPack = s.ocvCellV * seriesCells;
      const x = 44 + (i / (batteryRes.samples.length - 1)) * (batW - 70);
      const y = 20 + (1 - (ocvPack - minPackV) / (maxPackV - minPackV)) * (batH - 54);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section id="labs" className="section-block">
      <div className="container">
        <div className="section-kicker">
          <Activity size={14} /> INTERACTIVE ENGINEERING TELEMETRY BENCH
        </div>
        <h2 className="section-title">Live Physics, Signal &amp; Path-Planning Calculators</h2>
        <p className="section-desc" style={{ marginBottom: 24 }}>
          Real mathematical models derived from the algorithms across CellGuard, AeroLens, SwarmForge,
          SARVision, and RoverSAR — adjust load, harmonics, planners, or camera intrinsics directly in browser.
        </p>

        <div className="hud-panel labs-shell">
          <div className="lab-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'battery'}
              className={`lab-tab ${labMode === 'battery' ? 'active' : ''}`}
              onClick={() => setLabMode('battery')}
            >
              <BatteryCharging size={15} /> CellGuard / FlightCore 21700 Pack
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'aerolens'}
              className={`lab-tab ${labMode === 'aerolens' ? 'active' : ''}`}
              onClick={() => setLabMode('aerolens')}
            >
              <Activity size={15} /> AeroLens IMU FFT &amp; Anomaly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'swarm'}
              className={`lab-tab ${labMode === 'swarm' ? 'active' : ''}`}
              onClick={() => setLabMode('swarm')}
            >
              <Compass size={15} /> SwarmForge A* / RRT* / APF
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={labMode === 'sar_rover'}
              className={`lab-tab ${labMode === 'sar_rover' ? 'active' : ''}`}
              onClick={() => setLabMode('sar_rover')}
            >
              <Crosshair size={15} /> SARVision Geo + Rover Kinematics
            </button>
          </div>

          {labMode === 'battery' && (
            <div className="lab-grid">
              <div className="lab-controls">
                <div className="control-group">
                  <label>
                    <span>PACK TOPOLOGY</span>
                    <span style={{ color: 'var(--amber)' }}>{seriesCells}S1P 21700</span>
                  </label>
                  <div className="control-select-row">
                    <button
                      type="button"
                      className={`mini-toggle ${seriesCells === 4 ? 'active' : ''}`}
                      onClick={() => setSeriesCells(4)}
                    >
                      4S (14.8V)
                    </button>
                    <button
                      type="button"
                      className={`mini-toggle ${seriesCells === 6 ? 'active' : ''}`}
                      onClick={() => setSeriesCells(6)}
                    >
                      6S (22.2V)
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <label>
                    <span>DISCHARGE LOAD</span>
                    <span style={{ color: 'var(--cyan)' }}>{loadCurrentA} A</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    step={1}
                    value={loadCurrentA}
                    onChange={(e) => setLoadCurrentA(Number(e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>
                    <span>AMBIENT TEMP</span>
                    <span style={{ color: 'var(--cyan)' }}>{ambientTempC} °C</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    step={1}
                    value={ambientTempC}
                    onChange={(e) => setAmbientTempC(Number(e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>
                    <span>CELL HEALTH (SoH)</span>
                    <span style={{ color: 'var(--emerald)' }}>{sohPct}%</span>
                  </label>
                  <input
                    type="range"
                    min={72}
                    max={100}
                    step={1}
                    value={sohPct}
                    onChange={(e) => setSohPct(Number(e.target.value))}
                  />
                </div>

                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Computes Kelvin-shunt loaded terminal voltage V_load = N·(OCV(SoC) − I·R_dc(T, SoH)) and I²R
                  thermal slope.
                </div>
              </div>

              <div className="lab-viewport">
                <div className="lab-readouts">
                  <div className="readout-box">
                    <div className="readout-label">PACK R_DC</div>
                    <div className="readout-val">{batteryRes.effectiveRdcMOhm} mΩ</div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">EST RUNTIME</div>
                    <div className="readout-val">{batteryRes.runtimeMinutes} min</div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">PEAK CELL TEMP</div>
                    <div
                      className="readout-val"
                      style={{ color: batteryRes.peakTempC >= 55 ? 'var(--danger)' : 'var(--amber)' }}
                    >
                      {batteryRes.peakTempC} °C
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">USABLE ENERGY</div>
                    <div className="readout-val" style={{ color: 'var(--emerald)' }}>
                      {batteryRes.nominalEnergyWh} Wh
                    </div>
                  </div>
                </div>

                <svg
                  viewBox={`0 0 ${batW} ${batH}`}
                  width="100%"
                  style={{ display: 'block', background: '#05070B', borderRadius: 6, border: '1px solid #1E293B' }}
                  onMouseLeave={() => setHoverIdx(null)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = ((e.clientX - rect.left) / rect.width) * batW;
                    const idx = Math.round(((relX - 44) / (batW - 70)) * (batteryRes.samples.length - 1));
                    if (idx >= 0 && idx < batteryRes.samples.length) setHoverIdx(idx);
                  }}
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = 20 + frac * (batH - 54);
                    const vLabel = (maxPackV - frac * (maxPackV - minPackV)).toFixed(1);
                    return (
                      <g key={frac}>
                        <line x1="44" y1={y} x2={batW - 26} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                        <text x="8" y={y + 3} fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace">
                          {vLabel}V
                        </text>
                      </g>
                    );
                  })}

                  {/* OCV dashed curve */}
                  <polyline fill="none" stroke="#FFB800" strokeWidth="1.6" strokeDasharray="4 3" points={batPointsOcv} />
                  {/* Loaded pack voltage curve */}
                  <polyline fill="none" stroke="#00F0FF" strokeWidth="2.4" points={batPointsLoad} />

                  {/* X-axis SoC labels */}
                  {[100, 75, 50, 25, 0].map((soc, i) => {
                    const x = 44 + (i / 4) * (batW - 70);
                    return (
                      <text
                        key={soc}
                        x={x}
                        y={batH - 10}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {soc}% SoC
                      </text>
                    );
                  })}
                </svg>

                {hoveredBatSample && (
                  <div
                    className="mono"
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>
                      Cursor SoC: <strong style={{ color: 'var(--cyan)' }}>{hoveredBatSample.socPct}%</strong> | OCV/cell:{' '}
                      <strong style={{ color: 'var(--amber)' }}>{hoveredBatSample.ocvCellV}V</strong>
                    </span>
                    <span>
                      Loaded Pack: <strong style={{ color: 'var(--cyan)' }}>{hoveredBatSample.loadedPackV}V</strong> | Power:{' '}
                      <strong>{hoveredBatSample.powerW}W</strong> | Temp: <strong>{hoveredBatSample.tempC}°C</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {labMode === 'aerolens' && (
            <div className="lab-grid">
              <div className="lab-controls">
                <div className="control-group">
                  <label>
                    <span>FLIGHT LOG SCENARIO</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(
                      [
                        ['nominal', 'Nominal Hover (64 Hz)'],
                        ['bearing_harmonic', 'Motor Bearing Harmonics (144/216 Hz)'],
                        ['prop_imbalance', 'Propeller Unbalance (76 Hz)'],
                        ['brownout_drift', 'ESC Voltage Sag + Vibration'],
                      ] as [FlightScenario, string][]
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={`mini-toggle ${scenario === id ? 'active' : ''}`}
                        style={{ textAlign: 'left', padding: '8px 10px' }}
                        onClick={() => setScenario(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>
                    <span>IMU NOISE FLOOR</span>
                    <span style={{ color: 'var(--cyan)' }}>{noiseAmp.toFixed(2)} m/s²</span>
                  </label>
                  <input
                    type="range"
                    min={0.05}
                    max={0.85}
                    step={0.05}
                    value={noiseAmp}
                    onChange={(e) => setNoiseAmp(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="lab-viewport">
                <div className="lab-readouts">
                  <div className="readout-box">
                    <div className="readout-label">STATUS</div>
                    <div
                      className="readout-val"
                      style={{
                        color:
                          flightRes.status === 'CRITICAL'
                            ? 'var(--danger)'
                            : flightRes.status === 'ADVISORY'
                              ? 'var(--amber)'
                              : 'var(--emerald)',
                      }}
                    >
                      {flightRes.status}
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">VIBRATION RMS</div>
                    <div className="readout-val">{flightRes.rmsVibrationG} g</div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">PEAK DFT BIN</div>
                    <div className="readout-val" style={{ color: 'var(--amber)' }}>
                      {flightRes.peakFreqHz} Hz
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">ANOMALY Z-SCORE</div>
                    <div className="readout-val">{flightRes.anomalyZScore} σ</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      TIME DOMAIN // IMU ACCEL-Z (512 Hz)
                    </div>
                    <svg
                      viewBox="0 0 300 175"
                      width="100%"
                      style={{ background: '#05070B', borderRadius: 6, border: '1px solid #1E293B' }}
                    >
                      <line x1="0" y1="88" x2="300" y2="88" stroke="#1E293B" strokeDasharray="3 3" />
                      <polyline
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth="1.6"
                        points={flightRes.timeSamples
                          .map((s, i) => {
                            const x = (i / (flightRes.timeSamples.length - 1)) * 300;
                            const y = 88 - (s.accelZ - 9.81) * 26;
                            return `${x.toFixed(1)},${Math.max(8, Math.min(167, y)).toFixed(1)}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>

                  <div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      SPECTRAL DFT // HANN-WINDOWED SPECTRUM (0–256 Hz)
                    </div>
                    <svg
                      viewBox="0 0 300 175"
                      width="100%"
                      style={{ background: '#05070B', borderRadius: 6, border: '1px solid #1E293B' }}
                    >
                      {flightRes.spectrumBins.map((b, i) => {
                        const x = 6 + (i / flightRes.spectrumBins.length) * 288;
                        const barH = Math.min(148, b.magnitude * 115);
                        const isPeak = b.freqHz === flightRes.peakFreqHz;
                        return (
                          <rect
                            key={b.freqHz}
                            x={x}
                            y={162 - barH}
                            width={3}
                            height={Math.max(2, barH)}
                            fill={isPeak ? '#FFB800' : '#00F0FF'}
                            opacity={isPeak ? 1 : 0.72}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {labMode === 'swarm' && (
            <div className="lab-grid">
              <div className="lab-controls">
                <div className="control-group">
                  <label>
                    <span>3D PATH PLANNER ALGORITHM</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(
                      [
                        ['A_STAR', '3D A* (Optimal Grid)'],
                        ['RRT_STAR', 'RRT* (Sampling + Rewire)'],
                        ['APF', 'APF (Potential Gradient)'],
                      ] as [PlannerType, string][]
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={`mini-toggle ${planner === id ? 'active' : ''}`}
                        style={{ textAlign: 'left', padding: '8px 10px' }}
                        onClick={() => setPlanner(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>
                    <span>OBSTACLE FIELD DENSITY</span>
                  </label>
                  <div className="control-select-row">
                    <button
                      type="button"
                      className={`mini-toggle ${obstacleDensity === 'low' ? 'active' : ''}`}
                      onClick={() => setObstacleDensity('low')}
                    >
                      Sparse (3)
                    </button>
                    <button
                      type="button"
                      className={`mini-toggle ${obstacleDensity === 'high' ? 'active' : ''}`}
                      onClick={() => setObstacleDensity('high')}
                    >
                      Dense (5)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    PLANNER BENCHMARK COMPARISON
                  </div>
                  {swarmRes.benchmarks.map((b) => (
                    <div
                      key={b.planner}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 5,
                        background: b.planner === planner ? 'rgba(0, 240, 255, 0.08)' : 'rgba(12, 17, 27, 0.7)',
                        border: `1px solid ${b.planner === planner ? 'var(--cyan)' : 'var(--border-subtle)'}`,
                        fontSize: '0.74rem',
                      }}
                    >
                      <div className="mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{b.label}</span>
                        <span style={{ color: 'var(--amber)' }}>{b.latencyMs} ms</span>
                      </div>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Path: {b.lengthM}m · Optimality: {b.optimalityPct}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lab-viewport">
                <div className="lab-readouts">
                  <div className="readout-box">
                    <div className="readout-label">AVG PATH LENGTH</div>
                    <div className="readout-val">{swarmRes.pathLengthM} m</div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">MIN CLEARANCE</div>
                    <div className="readout-val" style={{ color: 'var(--emerald)' }}>
                      {swarmRes.minClearanceM} m
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">SOLVER LATENCY</div>
                    <div className="readout-val" style={{ color: 'var(--amber)' }}>
                      {swarmRes.computeLatencyMs} ms
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">PACK REMAINING</div>
                    <div className="readout-val">{swarmRes.energyRemainingPct}%</div>
                  </div>
                </div>

                <canvas
                  ref={swarmCanvasRef}
                  width={480}
                  height={240}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 6,
                    border: '1px solid #1E293B',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          )}

          {labMode === 'sar_rover' && (
            <div className="lab-grid">
              <div className="lab-controls">
                <div className="control-group">
                  <label>
                    <span>UAV ALTITUDE (AGL)</span>
                    <span style={{ color: 'var(--cyan)' }}>{altitudeM} m</span>
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={150}
                    step={5}
                    value={altitudeM}
                    onChange={(e) => setAltitudeM(Number(e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>
                    <span>EXIF FOCAL LENGTH</span>
                    <span style={{ color: 'var(--amber)' }}>{focalMm} mm</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={0.4}
                    value={focalMm}
                    onChange={(e) => setFocalMm(Number(e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>
                    <span>GIMBAL PITCH ANGLE</span>
                    <span style={{ color: 'var(--cyan)' }}>{gimbalPitchDeg}°</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={55}
                    step={1}
                    value={gimbalPitchDeg}
                    onChange={(e) => setGimbalPitchDeg(Number(e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>
                    <span>ROVER LEFT / RIGHT WHEEL</span>
                    <span style={{ color: 'var(--emerald)' }}>
                      {leftWheelMps.toFixed(2)} / {rightWheelMps.toFixed(2)} m/s
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.4}
                    step={0.05}
                    value={leftWheelMps}
                    onChange={(e) => setLeftWheelMps(Number(e.target.value))}
                  />
                  <input
                    type="range"
                    min={0.1}
                    max={1.4}
                    step={0.05}
                    value={rightWheelMps}
                    onChange={(e) => setRightWheelMps(Number(e.target.value))}
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              <div className="lab-viewport">
                <div className="lab-readouts">
                  <div className="readout-box">
                    <div className="readout-label">SARVISION GSD</div>
                    <div className="readout-val">{sarRoverRes.gsdCmPerPx} cm/px</div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">GROUND SWATH</div>
                    <div className="readout-val">
                      {sarRoverRes.swathWidthM}×{sarRoverRes.swathHeightM}m
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">RAYCAST OFFSET</div>
                    <div className="readout-val" style={{ color: 'var(--amber)' }}>
                      {sarRoverRes.targetGroundOffsetM} m
                    </div>
                  </div>
                  <div className="readout-box">
                    <div className="readout-label">ROVER TURN R</div>
                    <div className="readout-val" style={{ color: 'var(--emerald)' }}>
                      {sarRoverRes.roverTurnRadiusM >= 500 ? 'STRAIGHT' : `${sarRoverRes.roverTurnRadiusM} m`}
                    </div>
                  </div>
                </div>

                <svg
                  viewBox="0 0 560 210"
                  width="100%"
                  style={{ background: '#05070B', borderRadius: 6, border: '1px solid #1E293B', display: 'block' }}
                >
                  {/* Ground line */}
                  <line x1="20" y1="175" x2="540" y2="175" stroke="#334155" strokeWidth="1.5" />
                  {/* UAV Icon */}
                  <circle cx="95" cy={175 - Math.min(135, altitudeM * 0.85)} r="7" fill="#00F0FF" />
                  <text
                    x="108"
                    y={178 - Math.min(135, altitudeM * 0.85)}
                    fill="#00F0FF"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    SAR-UAV ({altitudeM}m AGL)
                  </text>
                  {/* Raycast beam */}
                  <line
                    x1="95"
                    y1={175 - Math.min(135, altitudeM * 0.85)}
                    x2="95"
                    y2="175"
                    stroke="#334155"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="95"
                    y1={175 - Math.min(135, altitudeM * 0.85)}
                    x2={95 + Math.min(340, sarRoverRes.targetGroundOffsetM * 2.2)}
                    y2="175"
                    stroke="#FFB800"
                    strokeWidth="2"
                  />
                  <circle
                    cx={95 + Math.min(340, sarRoverRes.targetGroundOffsetM * 2.2)}
                    cy="175"
                    r="6"
                    fill="#FFB800"
                  />
                  <text
                    x={Math.min(395, 95 + sarRoverRes.targetGroundOffsetM * 2.2)}
                    y="196"
                    textAnchor="middle"
                    fill="#FFB800"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ΔLat +{sarRoverRes.deltaLatDeg}° · ΔLon +{sarRoverRes.deltaLonDeg}°
                  </text>

                  {/* Rover velocity info */}
                  <text x="360" y="34" fill="#10B981" fontSize="10" fontFamily="JetBrains Mono, monospace">
                    ROVERSAR LINEAR: {sarRoverRes.roverLinearVelMps} m/s
                  </text>
                  <text x="360" y="52" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                    SLANT RANGE: {sarRoverRes.slantRangeM} m
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
