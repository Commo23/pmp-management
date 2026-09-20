import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProject } from '@/contexts/ProjectContext';
import { navigationItems } from '@/lib/navigation';

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const { mode } = useProject();

  return (
    <div className={cn('flex h-full flex-col gap-2 p-4', className)}>
      <div className="mb-2 flex items-center gap-2 px-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            mode === 'waterfall' ? 'bg-accent' : 'bg-primary'
          )}
        />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {mode} Mode
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary rounded-l-none'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Tip:</span> click a phase
          in the flow to see its inputs, outputs, and tools.
        </p>
      </div>
    </div>
  );
}
