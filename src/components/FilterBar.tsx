import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { ProjectCategory } from '../types/portfolio';

export type CategoryFilter = 'All' | ProjectCategory;

interface FilterBarProps {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: Record<CategoryFilter, number>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Software & AI',
  'Simulation',
  'Embedded & Hardware',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  counts,
  searchInputRef,
}) => {
  return (
    <div className="hud-panel filter-toolbar">
      <div className="filter-pills" role="tablist" aria-label="Filter systems by engineering domain">
        <span
          className="mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginRight: 4,
          }}
        >
          <SlidersHorizontal size={13} /> DOMAIN:
        </span>
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              <span>{category}</span>
              <span style={{ opacity: 0.72 }}>({counts[category]})</span>
            </button>
          );
        })}
      </div>

      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          ref={searchInputRef}
          type="search"
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ESP32, KiCad, FFT, A*, INA226..."
          aria-label="Search engineering systems"
        />
      </div>
    </div>
  );
};
