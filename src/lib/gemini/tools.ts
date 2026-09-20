import type { AppContextInput } from '@/lib/gemini/context';

export type ContextDomain =
  | 'overview'
  | 'tasks'
  | 'backlog'
  | 'risks'
  | 'stakeholders'
  | 'requirements'
  | 'wbs'
  | 'raci'
  | 'phases'
  | 'charts';

const ROUTE_DOMAINS: Record<string, ContextDomain[]> = {
  '/flow': ['phases', 'overview'],
  '/kanban': ['tasks', 'overview'],
  '/backlog': ['backlog', 'overview'],
  '/risks': ['risks', 'overview'],
  '/stakeholders': ['stakeholders', 'overview'],
  '/requirements': ['requirements', 'tasks', 'overview'],
  '/wbs': ['wbs', 'overview'],
  '/raci': ['raci', 'phases', 'overview'],
  '/charts': ['charts', 'backlog', 'tasks', 'overview'],
  '/gantt': ['phases', 'tasks', 'overview'],
  '/settings': ['overview'],
};

const KEYWORD_DOMAINS: Array<{ re: RegExp; domains: ContextDomain[] }> = [
  { re: /\b(tâche|task|kanban|todo|in-progress|review|assignee)\b/i, domains: ['tasks'] },
  { re: /\b(backlog|sprint|story.?point|feature|bug|spike)\b/i, domains: ['backlog'] },
  { re: /\b(risque|risk|mitigat|score|probabilit|impact)\b/i, domains: ['risks'] },
  { re: /\b(stakeholder|partie prenante|influence|engagement)\b/i, domains: ['stakeholders'] },
  { re: /\b(exigence|requirement|rtm|traceabilit|FR-|NFR-)\b/i, domains: ['requirements'] },
  { re: /\b(wbs|décomposition|livrable|work breakdown)\b/i, domains: ['wbs'] },
  { re: /\b(raci|responsable|accountable|consulted|informed)\b/i, domains: ['raci'] },
  { re: /\b(phase|waterfall|agile|initiation|planning|execution|closing|pmbok)\b/i, domains: ['phases'] },
  { re: /\b(gantt|burndown|velocity|chart|timeline|graphique)\b/i, domains: ['charts', 'backlog'] },
];

export function resolveContextDomains(path: string, question: string): ContextDomain[] {
  const set = new Set<ContextDomain>(['overview']);

  const routeKey = Object.keys(ROUTE_DOMAINS).find((r) => path === r || path.startsWith(r + '/'));
  if (routeKey) {
    ROUTE_DOMAINS[routeKey].forEach((d) => set.add(d));
  }

  for (const { re, domains } of KEYWORD_DOMAINS) {
    if (re.test(question)) domains.forEach((d) => set.add(d));
  }

  // Broad questions → full useful set (FR + EN keywords)
  if (
    /\b(tout|résume|overview|global|projet entier|état du projet|summarize|entire project|project status)\b/i.test(
      question
    )
  ) {
    (['tasks', 'backlog', 'risks', 'stakeholders', 'requirements', 'wbs', 'raci', 'phases'] as ContextDomain[]).forEach(
      (d) => set.add(d)
    );
  }

  return Array.from(set);
}

