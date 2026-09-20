import type {
  ProjectMode,
  Task,
  BacklogItem,
  RACIEntry,
  Risk,
  Stakeholder,
  Requirement,
  WBSNode,
  Sprint,
  Release,
  GanttTask,
} from '@/types/project';

export const PMP_STORAGE_KEY = 'pmp-flow-designer-state';
export const PMP_STORAGE_VERSION = 2;
export const PMP_ACTIVE_PROJECT_KEY = 'pmp-active-project-id';

export interface CloudProjectState {
  version: number;
  mode: ProjectMode;
  tasks: Task[];
  backlog: BacklogItem[];
  raci: RACIEntry[];
  risks: Risk[];
  stakeholders: Stakeholder[];
  requirements: Requirement[];
  wbs: WBSNode[];
  sprints: Sprint[];
  releases: Release[];
  ganttTasks: GanttTask[];
}

export interface PmpProjectRow {
  id: string;
  owner_id: string;
  name: string;
  mode: ProjectMode;
  state: CloudProjectState;
  created_at: string;
  updated_at: string;
}

export interface CloudProjectSummary {
  id: string;
  name: string;
  updated_at: string;
}

export interface PmpChatMessageRow {
  id: string;
  owner_id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Accepts v1 (missing sprints/releases/ganttTasks) or v2+.
 * Core entity arrays are required; the three new arrays are optional for migration.
 */
export function isCloudProjectState(value: unknown): value is CloudProjectState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const coreOk =
    Array.isArray(v.tasks) &&
    Array.isArray(v.backlog) &&
    Array.isArray(v.raci) &&
    Array.isArray(v.risks) &&
    Array.isArray(v.stakeholders) &&
    Array.isArray(v.requirements) &&
    Array.isArray(v.wbs);

  if (!coreOk) return false;

  if (v.sprints !== undefined && !Array.isArray(v.sprints)) return false;
  if (v.releases !== undefined && !Array.isArray(v.releases)) return false;
  if (v.ganttTasks !== undefined && !Array.isArray(v.ganttTasks)) return false;

  return true;
}
