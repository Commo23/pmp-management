import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Sprint } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface SprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: Sprint;
}

export function SprintDialog({ open, onOpenChange, sprint }: SprintDialogProps) {
  const { addSprint, updateSprint } = useProject();
  const [form, setForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    velocity: '',
  });

  useEffect(() => {
    if (sprint) {
      setForm({
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        velocity: sprint.velocity?.toString() ?? '',
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setForm({
        name: '',
        goal: '',
        startDate: today,
        endDate: today,
        velocity: '',
      });
    }
  }, [sprint, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      goal: form.goal.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      velocity: form.velocity ? Number(form.velocity) : undefined,
      items: sprint?.items ?? [],
    };
    if (sprint) updateSprint(sprint.id, payload);
    else addSprint(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sprint ? 'Edit Sprint' : 'New Sprint'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Name</Label>
            <Input
              id="sprint-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Goal</Label>
            <Textarea
              id="sprint-goal"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sprint-start">Start</Label>
              <Input
                id="sprint-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-end">End</Label>
              <Input
                id="sprint-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprint-vel">Completed velocity (pts)</Label>
            <Input
              id="sprint-vel"
              type="number"
              min={0}
              value={form.velocity}
              onChange={(e) => setForm({ ...form, velocity: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{sprint ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
