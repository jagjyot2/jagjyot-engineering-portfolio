export type ProjectCategory = 'Software & AI' | 'Simulation' | 'Embedded & Hardware';

export type WorkspaceState = 'verified' | 'active_build' | 'initializing';

export interface ArchitectureNode {
  id: string;
  label: string;
  layer: string;
  detail: string;
}

export interface ArchitectureLink {
  from: string;
  to: string;
  bus: string;
}

export interface ArchitectureDiagramData {
  summary: string;
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
}

export interface BomItem {
  designator: string;
  part: string;
  spec: string;
  qty: number;
}

export interface HardwareSpec {
  has_hardware: boolean;
  summary?: string;
  mcu?: string;
  sensors?: string[];
  comms?: string;
  pcb_summary?: string;
  stl_summary?: string;
  bom_items: BomItem[];
  bom_source: string;
  kicad_files_detected: string[];
  gerber_files_detected: string[];
  stl_files_detected: string[];
  benchtwin_files_detected: string[];
  benchtwin_status: string;
}

export interface RepoMetadata {
  target_repo_name: string;
  branch: string;
  git_initialized: boolean;
  latest_commit: string | null;
  remote_url: string | null;
  push_status: string;
}

export interface LocalLaunchProfile {
  mode_label: string;
  commands: string[];
  default_endpoints: string[];
}

export interface VerificationState {
  stage: string;
  assigned_agent: string;
  workspace_state: WorkspaceState;
  disk_file_count: number;
  key_files: string[];
  test_files: string[];
  detected_test_cases: number;
  status_tests_passed: number;
  status_tests_failed: number;
  blockers: string;
}

export interface ProjectSystem {
  id: string;
  code: string;
  folder: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  domain_badge: string;
  problem_statement: string;
  solution_summary: string;
  key_highlights: string[];
  architecture: ArchitectureDiagramData;
  tech_stack: {
    core: string[];
    detected_from_disk: string[];
  };
  hardware: HardwareSpec;
  repo: RepoMetadata;
  local_launch: LocalLaunchProfile;
  verification: VerificationState;
}

export interface PortfolioMeta {
  total_projects: number;
  verified_count: number;
  active_build_count: number;
  initializing_count: number;
  total_disk_files: number;
  total_tests_reported: number;
  total_detected_test_cases: number;
  software_systems_count: number;
  simulation_systems_count: number;
  hardware_systems_count: number;
}

export interface PortfolioData {
  schema_version: string;
  generated_at: string;
  portfolio_owner: string;
  portfolio_meta: PortfolioMeta;
  projects: ProjectSystem[];
}
