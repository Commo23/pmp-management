import { 
  Phase, Task, BacklogItem, Sprint, Release, RACIEntry, 
  WBSNode, Risk, Stakeholder, Requirement, GanttTask,
  BurndownPoint, VelocityData 
} from '@/types/project';

// Waterfall Phases
export const waterfallPhases: Phase[] = [
  {
    id: 'init',
    name: 'Initiation',
    type: 'initiation',
    description: 'Define the project at a high level and obtain authorization to start.',
    inputs: ['Business Case', 'Benefits Management Plan', 'Agreements', 'Enterprise Environmental Factors'],
    outputs: ['Project Charter', 'Stakeholder Register', 'Assumption Log'],
    tools: ['Expert Judgment', 'Data Gathering', 'Interpersonal Skills', 'Meetings'],
    order: 1
  },
  {
    id: 'plan',
    name: 'Planning',
    type: 'planning',
    description: 'Establish the scope, refine objectives, and define actions required.',
    inputs: ['Project Charter', 'Organizational Process Assets', 'Approved Change Requests'],
    outputs: ['Project Management Plan', 'WBS', 'Schedule Baseline', 'Cost Baseline', 'Risk Register'],
    tools: ['Decomposition', 'Critical Path Method', 'Bottom-Up Estimating', 'SWOT Analysis'],
    order: 2
  },
  {
    id: 'exec',
    name: 'Execution',
    type: 'execution',
    description: 'Complete the work defined in the project management plan.',
    inputs: ['Project Management Plan', 'Project Documents', 'Approved Change Requests'],
    outputs: ['Deliverables', 'Work Performance Data', 'Issue Log Updates', 'Change Requests'],
    tools: ['PMIS', 'Virtual Teams', 'Conflict Management', 'Recognition and Rewards'],
    order: 3
  },
  {
    id: 'mon',
    name: 'Monitoring & Control',
    type: 'monitoring',
    description: 'Track, review, and regulate progress and performance.',
    inputs: ['Project Management Plan', 'Work Performance Data', 'Agreements'],
    outputs: ['Work Performance Reports', 'Change Requests', 'Project Document Updates'],
    tools: ['Earned Value Analysis', 'Trend Analysis', 'Variance Analysis', 'Root Cause Analysis'],
    order: 4
  },
  {
    id: 'close',
    name: 'Closing',
    type: 'closing',
    description: 'Finalize all activities and formally close the project.',
    inputs: ['Project Charter', 'Project Management Plan', 'Accepted Deliverables'],
    outputs: ['Final Product/Service/Result', 'Final Report', 'Organizational Process Assets Updates'],
    tools: ['Expert Judgment', 'Data Analysis', 'Meetings'],
    order: 5
  }
];

// Agile Phases
export const agilePhases: Phase[] = [
  {
    id: 'vision',
    name: 'Product Vision',
    type: 'initiation',
    description: 'Define the product vision and initial backlog.',
    inputs: ['Market Research', 'Stakeholder Input', 'Business Goals'],
    outputs: ['Product Vision', 'Initial Product Backlog', 'Release Roadmap'],
    tools: ['User Story Mapping', 'Design Thinking', 'Elevator Pitch'],
    order: 1
  },
  {
    id: 'release-plan',
    name: 'Release Planning',
    type: 'planning',
    description: 'Plan releases and prioritize the product backlog.',
    inputs: ['Product Backlog', 'Team Velocity', 'Stakeholder Priorities'],
    outputs: ['Release Plan', 'Prioritized Backlog', 'Definition of Done'],
    tools: ['Planning Poker', 'MoSCoW Prioritization', 'Story Splitting'],
    order: 2
  },
  {
    id: 'sprint',
    name: 'Sprint Execution',
    type: 'execution',
    description: 'Execute sprints to deliver incremental value.',
    inputs: ['Sprint Backlog', 'Definition of Done', 'Team Capacity'],
    outputs: ['Working Increment', 'Updated Burndown', 'Sprint Review Notes'],
    tools: ['Daily Standups', 'Pair Programming', 'TDD', 'CI/CD'],
    order: 3
  },
  {
    id: 'review',
    name: 'Sprint Review & Retro',
    type: 'monitoring',
    description: 'Review the increment and improve the process.',
    inputs: ['Working Increment', 'Sprint Goals', 'Stakeholder Feedback'],
    outputs: ['Updated Backlog', 'Process Improvements', 'Velocity Update'],
    tools: ['Demo Sessions', 'Retrospective Techniques', 'Feedback Loops'],
    order: 4
  },
  {
    id: 'release',
    name: 'Release',
    type: 'closing',
    description: 'Release the product increment to production.',
    inputs: ['Tested Increment', 'Release Checklist', 'Documentation'],
    outputs: ['Production Release', 'Release Notes', 'Updated Documentation'],
    tools: ['Feature Flags', 'Blue-Green Deployment', 'Rollback Procedures'],
    order: 5
  }
];

