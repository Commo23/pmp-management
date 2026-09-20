import { useProject } from '@/contexts/ProjectContext';
import { GanttChart } from './GanttChart';
import { BurndownChart } from './BurndownChart';
import { VelocityChart } from './VelocityChart';
import { Link } from 'react-router-dom';

export function ChartsView() {
  const { mode } = useProject();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Charts</h1>
        <p className="mt-2 text-muted-foreground">
          Visual analytics for tracking project progress
        </p>
      </div>

      <div className="grid gap-8">
        {mode === 'waterfall' && <GanttChart />}

        {mode === 'agile' && (
          <>
            <BurndownChart />
            <VelocityChart />
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Need a phase timeline? Open{' '}
              <Link to="/gantt" className="text-primary underline underline-offset-2">
                Timeline
              </Link>{' '}
              or switch to Waterfall mode for an embedded Gantt.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
