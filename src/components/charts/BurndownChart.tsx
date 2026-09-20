import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { sampleBurndownData } from '@/data/projectData';
import { SampleDataBanner } from './SampleDataBanner';

export function BurndownChart() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sprint Burndown</h2>
        <p className="text-muted-foreground">Track remaining work vs ideal burndown</p>
      </div>

      <SampleDataBanner>
        Sample burndown — day-by-day history is not tracked yet. Chart does not update when you edit
        the backlog.
      </SampleDataBanner>

      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleBurndownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Ideal"
            />
            <Line
              type="monotone"
              dataKey="remaining"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              name="Remaining"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
