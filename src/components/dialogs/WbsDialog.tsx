import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WBSNode } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface WbsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node?: WBSNode;
  defaultParentId?: string;
}

export function WbsDialog({ open, onOpenChange, node, defaultParentId }: WbsDialogProps) {
  const { wbs, addWbsNode, updateWbsNode } = useProject();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: '' as string,
    level: 0,
  });

  useEffect(() => {
    if (node) {
      setFormData({
        code: node.code,
        name: node.name,
        description: node.description,
        parentId: node.parentId || '',
        level: node.level,
      });
    } else {
      const parent = wbs.find((n) => n.id === defaultParentId);
      setFormData({
        code: '',
        name: '',
        description: '',
        parentId: defaultParentId || '',
        level: parent ? parent.level + 1 : 0,
      });
    }
  }, [node, defaultParentId, wbs, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const parentId = formData.parentId || undefined;
    const parent = wbs.find((n) => n.id === parentId);
    const level = parent ? parent.level + 1 : 0;

    if (node) {
      updateWbsNode(node.id, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId,
        level,
      });
    } else {
      addWbsNode({
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId,
        children: [],
        level,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{node ? 'Edit WBS Node' : 'New WBS Node'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wbs-code">Code</Label>
            <Input
              id="wbs-code"
              value={formData.code}
              onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
              placeholder="1.1.1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wbs-name">Name</Label>
            <Input
              id="wbs-name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wbs-desc">Description</Label>
            <Textarea
              id="wbs-desc"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Parent</Label>
            <Select
              value={formData.parentId || '__root__'}
              onValueChange={(v) =>
                setFormData((p) => ({
                  ...p,
                  parentId: v === '__root__' ? '' : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Root" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__root__">Root (level 0)</SelectItem>
                {wbs
                  .filter((n) => n.id !== node?.id)
                  .map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.code} — {n.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{node ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
