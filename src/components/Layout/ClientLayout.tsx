import React, { ReactNode, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingChatModal from '@/components/chat/FloatingChatModal';

interface ClientLayoutProps {
  children?: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const content = children ?? <Outlet />;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');

  return (
    <div className={`flex ${isChatPage ? 'h-screen' : 'min-h-screen'} bg-background`}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <div className={isChatPage ? "pt-20 px-6 flex-1 overflow-hidden" : "p-6 pt-24 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}
