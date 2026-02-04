import { ReactNode, useState } from 'react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useNewAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 ml-0 lg:ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}