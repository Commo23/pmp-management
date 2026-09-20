import type { CloudProjectState } from '@/lib/supabase/types';
import { PMP_STORAGE_VERSION, isCloudProjectState } from '@/lib/supabase/types';
import type { ProjectMode, Sprint, Release, GanttTask } from '@/types/project';
import {
  sampleSprints,
  sampleReleases,
  sampleGanttTasks,
} from '@/data/projectData';

export interface ProjectExportPayload {
  mode: ProjectMode;
  tasks: CloudProjectState['tasks'];
  backlog: CloudProjectState['backlog'];
  raci: CloudProjectState['raci'];
  risks: CloudProjectState['risks'];
  stakeholders: CloudProjectState['stakeholders'];
  requirements: CloudProjectState['requirements'];
  wbs: CloudProjectState['wbs'];
  sprints?: Sprint[];
  releases?: Release[];
  ganttTasks?: GanttTask[];
  version?: number;
  exportedAt?: string;
  phases?: unknown;
}

export function isProjectExportPayload(value: unknown): value is ProjectExportPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const coreOk =
    (v.mode === 'waterfall' || v.mode === 'agile') &&
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

function withMigratedArrays(
  partial: Omit<CloudProjectState, 'sprints' | 'releases' | 'ganttTasks'> & {
    sprints?: Sprint[];
    releases?: Release[];
    ganttTasks?: GanttTask[];
  }
): CloudProjectState {
  return {
    ...partial,
    sprints: Array.isArray(partial.sprints)
      ? partial.sprints
      : structuredClone(sampleSprints),
    releases: Array.isArray(partial.releases)
      ? partial.releases
      : structuredClone(sampleReleases),
    ganttTasks: Array.isArray(partial.ganttTasks)
      ? partial.ganttTasks
      : structuredClone(sampleGanttTasks),
  };
}

/** Normalize export JSON or cloud state into CloudProjectState. */
export function parseImportedProject(raw: unknown): CloudProjectState | null {
  if (isCloudProjectState(raw)) {
    return withMigratedArrays({
      ...raw,
      version: raw.version ?? PMP_STORAGE_VERSION,
    });
  }
  if (!isProjectExportPayload(raw)) return null;
  return withMigratedArrays({
    version: typeof raw.version === 'number' ? raw.version : PMP_STORAGE_VERSION,
    mode: raw.mode,
    tasks: raw.tasks,
    backlog: raw.backlog,
    raci: raw.raci,
    risks: raw.risks,
    stakeholders: raw.stakeholders,
    requirements: raw.requirements,
    wbs: raw.wbs,
    sprints: raw.sprints,
    releases: raw.releases,
    ganttTasks: raw.ganttTasks,
  });
}

export function buildExportPayload(state: CloudProjectState, phases: unknown) {
  return {
    ...state,
    phases,
    exportedAt: new Date().toISOString(),
  };
}
