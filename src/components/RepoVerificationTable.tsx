import React from 'react';
import { ShieldCheck, GitBranch, FolderCheck } from 'lucide-react';
import type { PortfolioMeta, ProjectSystem } from '../types/portfolio';

interface RepoVerificationTableProps {
  projects: ProjectSystem[];
  meta: PortfolioMeta;
  generatedAt: string;
  onSelectProject: (project: ProjectSystem) => void;
}

export const RepoVerificationTable: React.FC<RepoVerificationTableProps> = ({
  projects,
  meta,
  generatedAt,
  onSelectProject,
}) => {
  return (
    <section id="registry" className="section-block">
      <div className="container">
        <div className="section-kicker">
          <ShieldCheck size={14} /> GROUND-TRUTH WORKSPACE &amp; REPOSITORY REGISTRY
        </div>
        <h2 className="section-title">Synchronized Verification &amp; Git Status</h2>
        <p className="section-desc" style={{ marginBottom: 24 }}>
          Populated dynamically via <code className="mono">scripts/sync_portfolio_data.py</code> from
          local project trees and <code className="mono">00-PORTFOLIO-MANAGEMENT/</code>. No fabricated live
          cloud demo links — target GitHub repositories and local run commands reflect actual repository state.
        </p>

        <div className="hud-panel" style={{ padding: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--cyan)' }}>
              <FolderCheck size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              GENERATED AT: {generatedAt} · TOTAL FILES: {meta.total_disk_files} · DETECTED TESTS:{' '}
              {meta.total_detected_test_cases}
            </div>
            <span className="status-pill emerald">OWNER: JAGJYOT · BRANCH: MAIN</span>
          </div>

          <div className="table-scroll">
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>System</th>
                  <th>Workspace Folder</th>
                  <th>Target GitHub Repo</th>
                  <th>Files</th>
                  <th>Tests (Scanned / Matrix)</th>
                  <th>Git Commit</th>
                  <th>Push Status</th>
                  <th>Spec</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>
                        {p.code}
                      </div>
                    </td>
                    <td className="mono" style={{ color: 'var(--text-primary)' }}>
                      {p.folder}/
                    </td>
                    <td className="mono" style={{ color: 'var(--cyan)' }}>
                      <GitBranch size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {p.repo.target_repo_name}
                    </td>
                    <td className="mono">{p.verification.disk_file_count}</td>
                    <td className="mono" style={{ color: 'var(--emerald)' }}>
                      {p.verification.detected_test_cases} / {p.verification.status_tests_passed}
                    </td>
                    <td className="mono">{p.repo.latest_commit ?? 'Pending'}</td>
                    <td className="mono" style={{ fontSize: '0.74rem' }}>
                      {p.repo.remote_url ? (
                        <a href={p.repo.remote_url} target="_blank" rel="noreferrer" style={{ color: 'var(--emerald)' }}>
                          {p.repo.push_status}
                        </a>
                      ) : (
                        p.repo.push_status
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectProject(p)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