// Sample Tasks
export const sampleTasks: Task[] = [
  { id: 't1', title: 'Create Project Charter', description: 'Document project objectives and stakeholders', status: 'done', priority: 'high', phaseId: 'init', assignee: 'PM', createdAt: '2024-01-01' },
  { id: 't2', title: 'Identify Stakeholders', description: 'Create stakeholder register', status: 'done', priority: 'high', phaseId: 'init', assignee: 'PM', createdAt: '2024-01-02' },
  { id: 't3', title: 'Develop WBS', description: 'Break down project scope', status: 'in-progress', priority: 'high', phaseId: 'plan', assignee: 'PM', createdAt: '2024-01-05' },
  { id: 't4', title: 'Create Schedule', description: 'Develop project timeline', status: 'todo', priority: 'high', phaseId: 'plan', assignee: 'PM', createdAt: '2024-01-06' },
  { id: 't5', title: 'Risk Assessment', description: 'Identify and analyze risks', status: 'todo', priority: 'medium', phaseId: 'plan', assignee: 'Risk Lead', createdAt: '2024-01-07' },
  { id: 't6', title: 'Team Kickoff', description: 'Launch project execution', status: 'backlog', priority: 'medium', phaseId: 'exec', assignee: 'PM', createdAt: '2024-01-10' },
  { id: 't7', title: 'Quality Reviews', description: 'Conduct quality audits', status: 'backlog', priority: 'medium', phaseId: 'mon', assignee: 'QA Lead', createdAt: '2024-01-15' },
  { id: 't8', title: 'Lessons Learned', description: 'Document project learnings', status: 'backlog', priority: 'low', phaseId: 'close', assignee: 'PM', createdAt: '2024-01-20' },
];

// Sample Backlog Items (sprintId aligned with sampleSprints.items)
export const sampleBacklog: BacklogItem[] = [
  { id: 'b1', title: 'User Authentication', description: 'Implement login/logout functionality', storyPoints: 8, priority: 'high', type: 'feature', sprintId: 'sp1', order: 1 },
  { id: 'b2', title: 'Dashboard UI', description: 'Create main dashboard interface', storyPoints: 13, priority: 'high', type: 'feature', sprintId: 'sp1', order: 2 },
  { id: 'b3', title: 'API Integration', description: 'Connect to backend services', storyPoints: 5, priority: 'medium', type: 'technical', sprintId: 'sp2', order: 3 },
  { id: 'b4', title: 'Performance Optimization', description: 'Improve load times', storyPoints: 8, priority: 'medium', type: 'technical', sprintId: 'sp2', order: 4 },
  { id: 'b5', title: 'Mobile Responsive', description: 'Ensure mobile compatibility', storyPoints: 5, priority: 'medium', type: 'feature', sprintId: 'sp3', order: 5 },
  { id: 'b6', title: 'Fix Login Bug', description: 'Address session timeout issue', storyPoints: 3, priority: 'high', type: 'bug', sprintId: 'sp2', order: 6 },
  { id: 'b7', title: 'Database Migration', description: 'Migrate to new schema', storyPoints: 13, priority: 'low', type: 'technical', order: 7 },
  { id: 'b8', title: 'User Settings', description: 'Add user preferences page', storyPoints: 5, priority: 'low', type: 'feature', sprintId: 'sp3', order: 8 },
];

