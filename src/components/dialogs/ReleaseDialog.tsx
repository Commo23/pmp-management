import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Release } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface ReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release?: Release;
}

export function ReleaseDialog({ open, onOpenChange, release }: ReleaseDialogProps) {
  const { addRelease, updateRelease, sprints } = useProject();
  const [form, setForm] = useState({
    name: '',
    version: '',
    targetDate: '',
    status: 'planned' as Release['status'],
    sprintIds: [] as string[],
  });

  useEffect(() => {
    if (release) {
      setForm({
        name: release.name,
        version: release.version,
        targetDate: release.targetDate,
        status: release.status,
        sprintIds: [...release.sprints],
      });
    } else {
      setForm({
        name: '',
        version: '1.0.0',
        targetDate: new Date().toISOString().slice(0, 10),
        status: 'planned',
        sprintIds: [],
      });
    }
  }, [release, open]);

  const toggleSprint = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sprintIds: prev.sprintIds.includes(id)
        ? prev.sprintIds.filter((s) => s !== id)
        : [...prev.sprintIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      version: form.version.trim(),
      targetDate: form.targetDate,
      status: form.status,
      sprints: form.sprintIds,
    };
    if (release) updateRelease(release.id, payload);
    else addRelease(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{release ? 'Edit Release' : 'New Release'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rel-name">Name</Label>
            <Input
              id="rel-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rel-ver">Version</Label>
              <Input
                id="rel-ver"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rel-date">Target date</Label>
              <Input
                id="rel-date"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as Release['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Linked sprints</Label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {sprints.length === 0 && (
                <p className="text-xs text-muted-foreground">No sprints yet</p>
              )}
              {sprints.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.sprintIds.includes(s.id)}
                    onChange={() => toggleSprint(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{release ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
