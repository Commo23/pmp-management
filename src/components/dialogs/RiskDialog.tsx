import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Risk, RiskProbability, RiskImpact } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

interface RiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: Risk;
}

const probabilityScores = { low: 1, medium: 2, high: 3 };
const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };

export function RiskDialog({ open, onOpenChange, risk }: RiskDialogProps) {
  const { addRisk, updateRisk } = useProject();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    probability: 'medium' as RiskProbability,
    impact: 'medium' as RiskImpact,
    response: 'mitigate' as Risk['response'],
    owner: '',
    status: 'identified' as Risk['status'],
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title,
        description: risk.description,
        probability: risk.probability,
        impact: risk.impact,
        response: risk.response,
        owner: risk.owner,
        status: risk.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        probability: 'medium',
        impact: 'medium',
        response: 'mitigate',
        owner: '',
        status: 'identified',
      });
    }
  }, [risk]);

  const calculateScore = () => {
    return probabilityScores[formData.probability] * impactScores[formData.impact];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const riskData = {
      ...formData,
      score: calculateScore(),
    };

    if (risk) {
      updateRisk(risk.id, riskData);
    } else {
      addRisk(riskData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{risk ? 'Edit Risk' : 'New Risk'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Probability</Label>
              <Select value={formData.probability} onValueChange={(v) => setFormData({ ...formData, probability: v as RiskProbability })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Impact</Label>
              <Select value={formData.impact} onValueChange={(v) => setFormData({ ...formData, impact: v as RiskImpact })}>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Response</Label>
              <Select value={formData.response} onValueChange={(v) => setFormData({ ...formData, response: v as Risk['response'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avoid">Avoid</SelectItem>
                  <SelectItem value="mitigate">Mitigate</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="accept">Accept</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Risk['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="analyzing">Analyzing</SelectItem>
                  <SelectItem value="mitigating">Mitigating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              required
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Calculated score: <span className="font-bold text-foreground">{calculateScore()}</span>
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{risk ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
