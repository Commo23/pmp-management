import {
  GitBranch,
  Table2,
  LayoutDashboard,
  BarChart3,
  FileText,
  AlertTriangle,
  Users,
  Target,
  ListTodo,
  Calendar,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export const VIEW_IDS = [
  'flow',
  'kanban',
  'raci',
  'charts',
  'backlog',
  'wbs',
  'risks',
  'stakeholders',
  'requirements',
  'gantt',
  'settings',
] as const;

export type ViewId = (typeof VIEW_IDS)[number];

export interface NavItem {
  id: ViewId;
  path: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { id: 'flow', path: '/flow', label: 'Project Flow', icon: GitBranch },
  { id: 'kanban', path: '/kanban', label: 'Kanban Board', icon: LayoutDashboard },
  { id: 'raci', path: '/raci', label: 'RACI Matrix', icon: Table2 },
  { id: 'charts', path: '/charts', label: 'Charts', icon: BarChart3 },
  { id: 'backlog', path: '/backlog', label: 'Product Backlog', icon: ListTodo },
  { id: 'wbs', path: '/wbs', label: 'WBS', icon: Target },
  { id: 'risks', path: '/risks', label: 'Risk Register', icon: AlertTriangle },
  { id: 'stakeholders', path: '/stakeholders', label: 'Stakeholders', icon: Users },
  { id: 'requirements', path: '/requirements', label: 'Requirements', icon: FileText },
  { id: 'gantt', path: '/gantt', label: 'Timeline', icon: Calendar },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export function isViewId(value: string): value is ViewId {
  return (VIEW_IDS as readonly string[]).includes(value);
}
