import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatFab } from '@/components/chat/ChatFab';

export default function AppLayout() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4 md:ml-64 md:p-8 min-w-0">
              <Outlet />
            </main>
          </div>
          <ChatFab />
        </div>
      </ProjectProvider>
    </AuthProvider>
  );
}
