import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import rawPortfolioData from './data/projects.json';
import type { PortfolioData, ProjectSystem } from './types/portfolio';
import { NavbarHUD } from './components/NavbarHUD';
import { HeroTelemetry } from './components/HeroTelemetry';
import { FilterBar, type CategoryFilter } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { InteractiveLabs } from './components/InteractiveLabs';
import { HardwareShowcase } from './components/HardwareShowcase';
import { RepoVerificationTable } from './components/RepoVerificationTable';

const portfolioData = rawPortfolioData as PortfolioData;

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectSystem | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const focusSearch = () => {
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => searchInputRef.current?.focus(), 200);
  };

  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !inInput && !selectedProject) {
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener('keydown', handleSlashKey);
    return () => window.removeEventListener('keydown', handleSlashKey);
  }, [selectedProject]);

  const categoryCounts = useMemo<Record<CategoryFilter, number>>(() => {
    const counts: Record<CategoryFilter, number> = {
      All: portfolioData.projects.length,
      'Software & AI': 0,
      Simulation: 0,
      'Embedded & Hardware': 0,
    };
    for (const p of portfolioData.projects) {
      counts[p.category] += 1;
    }
    return counts;
  }, []);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return portfolioData.projects.filter((proj) => {
      const matchesCat = activeCategory === 'All' || proj.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        proj.name,
        proj.code,
        proj.folder,
        proj.tagline,
        proj.domain_badge,
        proj.repo.target_repo_name,
        ...proj.tech_stack.core,
        ...(proj.hardware.sensors ?? []),
        proj.hardware.mcu ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
      <NavbarHUD
        meta={portfolioData.portfolio_meta}
        generatedAt={portfolioData.generated_at}
        onFocusSearch={focusSearch}
      />

      <main>
        <HeroTelemetry
          meta={portfolioData.portfolio_meta}
          projects={portfolioData.projects}
          onSelectProject={setSelectedProject}
        />

        <section id="systems" className="section-block">
          <div className="container">
            <div className="section-kicker">
              <Layers size={14} /> ENGINEERED PORTFOLIO SYSTEMS (01–06)
            </div>
            <h2 className="section-title">Flight, Vision, Swarm, Robotics &amp; BMS Systems</h2>
            <p className="section-desc" style={{ marginBottom: 24 }}>
              Select any system card to open its interactive architecture schematic, workspace file manifest,
              bill of materials, 3D STL CAD summary, and local execution commands.
            </p>

            <FilterBar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={categoryCounts}
              searchInputRef={searchInputRef}
            />

            {filteredProjects.length > 0 ? (
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onSelect={setSelectedProject} />
                ))}
              </div>
            ) : (
              <div className="hud-panel" style={{ padding: 36, textAlign: 'center' }}>
                <div className="mono" style={{ color: 'var(--amber)', marginBottom: 8 }}>
                  NO MATCHING SYSTEMS FOR QUERY &ldquo;{searchQuery}&rdquo;
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        <InteractiveLabs />

        <HardwareShowcase projects={portfolioData.projects} onSelectProject={setSelectedProject} />

        <RepoVerificationTable
          projects={portfolioData.projects}
          meta={portfolioData.portfolio_meta}
          generatedAt={portfolioData.generated_at}
          onSelectProject={setSelectedProject}
        />
      </main>

      <footer className="portfolio-footer">
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <div className="brand-title">JAGJYOT // ENGINEERING PORTFOLIO</div>
            <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              React + TypeScript + Vite · FastAPI Static Server · Synced via scripts/sync_portfolio_data.py
            </div>
          </div>
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            MIT License · Target Repo: <span style={{ color: 'var(--cyan)' }}>jagjyot-engineering-portfolio</span>
          </div>
        </div>
      </footer>

      <ProjectModal
        project={selectedProject}
        allProjects={portfolioData.projects}
        onClose={() => setSelectedProject(null)}
        onSelectProject={setSelectedProject}
      />
    </>
  );
};

export default App;
