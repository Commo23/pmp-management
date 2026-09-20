import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useProject } from '@/contexts/ProjectContext';
import { SampleDataBanner } from './SampleDataBanner';

export function VelocityChart() {
  const { backlog, sprints } = useProject();

  const data = useMemo(
    () =>
      sprints.map((sprint) => {
        const committed = backlog
          .filter((b) => b.sprintId === sprint.id)
          .reduce((sum, b) => sum + b.storyPoints, 0);
        // Completed points are not tracked per sprint yet — use seed velocity when present
        const completed = typeof sprint.velocity === 'number' ? sprint.velocity : committed;
        return {
          sprint: sprint.name,
          committed,
          completed,
        };
      }),
    [backlog, sprints]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Team Velocity</h2>
        <p className="text-muted-foreground">Committed vs completed story points per sprint</p>
      </div>

      <SampleDataBanner>
        Committed points come from live backlog assignments. Completed uses each sprint&apos;s
        velocity field (edit the sprint to update).
      </SampleDataBanner>

      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="sprint" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="committed"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
              name="Committed"
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Completed"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
