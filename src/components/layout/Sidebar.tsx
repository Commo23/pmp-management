import { SidebarNav } from './SidebarNav';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar md:block">
      <SidebarNav />
    </aside>
  );
}