// Sample Sprints
export const sampleSprints: Sprint[] = [
  { id: 'sp1', name: 'Sprint 1', goal: 'Core authentication and dashboard', startDate: '2024-01-15', endDate: '2024-01-29', velocity: 21, items: ['b1', 'b2'] },
  { id: 'sp2', name: 'Sprint 2', goal: 'API integration and optimization', startDate: '2024-01-29', endDate: '2024-02-12', velocity: 16, items: ['b3', 'b4', 'b6'] },
  { id: 'sp3', name: 'Sprint 3', goal: 'Mobile and settings', startDate: '2024-02-12', endDate: '2024-02-26', items: ['b5', 'b8'] },
];

// Sample Releases
export const sampleReleases: Release[] = [
  { id: 'rel1', name: 'MVP Release', version: '1.0.0', targetDate: '2024-02-26', sprints: ['sp1', 'sp2', 'sp3'], status: 'in-progress' },
  { id: 'rel2', name: 'Feature Update', version: '1.1.0', targetDate: '2024-04-01', sprints: [], status: 'planned' },
];

// RACI Matrix Data — waterfall + agile phase IDs
export const sampleRaci: RACIEntry[] = [
  // Waterfall
  { phaseId: 'init', role: 'Project Manager', responsibility: 'R' },
  { phaseId: 'init', role: 'Sponsor', responsibility: 'A' },
  { phaseId: 'init', role: 'Team Members', responsibility: 'I' },
  { phaseId: 'init', role: 'Stakeholders', responsibility: 'C' },
  { phaseId: 'plan', role: 'Project Manager', responsibility: 'A' },
  { phaseId: 'plan', role: 'Sponsor', responsibility: 'I' },
  { phaseId: 'plan', role: 'Team Members', responsibility: 'R' },
  { phaseId: 'plan', role: 'Stakeholders', responsibility: 'C' },
  { phaseId: 'exec', role: 'Project Manager', responsibility: 'A' },
  { phaseId: 'exec', role: 'Sponsor', responsibility: 'I' },
  { phaseId: 'exec', role: 'Team Members', responsibility: 'R' },
  { phaseId: 'exec', role: 'Stakeholders', responsibility: 'I' },
  { phaseId: 'mon', role: 'Project Manager', responsibility: 'R' },
  { phaseId: 'mon', role: 'Sponsor', responsibility: 'A' },
  { phaseId: 'mon', role: 'Team Members', responsibility: 'C' },
  { phaseId: 'mon', role: 'Stakeholders', responsibility: 'I' },
  { phaseId: 'close', role: 'Project Manager', responsibility: 'R' },
  { phaseId: 'close', role: 'Sponsor', responsibility: 'A' },
  { phaseId: 'close', role: 'Team Members', responsibility: 'I' },
  { phaseId: 'close', role: 'Stakeholders', responsibility: 'I' },
  // Agile
  { phaseId: 'vision', role: 'Product Owner', responsibility: 'A' },
  { phaseId: 'vision', role: 'Scrum Master', responsibility: 'C' },
  { phaseId: 'vision', role: 'Development Team', responsibility: 'C' },
  { phaseId: 'vision', role: 'Stakeholders', responsibility: 'I' },
  { phaseId: 'release-plan', role: 'Product Owner', responsibility: 'A' },
  { phaseId: 'release-plan', role: 'Scrum Master', responsibility: 'R' },
  { phaseId: 'release-plan', role: 'Development Team', responsibility: 'C' },
  { phaseId: 'release-plan', role: 'Stakeholders', responsibility: 'C' },
  { phaseId: 'sprint', role: 'Product Owner', responsibility: 'C' },
  { phaseId: 'sprint', role: 'Scrum Master', responsibility: 'A' },
  { phaseId: 'sprint', role: 'Development Team', responsibility: 'R' },
  { phaseId: 'sprint', role: 'Stakeholders', responsibility: 'I' },
  { phaseId: 'review', role: 'Product Owner', responsibility: 'A' },
  { phaseId: 'review', role: 'Scrum Master', responsibility: 'R' },
  { phaseId: 'review', role: 'Development Team', responsibility: 'C' },
  { phaseId: 'review', role: 'Stakeholders', responsibility: 'C' },
  { phaseId: 'release', role: 'Product Owner', responsibility: 'A' },
  { phaseId: 'release', role: 'Scrum Master', responsibility: 'C' },
  { phaseId: 'release', role: 'Development Team', responsibility: 'R' },
  { phaseId: 'release', role: 'DevOps', responsibility: 'R' },
];

