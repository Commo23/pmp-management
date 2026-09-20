import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import {
  ProjectMode,
  Phase,
  Task,
  BacklogItem,
  Sprint,
  Release,
  RACIEntry,
  WBSNode,
  Risk,
  Stakeholder,
  Requirement,
  GanttTask,
} from '@/types/project';
import {
  waterfallPhases,
  agilePhases,
  sampleSprints,
  sampleReleases,
  sampleGanttTasks,
} from '@/data/projectData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  CloudProjectState,
  CloudProjectSummary,
  PMP_STORAGE_KEY,
  PMP_STORAGE_VERSION,
  PMP_ACTIVE_PROJECT_KEY,
  isCloudProjectState,
} from '@/lib/supabase/types';
import { buildDemoCloudState, isDemoUser } from '@/lib/demo';
import { parseImportedProject } from '@/lib/projectImportExport';
import { toast } from 'sonner';

type SyncStatus = 'idle' | 'loading' | 'synced' | 'saving' | 'error' | 'local';

function migrateCloudState(
  partial: Partial<CloudProjectState> & Pick<CloudProjectState, 'tasks' | 'backlog'>
): CloudProjectState {
  return {
    version: PMP_STORAGE_VERSION,
    mode: partial.mode ?? 'waterfall',
    tasks: partial.tasks ?? [],
    backlog: partial.backlog ?? [],
    raci: partial.raci ?? [],
    risks: partial.risks ?? [],
    stakeholders: partial.stakeholders ?? [],
    requirements: partial.requirements ?? [],
    wbs: partial.wbs ?? [],
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

function loadPersistedState(): CloudProjectState | null {
  try {
    const raw = localStorage.getItem(PMP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isCloudProjectState(parsed)) return null;
    return migrateCloudState(parsed);
  } catch {
    return null;
  }
}

function getDefaultState(): Omit<CloudProjectState, 'version'> {
  const demo = buildDemoCloudState();
  const { version: _v, ...rest } = demo;
  return rest;
}

function readActiveProjectId(): string | null {
  try {
    return localStorage.getItem(PMP_ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

function writeActiveProjectId(id: string | null) {
  try {
    if (id) localStorage.setItem(PMP_ACTIVE_PROJECT_KEY, id);
    else localStorage.removeItem(PMP_ACTIVE_PROJECT_KEY);
  } catch {
    // ignore
  }
}

interface ProjectContextType {
  mode: ProjectMode;
  setMode: (mode: ProjectMode) => void;
  phases: Phase[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  backlog: BacklogItem[];
  setBacklog: React.Dispatch<React.SetStateAction<BacklogItem[]>>;
  sprints: Sprint[];
  releases: Release[];
  raci: RACIEntry[];
  setRaci: React.Dispatch<React.SetStateAction<RACIEntry[]>>;
  wbs: WBSNode[];
  setWbs: React.Dispatch<React.SetStateAction<WBSNode[]>>;
  risks: Risk[];
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  stakeholders: Stakeholder[];
  setStakeholders: React.Dispatch<React.SetStateAction<Stakeholder[]>>;
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  ganttTasks: GanttTask[];
  selectedPhase: Phase | null;
  setSelectedPhase: (phase: Phase | null) => void;
  resetToSampleData: () => void;
  importProjectState: (raw: unknown) => { ok: true } | { ok: false; error: string };
  cloudProjectId: string | null;
  cloudProjectName: string;
  cloudProjects: CloudProjectSummary[];
  syncStatus: SyncStatus;
  refreshProjectList: () => Promise<void>;
  switchProject: (id: string) => Promise<void>;
  createProject: (name: string) => Promise<void>;
  renameProject: (name: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addBacklogItem: (item: Omit<BacklogItem, 'id' | 'order'>) => void;
  updateBacklogItem: (itemId: string, updates: Partial<BacklogItem>) => void;
  deleteBacklogItem: (itemId: string) => void;
  moveBacklogItem: (itemId: string, targetSprintId?: string) => void;
  reorderBacklog: (startIndex: number, endIndex: number) => void;
  reorderProductBacklog: (fromId: string, toId: string) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  addRelease: (release: Omit<Release, 'id'>) => void;
  updateRelease: (releaseId: string, updates: Partial<Release>) => void;
  deleteRelease: (releaseId: string) => void;
  addGanttTask: (task: Omit<GanttTask, 'id'>) => void;
  updateGanttTask: (taskId: string, updates: Partial<GanttTask>) => void;
  deleteGanttTask: (taskId: string) => void;
  addRisk: (risk: Omit<Risk, 'id'>) => void;
  updateRisk: (riskId: string, updates: Partial<Risk>) => void;
  deleteRisk: (riskId: string) => void;
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => void;
  updateStakeholder: (stakeholderId: string, updates: Partial<Stakeholder>) => void;
  deleteStakeholder: (stakeholderId: string) => void;
  addRequirement: (requirement: Omit<Requirement, 'id'>) => void;
  updateRequirement: (requirementId: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (requirementId: string) => void;
  addWbsNode: (node: Omit<WBSNode, 'id'>) => void;
  updateWbsNode: (nodeId: string, updates: Partial<WBSNode>) => void;
  deleteWbsNode: (nodeId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const saved = loadPersistedState();
  const defaults = getDefaultState();

  const [mode, setModeState] = useState<ProjectMode>(saved?.mode ?? defaults.mode);
  const [tasks, setTasks] = useState<Task[]>(saved?.tasks ?? defaults.tasks);
  const [backlog, setBacklog] = useState<BacklogItem[]>(saved?.backlog ?? defaults.backlog);
  const [sprints, setSprints] = useState<Sprint[]>(saved?.sprints ?? defaults.sprints);
  const [releases, setReleases] = useState<Release[]>(saved?.releases ?? defaults.releases);
  const [raci, setRaci] = useState<RACIEntry[]>(saved?.raci ?? defaults.raci);
  const [risks, setRisks] = useState<Risk[]>(saved?.risks ?? defaults.risks);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(
    saved?.stakeholders ?? defaults.stakeholders
  );
  const [requirements, setRequirements] = useState<Requirement[]>(
    saved?.requirements ?? defaults.requirements
  );
  const [wbs, setWbs] = useState<WBSNode[]>(saved?.wbs ?? defaults.wbs);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(
    saved?.ganttTasks ?? defaults.ganttTasks
  );
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(null);
  const [cloudProjectName, setCloudProjectName] = useState<string>('My PMP Project');
  const [cloudProjects, setCloudProjects] = useState<CloudProjectSummary[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [cloudReady, setCloudReady] = useState(false);

  const hydratingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phases = mode === 'waterfall' ? waterfallPhases : agilePhases;

  const buildState = useCallback((): CloudProjectState => {
    return {
      version: PMP_STORAGE_VERSION,
      mode,
      tasks,
      backlog,
      raci,
      risks,
      stakeholders,
      requirements,
      wbs,
      sprints,
      releases,
      ganttTasks,
    };
  }, [
    mode,
    tasks,
    backlog,
    raci,
    risks,
    stakeholders,
    requirements,
    wbs,
    sprints,
    releases,
    ganttTasks,
  ]);

  const applyState = useCallback((next: CloudProjectState | Partial<CloudProjectState>) => {
    const migrated = migrateCloudState(
      next as Partial<CloudProjectState> & Pick<CloudProjectState, 'tasks' | 'backlog'>
    );
    hydratingRef.current = true;
    setModeState(migrated.mode);
    setTasks(migrated.tasks);
    setBacklog(migrated.backlog);
    setRaci(migrated.raci);
    setRisks(migrated.risks);
    setStakeholders(migrated.stakeholders);
    setRequirements(migrated.requirements);
    setWbs(migrated.wbs);
    setSprints(migrated.sprints);
    setReleases(migrated.releases);
    setGanttTasks(migrated.ganttTasks);
    setSelectedPhase(null);
    queueMicrotask(() => {
      hydratingRef.current = false;
    });
  }, []);

  const setMode = useCallback((next: ProjectMode) => {
    setModeState(next);
    setSelectedPhase(null);
  }, []);

  const resetToSampleData = useCallback(() => {
    applyState(buildDemoCloudState());
    localStorage.removeItem(PMP_STORAGE_KEY);
  }, [applyState]);

  const importProjectState = useCallback(
    (raw: unknown): { ok: true } | { ok: false; error: string } => {
      const parsed = parseImportedProject(raw);
      if (!parsed) {
        return {
          ok: false,
          error: 'Invalid file — expected a PMP Flow Designer export (tasks, backlog, risks…).',
        };
      }
      applyState(parsed);
      return { ok: true };
    },
    [applyState]
  );

  const refreshProjectList = useCallback(async () => {
    if (!user) {
      setCloudProjects([]);
      return;
    }
    const { data, error } = await supabase
      .from('pmp_projects')
      .select('id, name, updated_at')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setCloudProjects((data as CloudProjectSummary[]) ?? []);
  }, [user]);

  const switchProject = useCallback(
    async (id: string) => {
      if (!user) return;
      setSyncStatus('loading');
      setCloudReady(false);

      const { data, error } = await supabase
        .from('pmp_projects')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error || !data) {
        console.error(error);
        setSyncStatus('error');
        toast.error('Unable to switch project');
        setCloudReady(true);
        return;
      }

      setCloudProjectId(data.id);
      setCloudProjectName(data.name);
      writeActiveProjectId(data.id);

      if (isCloudProjectState(data.state)) {
        applyState(data.state);
      } else if (data.mode) {
        setModeState(data.mode as ProjectMode);
      }

      await refreshProjectList();
      setSyncStatus('synced');
      setCloudReady(true);
      toast.success(`Switched to ${data.name}`);
    },
    [user, applyState, refreshProjectList]
  );

  const createProject = useCallback(
    async (name: string) => {
      if (!user) return;
      const trimmed = name.trim() || 'New Project';
      const seed = buildDemoCloudState();

      setSyncStatus('saving');
      const { data: created, error } = await supabase
        .from('pmp_projects')
        .insert({
          owner_id: user.id,
          name: trimmed,
          mode: seed.mode,
          state: seed,
        })
        .select('*')
        .single();

      if (error || !created) {
        console.error(error);
        setSyncStatus('error');
        toast.error('Unable to create project');
        return;
      }

      setCloudProjectId(created.id);
      setCloudProjectName(created.name);
      writeActiveProjectId(created.id);
      applyState(seed);
      await refreshProjectList();
      setSyncStatus('synced');
      setCloudReady(true);
      toast.success(`Created ${created.name}`);
    },
    [user, applyState, refreshProjectList]
  );

  const renameProject = useCallback(
    async (name: string) => {
      if (!user || !cloudProjectId) return;
      const trimmed = name.trim();
      if (!trimmed) return;

      const { error } = await supabase
        .from('pmp_projects')
        .update({ name: trimmed })
        .eq('id', cloudProjectId)
        .eq('owner_id', user.id);

      if (error) {
        console.error(error);
        toast.error('Unable to rename project');
        return;
      }

      setCloudProjectName(trimmed);
      setCloudProjects((prev) =>
        prev.map((p) => (p.id === cloudProjectId ? { ...p, name: trimmed } : p))
      );
      toast.success('Project renamed');
    },
    [user, cloudProjectId]
  );

  // localStorage mirror
  useEffect(() => {
    const payload = buildState();
    try {
      localStorage.setItem(PMP_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [buildState]);

  // Load / create cloud project when user signs in
  useEffect(() => {
    let cancelled = false;

    async function syncCloud() {
      if (!isSupabaseConfigured) {
        setCloudProjectId(null);
        setCloudProjects([]);
        setCloudReady(false);
        setSyncStatus('local');
        return;
      }

      if (!user) {
        setCloudProjectId(null);
        setCloudProjectName('My PMP Project');
        setCloudProjects([]);
        setCloudReady(false);
        setSyncStatus('local');
        return;
      }

      setCloudReady(false);
      setSyncStatus('loading');

      const demo = isDemoUser(user.email);

      const { data: list, error: listError } = await supabase
        .from('pmp_projects')
        .select('id, name, updated_at, mode, state')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (cancelled) return;

      if (listError) {
        console.error(listError);
        setSyncStatus('error');
        toast.error('Unable to load cloud projects');
        return;
      }

      const projects = (list ?? []) as Array<{
        id: string;
        name: string;
        updated_at: string;
        mode: ProjectMode;
        state: unknown;
      }>;

      setCloudProjects(
        projects.map(({ id, name, updated_at }) => ({ id, name, updated_at }))
      );

      // Demo account: always restore the sample seed on the demo project row
      if (demo) {
        const seed = buildDemoCloudState();
        applyState(seed);

        const existing = projects[0];
        if (existing) {
          const { error: updateError } = await supabase
            .from('pmp_projects')
            .update({
              name: 'PMP Demo Project',
              mode: seed.mode,
              state: seed,
            })
            .eq('id', existing.id)
            .eq('owner_id', user.id);

          if (cancelled) return;
          if (updateError) {
            console.error(updateError);
            setSyncStatus('error');
            toast.error('Unable to sync demo project');
            return;
          }
          setCloudProjectId(existing.id);
          setCloudProjectName('PMP Demo Project');
          writeActiveProjectId(existing.id);
        } else {
          const { data: created, error: createError } = await supabase
            .from('pmp_projects')
            .insert({
              owner_id: user.id,
              name: 'PMP Demo Project',
              mode: seed.mode,
              state: seed,
            })
            .select('*')
            .single();

          if (cancelled) return;
          if (createError || !created) {
            console.error(createError);
            setSyncStatus('error');
            toast.error('Unable to create demo project');
            return;
          }
          setCloudProjectId(created.id);
          setCloudProjectName(created.name);
          writeActiveProjectId(created.id);
        }

        if (!cancelled) {
          const { data: refreshed } = await supabase
            .from('pmp_projects')
            .select('id, name, updated_at')
            .eq('owner_id', user.id)
            .order('updated_at', { ascending: false });
          if (!cancelled) {
            setCloudProjects((refreshed as CloudProjectSummary[]) ?? []);
          }
        }

        setSyncStatus('synced');
        setCloudReady(true);
        toast.success('Demo account — sample data loaded');
        return;
      }

      if (projects.length > 0) {
        const activeId = readActiveProjectId();
        const chosen =
          (activeId && projects.find((p) => p.id === activeId)) || projects[0];

        setCloudProjectId(chosen.id);
        setCloudProjectName(chosen.name);
        writeActiveProjectId(chosen.id);

        if (isCloudProjectState(chosen.state)) {
          applyState(chosen.state);
        } else if (chosen.mode) {
          setModeState(chosen.mode);
        }

        setSyncStatus('synced');
        setCloudReady(true);
        toast.success('Cloud project loaded');
        return;
      }

      const seed = buildState();
      const { data: created, error: createError } = await supabase
        .from('pmp_projects')
        .insert({
          owner_id: user.id,
          name: 'My PMP Project',
          mode: seed.mode,
          state: seed,
        })
        .select('*')
        .single();

      if (cancelled) return;

      if (createError || !created) {
        console.error(createError);
        setSyncStatus('error');
        toast.error('Unable to create cloud project');
        return;
      }

      setCloudProjectId(created.id);
      setCloudProjectName(created.name);
      writeActiveProjectId(created.id);
      setCloudProjects([
        { id: created.id, name: created.name, updated_at: created.updated_at },
      ]);
      setSyncStatus('synced');
      setCloudReady(true);
      toast.success('Cloud project created');
    }

    void syncCloud();
    return () => {
      cancelled = true;
    };
    // Intentionally only when user changes — not on every state tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Debounced cloud save (current project only)
  useEffect(() => {
    if (!user || !cloudProjectId || !cloudReady || hydratingRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus('saving');

    saveTimerRef.current = setTimeout(async () => {
      const state = buildState();
      const { error } = await supabase
        .from('pmp_projects')
        .update({ mode: state.mode, state })
        .eq('id', cloudProjectId)
        .eq('owner_id', user.id);

      if (error) {
        console.error(error);
        setSyncStatus('error');
        return;
      }
      setSyncStatus('synced');
      setCloudProjects((prev) =>
        prev.map((p) =>
          p.id === cloudProjectId
            ? { ...p, updated_at: new Date().toISOString() }
            : p
        )
      );
    }, 900);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user, cloudProjectId, cloudReady, buildState]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const addBacklogItem = useCallback((item: Omit<BacklogItem, 'id' | 'order'>) => {
    setBacklog((prev) => {
      const newItem: BacklogItem = {
        ...item,
        id: `b${Date.now()}`,
        order: prev.length,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateBacklogItem = useCallback(
    (itemId: string, updates: Partial<BacklogItem>) => {
      setBacklog((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const deleteBacklogItem = useCallback((itemId: string) => {
    setBacklog((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const moveBacklogItem = useCallback((itemId: string, targetSprintId?: string) => {
    setBacklog((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, sprintId: targetSprintId } : item
      )
    );
  }, []);

  const reorderBacklog = useCallback((startIndex: number, endIndex: number) => {
    setBacklog((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, index) => ({ ...item, order: index }));
    });
  }, []);

  const reorderProductBacklog = useCallback((fromId: string, toId: string) => {
    setBacklog((prev) => {
      const product = prev
        .filter((i) => !i.sprintId)
        .sort((a, b) => a.order - b.order);
      const fromIdx = product.findIndex((i) => i.id === fromId);
      const toIdx = product.findIndex((i) => i.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const nextProduct = [...product];
      const [removed] = nextProduct.splice(fromIdx, 1);
      nextProduct.splice(toIdx, 0, removed);
      const orderMap = new Map(nextProduct.map((item, i) => [item.id, i]));
      return prev.map((item) =>
        item.sprintId ? item : { ...item, order: orderMap.get(item.id) ?? item.order }
      );
    });
  }, []);

  const addSprint = useCallback((sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = {
      ...sprint,
      id: `sp${Date.now()}`,
    };
    setSprints((prev) => [...prev, newSprint]);
  }, []);

  const updateSprint = useCallback((sprintId: string, updates: Partial<Sprint>) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSprint = useCallback((sprintId: string) => {
    setSprints((prev) => prev.filter((s) => s.id !== sprintId));
    setBacklog((prev) =>
      prev.map((item) =>
        item.sprintId === sprintId ? { ...item, sprintId: undefined } : item
      )
    );
  }, []);

  const addRelease = useCallback((release: Omit<Release, 'id'>) => {
    const newRelease: Release = {
      ...release,
      id: `rel${Date.now()}`,
    };
    setReleases((prev) => [...prev, newRelease]);
  }, []);

  const updateRelease = useCallback((releaseId: string, updates: Partial<Release>) => {
    setReleases((prev) =>
      prev.map((r) => (r.id === releaseId ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRelease = useCallback((releaseId: string) => {
    setReleases((prev) => prev.filter((r) => r.id !== releaseId));
  }, []);

  const addGanttTask = useCallback((task: Omit<GanttTask, 'id'>) => {
    const newTask: GanttTask = {
      ...task,
      id: `gt${Date.now()}`,
    };
    setGanttTasks((prev) => [...prev, newTask]);
  }, []);

  const updateGanttTask = useCallback((taskId: string, updates: Partial<GanttTask>) => {
    setGanttTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteGanttTask = useCallback((taskId: string) => {
    setGanttTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const addRisk = useCallback((risk: Omit<Risk, 'id'>) => {
    const newRisk: Risk = {
      ...risk,
      id: `risk${Date.now()}`,
    };
    setRisks((prev) => [...prev, newRisk]);
  }, []);

  const updateRisk = useCallback((riskId: string, updates: Partial<Risk>) => {
    setRisks((prev) =>
      prev.map((risk) => (risk.id === riskId ? { ...risk, ...updates } : risk))
    );
  }, []);

  const deleteRisk = useCallback((riskId: string) => {
    setRisks((prev) => prev.filter((risk) => risk.id !== riskId));
  }, []);

  const addStakeholder = useCallback((stakeholder: Omit<Stakeholder, 'id'>) => {
    const newStakeholder: Stakeholder = {
      ...stakeholder,
      id: `s${Date.now()}`,
    };
    setStakeholders((prev) => [...prev, newStakeholder]);
  }, []);

  const updateStakeholder = useCallback(
    (stakeholderId: string, updates: Partial<Stakeholder>) => {
      setStakeholders((prev) =>
        prev.map((s) => (s.id === stakeholderId ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const deleteStakeholder = useCallback((stakeholderId: string) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== stakeholderId));
  }, []);

  const addRequirement = useCallback((requirement: Omit<Requirement, 'id'>) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: `req${Date.now()}`,
    };
    setRequirements((prev) => [...prev, newRequirement]);
  }, []);

  const updateRequirement = useCallback(
    (requirementId: string, updates: Partial<Requirement>) => {
      setRequirements((prev) =>
        prev.map((r) => (r.id === requirementId ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const deleteRequirement = useCallback((requirementId: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== requirementId));
  }, []);

  const addWbsNode = useCallback((node: Omit<WBSNode, 'id'>) => {
    const newNode: WBSNode = {
      ...node,
      id: `w${Date.now()}`,
    };
    setWbs((prev) => [...prev, newNode]);
  }, []);

  const updateWbsNode = useCallback((nodeId: string, updates: Partial<WBSNode>) => {
    setWbs((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  }, []);

  const deleteWbsNode = useCallback((nodeId: string) => {
    setWbs((prev) => prev.filter((node) => node.id !== nodeId));
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        mode,
        setMode,
        phases,
        tasks,
        setTasks,
        backlog,
        setBacklog,
        sprints,
        releases,
        raci,
        setRaci,
        wbs,
        setWbs,
        risks,
        setRisks,
        stakeholders,
        setStakeholders,
        requirements,
        setRequirements,
        ganttTasks,
        selectedPhase,
        setSelectedPhase,
        resetToSampleData,
        importProjectState,
        cloudProjectId,
        cloudProjectName,
        cloudProjects,
        syncStatus,
        refreshProjectList,
        switchProject,
        createProject,
        renameProject,
        addTask,
        updateTask,
        deleteTask,
        addBacklogItem,
        updateBacklogItem,
        deleteBacklogItem,
        moveBacklogItem,
        reorderBacklog,
        reorderProductBacklog,
        addSprint,
        updateSprint,
        deleteSprint,
        addRelease,
        updateRelease,
        deleteRelease,
        addGanttTask,
        updateGanttTask,
        deleteGanttTask,
        addRisk,
        updateRisk,
        deleteRisk,
        addStakeholder,
        updateStakeholder,
        deleteStakeholder,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        addWbsNode,
        updateWbsNode,
        deleteWbsNode,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
