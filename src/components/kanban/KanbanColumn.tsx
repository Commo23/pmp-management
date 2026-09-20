import { Task, TaskStatus } from '@/types/project';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const statusStyles = {
  'backlog': 'border-t-status-backlog',
  'todo': 'border-t-status-todo',
  'in-progress': 'border-t-status-progress',
  'review': 'border-t-status-review',
  'done': 'border-t-status-done',
};

export function KanbanColumn({
  title,
  status,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex min-h-[500px] w-64 flex-shrink-0 flex-col rounded-xl border border-border bg-muted/30 border-t-4",
        statusStyles[status]
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
          {onAddTask && (
            <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={onAddTask}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 p-3 overflow-y-auto scrollbar-thin">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onEdit={() => onEditTask?.(task)}
            onDelete={() => onDeleteTask?.(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
