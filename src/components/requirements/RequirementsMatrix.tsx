import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { Requirement } from '@/types/project';
import { RequirementDialog } from '@/components/dialogs/RequirementDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

const typeColors = {
  functional: 'bg-primary/20 text-primary',
  'non-functional': 'bg-accent/20 text-accent',
  business: 'bg-warning/20 text-warning',
  technical: 'bg-info/20 text-info',
};

const statusIcons = {
  draft: Clock,
  approved: CheckCircle,
  implemented: CheckCircle,
  verified: CheckCircle,
};

const statusColors = {
  draft: 'text-muted-foreground',
  approved: 'text-info',
  implemented: 'text-warning',
  verified: 'text-success',
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function RequirementsMatrix() {
  const { requirements, tasks, deleteRequirement } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedRequirement(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setDialogOpen(true);
  };

  const handleDeleteClick = (requirementId: string) => {
    setRequirementToDelete(requirementId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (requirementToDelete) {
      deleteRequirement(requirementToDelete);
      setRequirementToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Requirements Traceability</h1>
          <p className="mt-2 text-muted-foreground">
            Track requirements from definition through verification
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          New Requirement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { status: 'draft', label: 'Draft' },
          { status: 'approved', label: 'Approved' },
          { status: 'implemented', label: 'Implemented' },
          { status: 'verified', label: 'Verified' },
        ].map(({ status, label }) => {
          const count = requirements.filter(r => r.status === status).length;
          const Icon = statusIcons[status as keyof typeof statusIcons];
          
          return (
            <div key={status} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className={cn("h-4 w-4", statusColors[status as keyof typeof statusColors])} />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Requirements Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Requirement</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Linked Tasks</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req, index) => {
                const linkedTasks = tasks.filter(t => req.linkedTasks.includes(t.id));
                const StatusIcon = statusIcons[req.status];
                
                return (
                  <tr 
                    key={req.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-primary">{req.code}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{req.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", typeColors[req.type])}>
                        {req.type.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", priorityStyles[req.priority])}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4", statusColors[req.status])} />
                        <span className="text-sm capitalize text-foreground">{req.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {linkedTasks.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {linkedTasks.map(task => (
                            <Badge key={task.id} variant="outline" className="text-xs">
                              {task.title}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No linked tasks</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(req)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(req.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RequirementDialog open={dialogOpen} onOpenChange={setDialogOpen} requirement={selectedRequirement} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Requirement"
        description="Are you sure you want to delete this requirement? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
