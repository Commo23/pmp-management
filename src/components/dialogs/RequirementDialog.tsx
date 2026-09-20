import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Requirement, TaskPriority } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface RequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement?: Requirement;
}

export function RequirementDialog({ open, onOpenChange, requirement }: RequirementDialogProps) {
  const { addRequirement, updateRequirement, tasks } = useProject();
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'functional' as Requirement['type'],
    priority: 'medium' as TaskPriority,
    status: 'draft' as Requirement['status'],
    linkedTasks: [] as string[],
  });

  useEffect(() => {
    if (requirement) {
      setFormData({
        code: requirement.code,
        title: requirement.title,
        description: requirement.description,
        type: requirement.type,
        priority: requirement.priority,
        status: requirement.status,
        linkedTasks: [...requirement.linkedTasks],
      });
    } else {
      setFormData({
        code: `REQ-${Date.now().toString().slice(-4)}`,
        title: '',
        description: '',
        type: 'functional',
        priority: 'medium',
        status: 'draft',
        linkedTasks: [],
      });
    }
  }, [requirement, open]);

  const toggleTask = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedTasks: prev.linkedTasks.includes(taskId)
        ? prev.linkedTasks.filter((id) => id !== taskId)
        : [...prev.linkedTasks, taskId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reqData = {
      code: formData.code,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      status: formData.status,
      linkedTasks: formData.linkedTasks,
    };

    if (requirement) {
      updateRequirement(requirement.id, reqData);
    } else {
      addRequirement(reqData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{requirement ? 'Edit Requirement' : 'New Requirement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as Requirement['type'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="non-functional">Non-functional</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as Requirement['status'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Linked tasks</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground">No tasks available</p>
              )}
              {tasks.map((task) => (
                <label key={task.id} className="flex cursor-pointer items-start gap-2 text-sm">
                  <Checkbox
                    checked={formData.linkedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium text-foreground">{task.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{task.status}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{requirement ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
