import React from 'react';
import { Cpu, Box, Layers, ArrowUpRight } from 'lucide-react';
import type { ProjectSystem } from '../types/portfolio';

interface HardwareShowcaseProps {
  projects: ProjectSystem[];
  onSelectProject: (project: ProjectSystem) => void;
}

export const HardwareShowcase: React.FC<HardwareShowcaseProps> = ({ projects, onSelectProject }) => {
  const hardwareProjects = projects.filter((p) => p.hardware.has_hardware);

  return (
    <section id="hardware" className="section-block">
      <div className="container">
        <div className="section-kicker">
          <Cpu size={14} /> EMBEDDED AVIONICS, ROBOTICS &amp; BMS HARDWARE
        </div>
        <h2 className="section-title">KiCad PCBs, 3D STL CAD &amp; Bill of Materials</h2>
        <p className="section-desc" style={{ marginBottom: 24 }}>
          Hardware-software co-design across FlightCore, RoverSAR, and CellGuard: ESP32 PlatformIO
          firmware coupled with KiCad 8 schematics/Gerbers, OpenSCAD/STL mechanics, and BenchTwin packages.
        </p>

        <div className="hardware-grid">
          {hardwareProjects.map((proj) => {
            const hw = proj.hardware;
            return (
              <div key={proj.id} className="hud-panel hardware-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="sys-code">
                    {proj.code} // {proj.folder}
                  </span>
                  <span className="status-pill amber">{hw.bom_items.length} BOM ITEMS</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{proj.name}</h3>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{hw.mcu}</div>
                </div>

                <div className="spec-row">
                  <span className="spec-key">
                    <Layers size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    PCB &amp; GERBER DESIGN
                  </span>
                  <span className="spec-val" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {hw.pcb_summary}
                  </span>
                  <span className="mono" style={{ fontSize: '0.71rem', color: 'var(--cyan)', marginTop: 4 }}>
                    KiCad files: {hw.kicad_files_detected.length} · Gerbers: {hw.gerber_files_detected.length}
                  </span>
                </div>

                <div className="spec-row">
                  <span className="spec-key">
                    <Box size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    3D CAD / STL &amp; BENCH-TWIN
                  </span>
                  <span className="spec-val" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {hw.stl_summary}
                  </span>
                  <span className="mono" style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    STL/SCAD: {hw.stl_files_detected.length} · BenchTwin files: {hw.benchtwin_files_detected.length}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {hw.bom_source === 'parsed_workspace_bom' ? 'Synced workspace BOM' : 'Reference hardware BOM'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectProject(proj)}
                  >
                    View BOM &amp; CAD <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
