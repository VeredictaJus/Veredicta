import React, { ReactNode } from 'react';
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
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');

  return (
    <div className={`flex ${isChatPage ? 'h-screen' : 'min-h-screen'} bg-background`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col ml-64">
        <Header />
        <div className={isChatPage ? "pt-20 px-6 flex-1 overflow-hidden" : "p-6 pt-24 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}
