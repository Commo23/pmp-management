import { Task } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVertical, User, Pencil, Trash2 } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function KanbanCard({ task, onDragStart, onEdit, onDelete }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 active:cursor-grabbing active:opacity-70"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Badge className={cn("text-xs", priorityStyles[task.priority])}>
          {task.priority}
        </Badge>
      </div>
      
      <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
      
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
        {task.description}
      </p>
      
      {task.assignee && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          {task.assignee}
        </div>
      )}
      
      {task.storyPoints && (
        <div className="mt-2 flex justify-end">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
            {task.storyPoints}
          </span>
        </div>
      )}
    </div>
  );
}