// WBS Data
export const sampleWbs: WBSNode[] = [
  { id: 'w1', code: '1', name: 'Project Management', description: 'Overall project management activities', level: 0, children: ['w2', 'w3'] },
  { id: 'w2', code: '1.1', name: 'Planning', description: 'Project planning activities', parentId: 'w1', level: 1, children: ['w4', 'w5'] },
  { id: 'w3', code: '1.2', name: 'Control', description: 'Project control activities', parentId: 'w1', level: 1, children: [] },
  { id: 'w4', code: '1.1.1', name: 'Schedule Development', description: 'Create project schedule', parentId: 'w2', level: 2, children: [] },
  { id: 'w5', code: '1.1.2', name: 'Budget Estimation', description: 'Estimate project costs', parentId: 'w2', level: 2, children: [] },
  { id: 'w6', code: '2', name: 'Product Development', description: 'Core product development', level: 0, children: ['w7', 'w8'] },
  { id: 'w7', code: '2.1', name: 'Design', description: 'Product design phase', parentId: 'w6', level: 1, children: [] },
  { id: 'w8', code: '2.2', name: 'Implementation', description: 'Product implementation', parentId: 'w6', level: 1, children: [] },
];

// Risk Register
export const sampleRisks: Risk[] = [
  { id: 'risk1', title: 'Resource Availability', description: 'Key team members may not be available', probability: 'medium', impact: 'high', score: 12, response: 'mitigate', owner: 'PM', status: 'mitigating' },
  { id: 'risk2', title: 'Scope Creep', description: 'Uncontrolled changes to project scope', probability: 'high', impact: 'high', score: 16, response: 'avoid', owner: 'PM', status: 'analyzing' },
  { id: 'risk3', title: 'Technical Complexity', description: 'Underestimated technical challenges', probability: 'medium', impact: 'medium', score: 9, response: 'mitigate', owner: 'Tech Lead', status: 'identified' },
  { id: 'risk4', title: 'Budget Overrun', description: 'Exceeding allocated budget', probability: 'low', impact: 'critical', score: 8, response: 'transfer', owner: 'PM', status: 'analyzing' },
];

// Stakeholders
export const sampleStakeholders: Stakeholder[] = [
  { id: 's1', name: 'John Smith', role: 'Executive Sponsor', organization: 'Executive Team', influence: 'high', interest: 'high', engagementLevel: 'leading' },
  { id: 's2', name: 'Sarah Johnson', role: 'Product Owner', organization: 'Product', influence: 'high', interest: 'high', engagementLevel: 'supportive' },
  { id: 's3', name: 'Mike Williams', role: 'Tech Lead', organization: 'Engineering', influence: 'medium', interest: 'high', engagementLevel: 'supportive' },
  { id: 's4', name: 'Emily Brown', role: 'QA Manager', organization: 'Quality', influence: 'medium', interest: 'medium', engagementLevel: 'neutral' },
  { id: 's5', name: 'David Lee', role: 'End User Rep', organization: 'Operations', influence: 'low', interest: 'high', engagementLevel: 'supportive' },
];