export function getSuggestionsForRoute(path: string): string[] {
  if (path.includes('risk')) {
    return [
      'Which risks have a score ≥ 12?',
      'Who owns the most critical risk?',
      'Summarize the risk register',
    ];
  }
  if (path.includes('kanban')) {
    return [
      'How many tasks per status?',
      'Which tasks are in progress?',
      'List high-priority tasks',
    ];
  }
  if (path.includes('backlog')) {
    return [
      'Summarize the backlog by sprint',
      'How many story points in total?',
      'Which items are still unassigned?',
    ];
  }
  if (path.includes('stakeholder')) {
    return [
      'Who has high influence?',
      'Summarize the Power/Interest matrix',
      'Who is resistant or unaware?',
    ];
  }
  if (path.includes('requirement')) {
    return [
      'Which requirements are still draft?',
      'List requirements with no linked tasks',
      'Summarize the RTM',
    ];
  }
  if (path.includes('wbs')) {
    return ['How many WBS nodes?', 'List level-0 elements', 'Explain the WBS structure'];
  }
  if (path.includes('raci')) {
    return [
      'Who is Accountable for Initiation?',
      'Summarize the RACI matrix',
      'Are there any empty cells?',
    ];
  }
  if (path.includes('flow')) {
    return [
      'Explain the Planning phase',
      'Waterfall vs Agile difference in the app',
      'What are the Closing outputs?',
    ];
  }
  if (path.includes('gantt') || path.includes('chart')) {
    return [
      'What is the task progress status?',
      'Summarize the project for a status meeting',
      'Which risks are blocking the schedule?',
    ];
  }
  return [
    'Summarize the project status',
    'How many critical risks?',
    'Which tasks are stuck by status?',
  ];
}

/** Build a focused payload for the model (route + question tools). */
export function buildFocusedPayload(input: AppContextInput, question: string) {
  const domains = resolveContextDomains(input.currentPath, question);
  const base = {
    app: 'PMP Flow Designer',
    mode: input.mode,
    currentRoute: input.currentPath,
    selectedPhaseId: input.selectedPhaseId ?? null,
    focusDomains: domains,
  };

  const payload: Record<string, unknown> = { ...base };

  if (domains.includes('overview') || domains.includes('phases')) {
    payload.phases = input.phases.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      order: p.order,
      inputs: p.inputs,
      outputs: p.outputs,
      tools: p.tools,
    }));
  }

  if (domains.includes('overview')) {
    payload.counts = {
      tasks: input.tasks.length,
      backlog: input.backlog.length,
      backlogPoints: input.backlog.reduce((s, b) => s + b.storyPoints, 0),
      risks: input.risks.length,
      criticalRisks: input.risks.filter((r) => r.score >= 12).length,
      stakeholders: input.stakeholders.length,
      requirements: input.requirements.length,
      wbsNodes: input.wbs.length,
    };
  }

  if (domains.includes('tasks')) {
    payload.tasks = input.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      phaseId: t.phaseId,
      assignee: t.assignee ?? null,
    }));
  }

  if (domains.includes('backlog')) {
    payload.backlog = input.backlog.map((b) => ({
      id: b.id,
      title: b.title,
      points: b.storyPoints,
      priority: b.priority,
      type: b.type,
      sprintId: b.sprintId ?? null,
    }));
  }

  if (domains.includes('risks')) {
    payload.risks = input.risks.map((r) => ({
      id: r.id,
      title: r.title,
      probability: r.probability,
      impact: r.impact,
      score: r.score,
      response: r.response,
      status: r.status,
      owner: r.owner,
    }));
  }

  if (domains.includes('stakeholders')) {
    payload.stakeholders = input.stakeholders.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      influence: s.influence,
      interest: s.interest,
      engagement: s.engagementLevel,
    }));
  }

  if (domains.includes('requirements')) {
    payload.requirements = input.requirements.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      type: r.type,
      priority: r.priority,
      status: r.status,
      linkedTasks: r.linkedTasks,
    }));
  }

  if (domains.includes('wbs')) {
    payload.wbs = input.wbs.map((n) => ({
      id: n.id,
      code: n.code,
      name: n.name,
      level: n.level,
      parentId: n.parentId ?? null,
      description: n.description,
    }));
  }

  if (domains.includes('raci')) {
    payload.raci = input.raci;
  }

  if (domains.includes('charts')) {
    payload.chartsNote =
      'Gantt is editable and synced. Burndown is still sample day-by-day. Velocity committed = live backlog; completed = sprint.velocity.';
  }

  return { domains, json: JSON.stringify(payload) };
}
