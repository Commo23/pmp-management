import {
  sampleTasks,
  sampleBacklog,
  sampleRaci,
  sampleWbs,
  sampleRisks,
  sampleStakeholders,
  sampleRequirements,
  sampleSprints,
  sampleReleases,
  sampleGanttTasks,
} from '@/data/projectData';
import type { CloudProjectState } from '@/lib/supabase/types';
import { PMP_STORAGE_VERSION } from '@/lib/supabase/types';

/** Public demo account — seed data is always restored on sign-in. */
export const DEMO_EMAIL = 'demo@pmp.app';
export const DEMO_PASSWORD = 'DemoPMP2026!';

export function isDemoUser(email: string | undefined | null): boolean {
  return (email ?? '').toLowerCase() === DEMO_EMAIL;
}

export function buildDemoCloudState(): CloudProjectState {
  return {
    version: PMP_STORAGE_VERSION,
    mode: 'waterfall',
    tasks: structuredClone(sampleTasks),
    backlog: structuredClone(sampleBacklog),
    raci: structuredClone(sampleRaci),
    risks: structuredClone(sampleRisks),
    stakeholders: structuredClone(sampleStakeholders),
    requirements: structuredClone(sampleRequirements),
    wbs: structuredClone(sampleWbs),
    sprints: structuredClone(sampleSprints),
    releases: structuredClone(sampleReleases),
    ganttTasks: structuredClone(sampleGanttTasks),
  };
}