// Requirements Traceability Matrix
export const sampleRequirements: Requirement[] = [
  { id: 'req1', code: 'FR-001', title: 'User Login', description: 'Users must be able to log in securely', type: 'functional', priority: 'high', status: 'implemented', linkedTasks: ['t1'] },
  { id: 'req2', code: 'FR-002', title: 'Dashboard View', description: 'Users must see a project dashboard', type: 'functional', priority: 'high', status: 'approved', linkedTasks: ['t3'] },
  { id: 'req3', code: 'NFR-001', title: 'Performance', description: 'Page load time under 2 seconds', type: 'non-functional', priority: 'medium', status: 'draft', linkedTasks: [] },
  { id: 'req4', code: 'BR-001', title: 'Reporting', description: 'Generate weekly status reports', type: 'business', priority: 'medium', status: 'approved', linkedTasks: ['t7'] },
];

// Gantt Chart Data
export const sampleGanttTasks: GanttTask[] = [
  { id: 'g1', name: 'Project Initiation', startDate: '2024-01-01', endDate: '2024-01-14', progress: 100, phaseId: 'init' },
  { id: 'g2', name: 'Kickoff Meeting', startDate: '2024-01-05', endDate: '2024-01-05', progress: 100, phaseId: 'init', isMilestone: true },
  { id: 'g3', name: 'Planning Phase', startDate: '2024-01-15', endDate: '2024-02-14', progress: 60, phaseId: 'plan', dependencies: ['g1'] },
  { id: 'g4', name: 'WBS Complete', startDate: '2024-01-25', endDate: '2024-01-25', progress: 100, phaseId: 'plan', isMilestone: true },
  { id: 'g5', name: 'Execution Phase', startDate: '2024-02-15', endDate: '2024-04-30', progress: 25, phaseId: 'exec', dependencies: ['g3'] },
  { id: 'g6', name: 'MVP Release', startDate: '2024-02-26', endDate: '2024-02-26', progress: 0, phaseId: 'exec', isMilestone: true },
  { id: 'g7', name: 'Monitoring', startDate: '2024-02-15', endDate: '2024-05-15', progress: 10, phaseId: 'mon', dependencies: ['g3'] },
  { id: 'g8', name: 'Closing Phase', startDate: '2024-05-01', endDate: '2024-05-31', progress: 0, phaseId: 'close', dependencies: ['g5', 'g7'] },
];

// Burndown Chart Data
export const sampleBurndownData: BurndownPoint[] = [
  { date: 'Day 1', remaining: 34, ideal: 34 },
  { date: 'Day 2', remaining: 32, ideal: 31.4 },
  { date: 'Day 3', remaining: 30, ideal: 28.8 },
  { date: 'Day 4', remaining: 28, ideal: 26.2 },
  { date: 'Day 5', remaining: 25, ideal: 23.6 },
  { date: 'Day 6', remaining: 22, ideal: 21 },
  { date: 'Day 7', remaining: 20, ideal: 18.4 },
  { date: 'Day 8', remaining: 18, ideal: 15.8 },
  { date: 'Day 9', remaining: 14, ideal: 13.2 },
  { date: 'Day 10', remaining: 10, ideal: 10.6 },
];

// Velocity Chart Data
export const sampleVelocityData: VelocityData[] = [
  { sprint: 'Sprint 1', committed: 21, completed: 21 },
  { sprint: 'Sprint 2', committed: 18, completed: 16 },
  { sprint: 'Sprint 3', committed: 15, completed: 15 },
  { sprint: 'Sprint 4', committed: 20, completed: 18 },
  { sprint: 'Sprint 5', committed: 18, completed: 20 },
];

// Project Roles
export const projectRoles = [
  'Project Manager',
  'Sponsor',
  'Team Members',
  'Scrum Master',
  'Product Owner',
  'Stakeholders',
];

// Agile Roles
export const agileRoles = [
  'Product Owner',
  'Scrum Master',
  'Development Team',
  'Stakeholders',
  'DevOps',
];
