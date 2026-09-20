import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { WBSNode } from '@/types/project';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, FolderOpen, File, Plus, Pencil, Trash2 } from 'lucide-react';
import { WbsDialog } from '@/components/dialogs/WbsDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

export function WBSView() {
  const { wbs, deleteWbsNode } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WBSNode | undefined>();
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const rootNodes = wbs.filter((node) => !node.parentId);

  const handleAdd = (parentId?: string) => {
    setSelectedNode(undefined);
    setDefaultParentId(parentId);
    setDialogOpen(true);
  };

  const handleEdit = (node: WBSNode) => {
    setSelectedNode(node);
    setDefaultParentId(undefined);
    setDialogOpen(true);
  };

  const handleDeleteClick = (nodeId: string) => {
    setNodeToDelete(nodeId);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (nodeToDelete) {
      deleteWbsNode(nodeToDelete);
      setNodeToDelete(null);
    }
    setDeleteOpen(false);
  };

  const renderNode = (node: WBSNode, depth: number = 0) => {
    const children = wbs.filter((n) => n.parentId === node.id);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} className="animate-fade-in">
        <div
          className={cn(
            'group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-muted/50'
          )}
          style={{ marginLeft: depth * 24 }}
        >
          {hasChildren ? (
            <FolderOpen className="h-4 w-4 text-warning" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{node.code}</span>
              <span className="font-medium text-foreground truncate">{node.name}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{node.description}</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => handleAdd(node.id)}
              title="Add child"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => handleEdit(node)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => handleDeleteClick(node.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {hasChildren && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {hasChildren && (
          <div className="border-l border-border ml-6">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Work Breakdown Structure</h1>
          <p className="mt-2 text-muted-foreground">
            Hierarchical breakdown of project deliverables
          </p>
        </div>
        <Button onClick={() => handleAdd()} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Node
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-1">
          {rootNodes.map((node) => renderNode(node))}
          {rootNodes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No nodes — add the first WBS item
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h2 className="font-semibold text-foreground">WBS Dictionary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Level</th>
              </tr>
            </thead>
            <tbody>
              {wbs.map((node, index) => (
                <tr
                  key={node.id}
                  className={cn(
                    'border-b border-border transition-colors hover:bg-muted/30',
                    index % 2 === 0 && 'bg-muted/10'
                  )}
                >
                  <td className="p-3 font-mono text-sm text-primary">{node.code}</td>
                  <td className="p-3 font-medium text-foreground">{node.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{node.description}</td>
                  <td className="p-3 text-sm text-muted-foreground">{node.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <WbsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        node={selectedNode}
        defaultParentId={defaultParentId}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Node"
        description="Delete this WBS node? Direct children will not be moved automatically."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
