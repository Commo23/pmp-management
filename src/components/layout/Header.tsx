import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoUser } from '@/lib/demo';
import { buildExportPayload } from '@/lib/projectImportExport';
import { PMP_STORAGE_VERSION } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { SidebarNav } from './SidebarNav';
import {
  Layers,
  RefreshCw,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Menu,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
  Settings,
  FolderKanban,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    mode,
    setMode,
    tasks,
    backlog,
    sprints,
    releases,
    risks,
    stakeholders,
    requirements,
    raci,
    wbs,
    ganttTasks,
    phases,
    resetToSampleData,
    importProjectState,
    syncStatus,
    cloudProjects,
    cloudProjectId,
    cloudProjectName,
    switchProject,
    createProject,
    renameProject,
  } = useProject();

  const handleExport = () => {
    const data = buildExportPayload(
      {
        version: PMP_STORAGE_VERSION,
        mode,
        tasks,
        backlog,
        raci,
        risks,
        stakeholders,
        requirements,
        wbs,
        sprints,
        releases,
        ganttTasks,
      },
      phases
    );

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmp-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Project exported successfully');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text) as unknown;
      const result = importProjectState(json);
      if (result.ok === false) {
        toast.error(result.error);
        return;
      }
      toast.success('Project imported successfully');
    } catch {
      toast.error('Could not read JSON file');
    }
  };

  const handleReset = () => {
    resetToSampleData();
    toast.success('Sample data restored');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out — local mode active');
  };

  const syncLabel =
    syncStatus === 'synced'
      ? 'Cloud'
      : syncStatus === 'saving'
        ? 'Sync…'
        : syncStatus === 'loading'
          ? 'Loading'
          : syncStatus === 'error'
            ? 'Sync error'
            : 'Local';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-4 py-3 text-left">
                <SheetTitle className="text-base">Navigation</SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/flow" className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-md">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden min-[420px]:flex flex-col min-w-0">
              <span className="text-lg font-bold tracking-tight text-foreground truncate">
                PMP Flow Designer
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Project management visualization
              </span>
            </div>
          </Link>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex max-w-[180px] gap-1.5">
                  <FolderKanban className="h-4 w-4 shrink-0" />
                  <span className="truncate">{cloudProjectName || 'Project'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {cloudProjects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => void switchProject(p.id)}
                    className={cn(p.id === cloudProjectId && 'bg-accent')}
                  >
                    <span className="truncate">{p.name}</span>
                  </DropdownMenuItem>
                ))}
                {cloudProjects.length === 0 && (
                  <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const name = window.prompt('New project name', 'New PMP Project');
                    if (name?.trim()) void createProject(name.trim());
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New project
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!cloudProjectId}
                  onClick={() => {
                    const name = window.prompt(
                      'Rename project',
                      cloudProjectName || 'My PMP Project'
                    );
                    if (name?.trim()) void renameProject(name.trim());
                  }}
                >
                  Rename current
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 rounded-xl border border-border bg-muted/50 p-1">
          <Button
            variant={mode === 'waterfall' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('waterfall')}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Waterfall</span>
          </Button>
          <Button
            variant={mode === 'agile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('agile')}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Agile</span>
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground',
              syncStatus === 'error' && 'text-destructive',
              syncStatus === 'synced' && 'text-primary'
            )}
            title={syncLabel}
          >
            {syncStatus === 'saving' || syncStatus === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : syncStatus === 'local' || syncStatus === 'error' ? (
              <CloudOff className="h-3.5 w-3.5" />
            ) : (
              <Cloud className="h-3.5 w-3.5" />
            )}
            <span className="hidden lg:inline">{syncLabel}</span>
          </span>

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            <span className="hidden lg:inline">Reset</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleImportFile(e)}
          />
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleImportClick}>
            <Upload className="h-4 w-4" />
            <span className="hidden lg:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">Export</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline">Settings</span>
            </Link>
          </Button>

          {authLoading ? null : user ? (
            <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline truncate">
                {isDemoUser(user.email) ? 'Demo' : user.email}
              </span>
            </Button>
          ) : (
            <Button variant="default" size="sm" className="gap-2" onClick={() => setAuthOpen(true)}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}
        </div>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
