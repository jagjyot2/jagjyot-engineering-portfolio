import React from 'react';
import { ArrowUpRight, Cpu, GitBranch, FolderCode, CheckCircle2, Clock } from 'lucide-react';
import type { ProjectSystem } from '../types/portfolio';

interface ProjectCardProps {
  project: ProjectSystem;
  onSelect: (project: ProjectSystem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { verification, hardware, repo, tech_stack } = project;
  const visibleTech = tech_stack.core.slice(0, 5);
  const extraTechCount = Math.max(0, tech_stack.core.length - visibleTech.length);
  const effectiveTests = Math.max(verification.status_tests_passed, verification.detected_test_cases);

  const stateClass =
    verification.workspace_state === 'verified'
      ? 'emerald'
      : verification.workspace_state === 'active_build'
        ? 'cyan'
        : 'amber';

  const stateLabel =
    verification.workspace_state === 'verified'
      ? 'VERIFIED'
      : verification.workspace_state === 'active_build'
        ? 'ACTIVE BUILD'
        : 'BLUEPRINT';

  return (
    <article
      className="hud-panel project-card"
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Inspect ${project.name} engineering specification`}
    >
      <div className="card-top-row">
        <span className="sys-code">
          {project.code} // {project.domain_badge.toUpperCase()}
        </span>
        <span className={`status-pill ${stateClass}`}>
          {verification.workspace_state === 'verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {stateLabel}
        </span>
      </div>

      <h3 className="card-title">{project.name}</h3>
      <p className="card-tagline">{project.tagline}</p>

      <ul className="card-highlights">
        {project.key_highlights.slice(0, 3).map((item) => (
          <li key={item}>
            <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="tech-chip-row">
        {visibleTech.map((tech) => (
          <span key={tech} className="tech-chip">
            {tech}
          </span>
        ))}
        {extraTechCount > 0 && <span className="tech-chip">+{extraTechCount}</span>}
        {hardware.has_hardware && (
          <span
            className="tech-chip"
            style={{ borderColor: 'rgba(255, 184, 0, 0.38)', color: 'var(--amber)' }}
          >
            <Cpu size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            PCB/CAD
          </span>
        )}
      </div>

      <div className="card-telemetry-footer">
        <div className="card-metrics-inline">
          <span title="Indexed workspace files">
            <FolderCode size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {verification.disk_file_count} files
          </span>
          <span title="Detected or reported test cases">Tests: {effectiveTests}</span>
          <span title={`Target GitHub repo: ${repo.target_repo_name}`}>
            <GitBranch size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
            {repo.latest_commit ?? 'local'}
          </span>
        </div>

        <span
          className="mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            color: 'var(--cyan)',
            fontWeight: 600,
          }}
        >
          Inspect <ArrowUpRight size={14} />
        </span>
      </div>
    </article>
  );
};
