import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { GanttTask } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface GanttDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: GanttTask;
}

export function GanttDialog({ open, onOpenChange, task }: GanttDialogProps) {
  const { addGanttTask, updateGanttTask, phases } = useProject();
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    progress: '0',
    phaseId: '',
    isMilestone: false,
  });

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: String(task.progress),
        phaseId: task.phaseId,
        isMilestone: Boolean(task.isMilestone),
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setForm({
        name: '',
        startDate: today,
        endDate: today,
        progress: '0',
        phaseId: phases[0]?.id ?? '',
        isMilestone: false,
      });
    }
  }, [task, open, phases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0));
    const payload = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.isMilestone ? form.startDate : form.endDate,
      progress: form.isMilestone ? 100 : progress,
      phaseId: form.phaseId,
      isMilestone: form.isMilestone,
      dependencies: task?.dependencies,
    };
    if (task) updateGanttTask(task.id, payload);
    else addGanttTask(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Timeline Item' : 'New Timeline Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gantt-name">Name</Label>
            <Input
              id="gantt-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phase</Label>
            <Select
              value={form.phaseId}
              onValueChange={(v) => setForm({ ...form, phaseId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gantt-start">Start</Label>
              <Input
                id="gantt-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            {!form.isMilestone && (
              <div className="space-y-2">
                <Label htmlFor="gantt-end">End</Label>
                <Input
                  id="gantt-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
          {!form.isMilestone && (
            <div className="space-y-2">
              <Label htmlFor="gantt-progress">Progress (%)</Label>
              <Input
                id="gantt-progress"
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: e.target.value })}
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="gantt-milestone">Milestone</Label>
            <Switch
              id="gantt-milestone"
              checked={form.isMilestone}
              onCheckedChange={(v) => setForm({ ...form, isMilestone: v })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
