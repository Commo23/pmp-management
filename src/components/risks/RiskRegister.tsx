import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, RefreshCw, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { Risk } from '@/types/project';
import { RiskDialog } from '@/components/dialogs/RiskDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

const probabilityColors = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
};

const impactColors = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

const responseIcons = {
  avoid: Shield,
  mitigate: RefreshCw,
  transfer: RefreshCw,
  accept: Check,
};

export function RiskRegister() {
  const { risks, deleteRisk } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riskToDelete, setRiskToDelete] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 12) return 'bg-destructive text-destructive-foreground';
    if (score >= 8) return 'bg-warning text-warning-foreground';
    if (score >= 4) return 'bg-info text-info-foreground';
    return 'bg-success text-success-foreground';
  };

  const handleAdd = () => {
    setSelectedRisk(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setDialogOpen(true);
  };

  const handleDeleteClick = (riskId: string) => {
    setRiskToDelete(riskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (riskToDelete) {
      deleteRisk(riskToDelete);
      setRiskToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Register</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage project risks
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          New Risk
        </Button>
      </div>

      {/* Risk Matrix Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {['Critical', 'High', 'Medium', 'Low'].map((level, idx) => {
          const thresholds = [[12, Infinity], [8, 12], [4, 8], [0, 4]];
          const count = risks.filter(r => r.score >= thresholds[idx][0] && r.score < thresholds[idx][1]).length;

          return (
            <div key={level} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{level} Risks</span>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  idx === 0 && "text-destructive",
                  idx === 1 && "text-warning",
                  idx === 2 && "text-info",
                  idx === 3 && "text-success",
                )} />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Risk List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Risk</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Probability</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Impact</th>
                <th className="p-4 text-center text-sm font-medium text-muted-foreground">Score</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Response</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Owner</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, index) => {
                const ResponseIcon = responseIcons[risk.response];
                return (
                  <tr 
                    key={risk.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{risk.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", probabilityColors[risk.probability])}>
                        {risk.probability}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", impactColors[risk.impact])}>
                        {risk.impact}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                        getScoreColor(risk.score)
                      )}>
                        {risk.score}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ResponseIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize text-sm text-foreground">{risk.response}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{risk.owner}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {risk.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(risk)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(risk.id)}>
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

      <RiskDialog open={dialogOpen} onOpenChange={setDialogOpen} risk={selectedRisk} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Risk"
        description="Are you sure you want to delete this risk? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
