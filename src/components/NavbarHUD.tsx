import React from 'react';
import { Search, ShieldCheck, Cpu } from 'lucide-react';
import type { PortfolioMeta } from '../types/portfolio';

interface NavbarHUDProps {
  meta: PortfolioMeta;
  generatedAt: string;
  onFocusSearch: () => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({ meta, generatedAt, onFocusSearch }) => {
  const shortTime = generatedAt.replace('T', ' ').replace('Z', ' UTC');

  return (
    <header className="navbar-hud">
      <div className="container navbar-inner">
        <a href="#top" className="brand-mark" aria-label="Jagjyot Engineering Portfolio Home">
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="32" height="32" rx="7" stroke="#00F0FF" strokeOpacity="0.45" strokeWidth="1.5" />
            <circle cx="18" cy="18" r="9" stroke="#00F0FF" strokeWidth="1.4" strokeDasharray="3 2" />
            <circle cx="18" cy="18" r="2.8" fill="#FFB800" />
            <path d="M18 4V10M18 26V32M4 18H10M26 18H32" stroke="#00F0FF" strokeWidth="1.4" />
          </svg>
          <div>
            <div className="brand-title">JAGJYOT // SYS.ENG</div>
            <div className="brand-sub">AEROSPACE · ROBOTICS · EMBEDDED</div>
          </div>
        </a>

        <nav className="nav-links" aria-label="Primary sections">
          <a href="#systems" className="nav-link">
            Systems ({meta.total_projects})
          </a>
          <a href="#labs" className="nav-link">
            Telemetry Labs
          </a>
          <a href="#hardware" className="nav-link">
            Hardware &amp; CAD
          </a>
          <a href="#registry" className="nav-link">
            Repo Registry
          </a>
        </nav>

        <div className="nav-telemetry">
          <span className="status-pill emerald" title={`Last workspace sync: ${shortTime}`}>
            <span className="pulse-dot" />
            SYNC: {meta.total_disk_files} FILES
          </span>
          <span className="status-pill cyan" title="Verified hardware & software architecture">
            <Cpu size={13} />
            {meta.hardware_systems_count} HW · {meta.software_systems_count + meta.simulation_systems_count} SW
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onFocusSearch}
            title="Filter systems (Press /)"
          >
            <Search size={13} />
            <span className="mono">/</span>
          </button>
          <a href="#registry" className="status-pill amber" title="Verification Matrix">
            <ShieldCheck size={13} />
            QA MATRIX
          </a>
        </div>
      </div>
    </header>
  );
};
