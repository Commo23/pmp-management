import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from './pages/AppLayout';
import NotFound from './pages/NotFound';
import { SettingsPage } from './pages/SettingsPage';
import { ProjectFlow } from '@/components/flow/ProjectFlow';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { RACIMatrix } from '@/components/raci/RACIMatrix';
import { ChartsView } from '@/components/charts/ChartsView';
import { BacklogView } from '@/components/backlog/BacklogView';
import { WBSView } from '@/components/wbs/WBSView';
import { RiskRegister } from '@/components/risks/RiskRegister';
import { StakeholderMatrix } from '@/components/stakeholders/StakeholderMatrix';
import { RequirementsMatrix } from '@/components/requirements/RequirementsMatrix';
import { GanttChart } from '@/components/charts/GanttChart';

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/flow" replace />} />
          <Route path="flow" element={<ProjectFlow />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="raci" element={<RACIMatrix />} />
          <Route path="charts" element={<ChartsView />} />
          <Route path="backlog" element={<BacklogView />} />
          <Route path="wbs" element={<WBSView />} />
          <Route path="risks" element={<RiskRegister />} />
          <Route path="stakeholders" element={<StakeholderMatrix />} />
          <Route path="requirements" element={<RequirementsMatrix />} />
          <Route path="gantt" element={<GanttChart />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
