import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { GanttTask } from '@/types/project';
import { GanttDialog } from '@/components/dialogs/GanttDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

export function GanttChart() {
  const { ganttTasks, deleteGanttTask } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<GanttTask | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelected(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (task: GanttTask) => {
    setSelected(task);
    setDialogOpen(true);
  };

  if (ganttTasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
            <p className="text-muted-foreground">Editable Gantt — synced with your project</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No timeline items yet. Add a phase bar or milestone to get started.
        </div>
        <GanttDialog open={dialogOpen} onOpenChange={setDialogOpen} task={selected} />
      </div>
    );
  }

  const allDates = ganttTasks.flatMap((t) => [parseISO(t.startDate), parseISO(t.endDate)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = Math.max(differenceInDays(maxDate, minDate) + 1, 1);

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = differenceInDays(parseISO(startDate), minDate);
    const duration = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    const left = (start / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  const phaseColors = {
    init: 'bg-phase-initiation',
    plan: 'bg-phase-planning',
    exec: 'bg-phase-execution',
    mon: 'bg-phase-monitoring',
    close: 'bg-phase-closing',
    vision: 'bg-phase-initiation',
    'release-plan': 'bg-phase-planning',
    sprint: 'bg-phase-execution',
    review: 'bg-phase-monitoring',
    release: 'bg-phase-closing',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
          <p className="text-muted-foreground">Editable Gantt — synced with your project</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{format(minDate, 'MMM d, yyyy')}</span>
            <span>{format(maxDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {ganttTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="w-44 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {task.isMilestone && <span className="h-2 w-2 rotate-45 bg-warning" />}
                  <span
                    className={cn(
                      'text-sm truncate',
                      task.isMilestone ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {task.name}
                  </span>
                </div>
              </div>

              <div className="relative h-8 flex-1 rounded bg-muted/50">
                {task.isMilestone ? (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 bg-warning shadow-md"
                    style={{ left: getBarStyle(task.startDate, task.endDate).left }}
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute top-1 bottom-1 rounded shadow-sm transition-all',
                      phaseColors[task.phaseId as keyof typeof phaseColors] || 'bg-primary'
                    )}
                    style={getBarStyle(task.startDate, task.endDate)}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-foreground/20"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="w-12 flex-shrink-0 text-right text-sm text-muted-foreground">
                {task.progress}%
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(task)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => {
                    setToDelete(task.id);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GanttDialog open={dialogOpen} onOpenChange={setDialogOpen} task={selected} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete timeline item"
        description="Remove this bar or milestone from the Gantt chart?"
        onConfirm={() => {
          if (toDelete) deleteGanttTask(toDelete);
          setToDelete(null);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
