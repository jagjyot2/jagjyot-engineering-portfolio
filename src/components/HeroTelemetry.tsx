import React, { useState } from 'react';
import { ArrowDownRight, Terminal, Layers, Radio } from 'lucide-react';
import type { PortfolioMeta, ProjectSystem } from '../types/portfolio';

interface HeroTelemetryProps {
  meta: PortfolioMeta;
  projects: ProjectSystem[];
  onSelectProject: (project: ProjectSystem) => void;
}

const NODE_COORDS: Record<string, { x: number; y: number; angle: number }> = {
  aerolens: { x: 180, y: 54, angle: 0 },
  sarvision: { x: 288, y: 112, angle: 60 },
  swarmforge: { x: 288, y: 228, angle: 120 },
  flightcore: { x: 180, y: 286, angle: 180 },
  roversar: { x: 72, y: 228, angle: 240 },
  cellguard: { x: 72, y: 112, angle: 300 },
};

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({ meta, projects, onSelectProject }) => {
  const [hoveredId, setHoveredId] = useState<string>('flightcore');
  const hoveredProject = projects.find((p) => p.id === hoveredId) ?? projects[0];

  const totalTests = Math.max(meta.total_tests_reported, meta.total_detected_test_cases);

  return (
    <section id="top" className="hero-section">
      <div className="container hero-grid">
        <div>
          <div className="section-kicker">
            <Radio size={14} />
            AUTONOMOUS ENGINEERING SYSTEMS PORTFOLIO · 2026
          </div>
          <h1 className="hero-headline">
            Engineering <span className="accent-cyan">flight, vision, swarm</span> &amp;{' '}
            <span className="accent-amber">embedded hardware</span> from silicon to 3D twin.
          </h1>
          <p className="hero-copy">
            Six production-structured aerospace, computer vision, multi-UAV simulation, ground robotics,
            and Li-Ion BMS systems built by Jagjyot — synchronized directly from local workspace manifests,
            KiCad schematics, OpenSCAD/STL assemblies, and automated test suites.
          </p>

          <div className="hero-cta-row">
            <a href="#systems" className="btn btn-primary">
              Inspect 6 Systems <ArrowDownRight size={16} />
            </a>
            <a href="#labs" className="btn btn-secondary">
              <Terminal size={15} /> Launch Interactive Labs
            </a>
            <a href="#hardware" className="btn btn-secondary">
              <Layers size={15} /> PCB &amp; STL Matrix
            </a>
          </div>

          <div className="telemetry-kpi-strip">
            <div className="kpi-tile">
              <div className="kpi-value">{meta.total_projects}</div>
              <div className="kpi-label">Core Systems</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-value" style={{ color: 'var(--cyan)' }}>
                {meta.total_disk_files}
              </div>
              <div className="kpi-label">Synced Files</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-value" style={{ color: 'var(--amber)' }}>
                {meta.hardware_systems_count}
              </div>
              <div className="kpi-label">KiCad / ESP32</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-value" style={{ color: 'var(--emerald)' }}>
                {totalTests}
              </div>
              <div className="kpi-label">Tracked Tests</div>
            </div>
          </div>
        </div>

        <div className="hud-panel radar-scope-card">
          <div className="radar-header">
            <span className="mono" style={{ color: 'var(--cyan)' }}>
              TELEMETRY CONSTELLATION // CLICK NODE
            </span>
            <span className="mono">
              VERIFIED {meta.verified_count}/{meta.total_projects}
            </span>
          </div>

          <svg
            viewBox="0 0 360 340"
            width="100%"
            height="auto"
            role="img"
            aria-label="Interactive 6-system portfolio constellation scope"
            style={{ display: 'block', maxHeight: 330 }}
          >
            <defs>
              <radialGradient id="scopeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.16" />
                <stop offset="70%" stopColor="#00F0FF" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="180" cy="170" r="145" fill="url(#scopeGlow)" />
            <circle cx="180" cy="170" r="130" stroke="#1E293B" strokeWidth="1" fill="none" />
            <circle cx="180" cy="170" r="92" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" fill="none" />
            <circle cx="180" cy="170" r="50" stroke="#1E293B" strokeWidth="1" fill="none" />
            <line x1="35" y1="170" x2="325" y2="170" stroke="#1E293B" strokeWidth="1" />
            <line x1="180" y1="25" x2="180" y2="315" stroke="#1E293B" strokeWidth="1" />

            {/* Center hub */}
            <circle cx="180" cy="170" r="18" fill="#0B1019" stroke="#00F0FF" strokeWidth="1.5" />
            <text
              x="180"
              y="174"
              textAnchor="middle"
              fill="#00F0FF"
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
            >
              CORE
            </text>

            {/* Constellation links & clickable nodes */}
            {projects.map((proj) => {
              const coord = NODE_COORDS[proj.id] ?? { x: 180, y: 170, angle: 0 };
              const isSelected = hoveredId === proj.id;
              const nodeColor =
                proj.category === 'Embedded & Hardware'
                  ? '#FFB800'
                  : proj.category === 'Simulation'
                    ? '#10B981'
                    : '#00F0FF';

              return (
                <g
                  key={proj.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(proj.id)}
                  onClick={() => onSelectProject(proj)}
                >
                  <line
                    x1="180"
                    y1="170"
                    x2={coord.x}
                    y2={coord.y}
                    stroke={isSelected ? nodeColor : '#334155'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    strokeDasharray={isSelected ? undefined : '3 3'}
                  />
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isSelected ? 22 : 17}
                    fill="#0C111B"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 2.2 : 1.3}
                  />
                  <text
                    x={coord.x}
                    y={coord.y - 2}
                    textAnchor="middle"
                    fill={nodeColor}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    {proj.code}
                  </text>
                  <text
                    x={coord.x}
                    y={coord.y + 9}
                    textAnchor="middle"
                    fill="#E6EDF7"
                    fontSize="7.5"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    {proj.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredProject && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 7,
                background: 'rgba(7, 9, 14, 0.82)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div className="mono" style={{ fontSize: '0.73rem', color: 'var(--amber)' }}>
                  {hoveredProject.code} · {hoveredProject.folder}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {hoveredProject.name} — {hoveredProject.domain_badge}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onSelectProject(hoveredProject)}
              >
                Open Spec
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
