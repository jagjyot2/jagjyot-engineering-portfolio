import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Cpu,
  FolderTree,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Box,
} from 'lucide-react';
import type { ProjectSystem } from '../types/portfolio';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface ProjectModalProps {
  project: ProjectSystem | null;
  allProjects: ProjectSystem[];
  onClose: () => void;
  onSelectProject: (project: ProjectSystem) => void;
}

type ModalTab = 'architecture' | 'stack' | 'hardware' | 'launch';

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  onClose,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab('architecture');
    setCopiedKey(null);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, onClose]);

  if (!project) return null;

  const idx = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = idx > 0 ? allProjects[idx - 1] : allProjects[allProjects.length - 1];
  const nextProject = idx < allProjects.length - 1 ? allProjects[idx + 1] : allProjects[0];

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard API unavailable in non-HTTPS contexts; ignore silently
    }
  };

  const { verification, hardware, repo, local_launch } = project;
  const cmdBlock = local_launch.commands.join('\n');

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-shell">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className="sys-code">
                {project.code} // {project.folder}
              </span>
              <span className="status-pill cyan">{project.category}</span>
              <span
                className={`status-pill ${
                  verification.workspace_state === 'verified'
                    ? 'emerald'
                    : verification.workspace_state === 'active_build'
                      ? 'cyan'
                      : 'amber'
                }`}
              >
                {verification.workspace_state.toUpperCase()}
              </span>
            </div>
            <h2 id="modal-project-title" style={{ fontSize: '1.55rem', fontWeight: 700 }}>
              {project.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {project.tagline}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {prevProject && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectProject(prevProject)}
                title={`Previous: ${prevProject.name}`}
              >
                <ChevronLeft size={15} />
              </button>
            )}
            {nextProject && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectProject(nextProject)}
                title={`Next: ${nextProject.name}`}
              >
                <ChevronRight size={15} />
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              aria-label="Close system modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'architecture'}
            className={`filter-pill ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            Problem &amp; Architecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stack'}
            className={`filter-pill ${activeTab === 'stack' ? 'active' : ''}`}
            onClick={() => setActiveTab('stack')}
          >
            <FolderTree size={13} /> Stack &amp; Files ({verification.disk_file_count})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'hardware'}
            className={`filter-pill ${activeTab === 'hardware' ? 'active' : ''}`}
            onClick={() => setActiveTab('hardware')}
          >
            <Cpu size={13} /> Hardware BOM &amp; CAD
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'launch'}
            className={`filter-pill ${activeTab === 'launch' ? 'active' : ''}`}
            onClick={() => setActiveTab('launch')}
          >
            <Terminal size={13} /> Local CLI &amp; Verification
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'architecture' && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                <div className="spec-row">
                  <span className="spec-key">ENGINEERING PROBLEM STATEMENT</span>
                  <span className="spec-val" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {project.problem_statement}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key" style={{ color: 'var(--cyan)' }}>
                    SYSTEM IMPLEMENTATION SUMMARY
                  </span>
                  <span className="spec-val" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {project.solution_summary}
                  </span>
                </div>
              </div>

              <ArchitectureDiagram architecture={project.architecture} />

              <div>
                <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--amber)', marginBottom: 8 }}>
                  CORE CAPABILITIES &amp; DELIVERABLES
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 10,
                  }}
                >
                  {project.key_highlights.map((hl) => (
                    <div
                      key={hl}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 7,
                        background: 'rgba(17, 24, 39, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.84rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'stack' && (
            <>
              <div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginBottom: 10 }}>
                  TECHNOLOGY STACK &amp; DISK MANIFEST DETECTION
                </div>
                <div className="tech-chip-row">
                  {project.tech_stack.core.map((tech) => {
                    const isDiskDetected = project.tech_stack.detected_from_disk.includes(tech);
                    return (
                      <span
                        key={tech}
                        className="tech-chip"
                        style={
                          isDiskDetected
                            ? { borderColor: 'rgba(16, 185, 129, 0.45)', color: 'var(--emerald)' }
                            : undefined
                        }
                        title={isDiskDetected ? 'Detected directly from manifest files on disk' : 'Core system stack'}
                      >
                        {tech} {isDiskDetected ? '✓' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                <div className="spec-row">
                  <span className="spec-key">SYNCHRONIZED WORKSPACE FILES ({verification.disk_file_count})</span>
                  {verification.key_files.length > 0 ? (
                    <pre className="code-block" style={{ margin: '6px 0 0', maxHeight: 260 }}>
                      {verification.key_files.join('\n')}
                    </pre>
                  ) : (
                    <span className="spec-val" style={{ color: 'var(--text-muted)' }}>
                      Workspace initializing — run `python scripts/sync_portfolio_data.py` to refresh file tree.
                    </span>
                  )}
                </div>

                <div className="spec-row">
                  <span className="spec-key" style={{ color: 'var(--emerald)' }}>
                    TEST FILES ({verification.test_files.length}) · DETECTED CASES ({verification.detected_test_cases})
                  </span>
                  {verification.test_files.length > 0 ? (
                    <pre className="code-block" style={{ margin: '6px 0 0', maxHeight: 260 }}>
                      {verification.test_files.join('\n')}
                    </pre>
                  ) : (
                    <span className="spec-val" style={{ color: 'var(--text-muted)' }}>
                      No test files scanned on disk yet (status matrix reported: {verification.status_tests_passed} passed).
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'hardware' && (
            <>
              {!hardware.has_hardware ? (
                <div className="spec-row">
                  <span className="spec-key">SOFTWARE &amp; SIMULATION SYSTEM</span>
                  <span className="spec-val" style={{ color: 'var(--text-secondary)' }}>
                    {hardware.summary} No physical PCB fabrication or 3D STL CAD enclosure is required for this repository.
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                      gap: 12,
                    }}
                  >
                    <div className="spec-row">
                      <span className="spec-key">MCU / COMPUTE CORE</span>
                      <span className="spec-val">{hardware.mcu}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">RF / TELEMETRY BUS</span>
                      <span className="spec-val">{hardware.comms}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">BENCH-TWIN 3D STATUS</span>
                      <span className="spec-val">{hardware.benchtwin_status}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 12,
                    }}
                  >
                    <div className="spec-row">
                      <span className="spec-key" style={{ color: 'var(--cyan)' }}>
                        KICAD 8 PCB &amp; GERBER SUMMARY
                      </span>
                      <span className="spec-val" style={{ color: 'var(--text-secondary)' }}>
                        {hardware.pcb_summary}
                      </span>
                      <div className="mono" style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        Detected KiCad: {hardware.kicad_files_detected.length} · Gerbers: {hardware.gerber_files_detected.length}
                      </div>
                    </div>

                    <div className="spec-row">
                      <span className="spec-key" style={{ color: 'var(--cyan)' }}>
                        <Box size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                        3D CAD / STL MECHANICAL SUMMARY
                      </span>
                      <span className="spec-val" style={{ color: 'var(--text-secondary)' }}>
                        {hardware.stl_summary}
                      </span>
                      <div className="mono" style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        Detected STL/SCAD files: {hardware.stl_files_detected.length}
                        {hardware.stl_files_detected.length > 0
                          ? ` (${hardware.stl_files_detected.slice(0, 3).join(', ')})`
                          : ''}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--amber)' }}>
                        BILL OF MATERIALS (BOM)
                      </span>
                      <span className="status-pill cyan">
                        SOURCE: {hardware.bom_source === 'parsed_workspace_bom' ? 'PARSED WORKSPACE BOM' : 'HARDWARE BLUEPRINT SPEC'}
                      </span>
                    </div>
                    <div className="table-scroll" style={{ border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                      <table className="telemetry-table">
                        <thead>
                          <tr>
                            <th>Ref</th>
                            <th>Component / Part</th>
                            <th>Electrical / Mechanical Spec</th>
                            <th>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hardware.bom_items.map((item) => (
                            <tr key={`${item.designator}-${item.part}`}>
                              <td className="mono" style={{ color: 'var(--amber)' }}>
                                {item.designator}
                              </td>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.part}</td>
                              <td>{item.spec}</td>
                              <td className="mono">{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'launch' && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 14,
                }}
              >
                <div className="spec-row">
                  <span className="spec-key">TARGET GITHUB REPOSITORY (TRUTH-SYNCED)</span>
                  <div className="mono" style={{ fontSize: '0.88rem', color: 'var(--cyan)', marginTop: 3 }}>
                    <GitBranch size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {repo.target_repo_name} ({repo.branch})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Status: {repo.push_status}
                    {repo.latest_commit ? ` · Commit ${repo.latest_commit}` : ' · Local commit pending'}
                  </div>
                  {repo.remote_url ? (
                    <a
                      href={repo.remote_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mono"
                      style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: 6 }}
                    >
                      {repo.remote_url}
                    </a>
                  ) : (
                    <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      No fabricated cloud demo URL — local execution workflow documented below.
                    </div>
                  )}
                </div>

                <div className="spec-row">
                  <span className="spec-key">VERIFICATION &amp; TEST MATRIX</span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: 3 }}>
                    Agent: <span className="mono">{verification.assigned_agent}</span> · Stage:{' '}
                    <span className="mono">{verification.stage}</span>
                  </div>
                  <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: 6 }}>
                    Matrix Passed: {verification.status_tests_passed} | Failed: {verification.status_tests_failed} |
                    Scanned Test Cases: {verification.detected_test_cases}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--amber)', marginTop: 4 }}>
                    <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Blockers: {verification.blockers}
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>
                    LOCAL RUN WORKFLOW // {local_launch.mode_label.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(cmdBlock, 'cmd')}
                  >
                    {copiedKey === 'cmd' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'cmd' ? 'Copied' : 'Copy CLI'}
                  </button>
                </div>
                <pre className="code-block">{cmdBlock}</pre>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  Local Endpoints: {local_launch.default_endpoints.join(' · ')}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
