import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Bug,
  Zap,
  Wrench,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { BacklogItem, Release, Sprint } from '@/types/project';
import { BacklogItemDialog } from '@/components/dialogs/BacklogItemDialog';
import { SprintDialog } from '@/components/dialogs/SprintDialog';
import { ReleaseDialog } from '@/components/dialogs/ReleaseDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

const typeIcons = {
  feature: Zap,
  bug: Bug,
  technical: Wrench,
  spike: HelpCircle,
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function BacklogView() {
  const {
    backlog,
    sprints,
    releases,
    moveBacklogItem,
    deleteBacklogItem,
    reorderProductBacklog,
    deleteSprint,
    deleteRelease,
  } = useProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | undefined>();
  const [sprintDeleteOpen, setSprintDeleteOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);

  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | undefined>();
  const [releaseDeleteOpen, setReleaseDeleteOpen] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState<string | null>(null);

  const [reorderFromId, setReorderFromId] = useState<string | null>(null);

  const productBacklog = backlog
    .filter((item) => !item.sprintId)
    .sort((a, b) => a.order - b.order);

  const sprintBacklog = sprints.map((sprint) => ({
    ...sprint,
    items: backlog.filter((item) => item.sprintId === sprint.id),
  }));

  const handleDragStart = (e: React.DragEvent, itemId: string, forReorder = false) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    if (forReorder) setReorderFromId(itemId);
  };

  const handleDropOnSprint = (e: React.DragEvent, sprintId?: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    setReorderFromId(null);
    if (itemId) moveBacklogItem(itemId, sprintId);
  };

  const handleDropReorder = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fromId = reorderFromId || e.dataTransfer.getData('text/plain');
    setReorderFromId(null);
    if (fromId && fromId !== targetId) reorderProductBacklog(fromId, targetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Backlog</h1>
          <p className="mt-2 text-muted-foreground">
            Prioritize items, assign sprints, and manage releases. Drag to reorder the product
            backlog or drop into a sprint.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSprint(undefined);
              setSprintDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Sprint
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedRelease(undefined);
              setReleaseDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Release
          </Button>
          <Button
            onClick={() => {
              setSelectedItem(undefined);
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Item
          </Button>
        </div>
      </div>

      {releases.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold text-foreground">Releases</h2>
          <div className="flex flex-wrap gap-2">
            {releases.map((rel) => (
              <div
                key={rel.id}
                className="group flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{rel.name}</span>
                <Badge variant="outline">{rel.version}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{rel.status}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    setSelectedRelease(rel);
                    setReleaseDialogOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    setReleaseToDelete(rel.id);
                    setReleaseDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="rounded-xl border border-border bg-card"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnSprint(e, undefined)}
        >
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Product Backlog</h2>
            <p className="text-sm text-muted-foreground">
              {productBacklog.reduce((sum, item) => sum + item.storyPoints, 0)} points · drag items
              to reorder
            </p>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {productBacklog.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, true)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropReorder(e, item.id)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 cursor-grab hover:border-primary/50 transition-colors active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <Badge className={cn('text-xs flex-shrink-0', priorityStyles[item.priority])}>
                    {item.priority}
                  </Badge>
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                    {item.storyPoints}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setSelectedItem(item);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {productBacklog.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Drop items here</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {sprintBacklog.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-xl border border-border bg-card"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnSprint(e, sprint.id)}
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{sprint.name}</h3>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">
                      {sprint.items.reduce((sum, item) => sum + item.storyPoints, 0)} pts
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                    setSelectedSprint({
                      id: sprint.id,
                      name: sprint.name,
                      goal: sprint.goal,
                      startDate: sprint.startDate,
                      endDate: sprint.endDate,
                      velocity: sprint.velocity,
                      items: sprint.items.map((i) => i.id),
                    });
                    setSprintDialogOpen(true);
                  }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        setSprintToDelete(sprint.id);
                        setSprintDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sprint.startDate} → {sprint.endDate}
                </p>
              </div>
              <div className="p-4 space-y-2 min-h-[100px]">
                {sprint.items.map((item) => {
                  const Icon = typeIcons[item.type];
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 cursor-grab hover:border-primary/50 transition-colors"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                      <span className="text-xs font-medium text-primary">{item.storyPoints}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            setSelectedItem(item);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive"
                          onClick={() => {
                            setItemToDelete(item.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {sprint.items.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">Drop items here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {sprints.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No sprints yet. Create one to start planning.
            </div>
          )}
        </div>
      </div>

      <BacklogItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} />
      <SprintDialog open={sprintDialogOpen} onOpenChange={setSprintDialogOpen} sprint={selectedSprint} />
      <ReleaseDialog
        open={releaseDialogOpen}
        onOpenChange={setReleaseDialogOpen}
        release={selectedRelease}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description="Are you sure you want to delete this backlog item? This action cannot be undone."
        onConfirm={() => {
          if (itemToDelete) deleteBacklogItem(itemToDelete);
          setItemToDelete(null);
          setDeleteDialogOpen(false);
        }}
      />
      <ConfirmDialog
        open={sprintDeleteOpen}
        onOpenChange={setSprintDeleteOpen}
        title="Delete Sprint"
        description="Delete this sprint? Assigned backlog items will return to the product backlog."
        onConfirm={() => {
          if (sprintToDelete) deleteSprint(sprintToDelete);
          setSprintToDelete(null);
          setSprintDeleteOpen(false);
        }}
      />
      <ConfirmDialog
        open={releaseDeleteOpen}
        onOpenChange={setReleaseDeleteOpen}
        title="Delete Release"
        description="Delete this release? Sprint links will be removed."
        onConfirm={() => {
          if (releaseToDelete) deleteRelease(releaseToDelete);
          setReleaseToDelete(null);
          setReleaseDeleteOpen(false);
        }}
      />
    </div>
  );
}
