import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import FloatingChatModal from '@/components/chat/FloatingChatModal';
import { Menu } from 'lucide-react';

interface ClientLayoutProps {
  children?: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const content = children ?? <Outlet />;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orbY, setOrbY] = useState(30);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateOrbPosition = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const ratio = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
      setOrbY(8 + ratio * 76);
    };

    updateOrbPosition();
    el.addEventListener('scroll', updateOrbPosition, { passive: true });
    return () => el.removeEventListener('scroll', updateOrbPosition);
  }, [location.pathname, isChatPage]);

  return (
    <div className={`relative flex ${isChatPage ? 'h-screen' : 'min-h-screen'} bg-background overflow-hidden`}>
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full opacity-16"
          style={{ background: '#f97316', filter: 'blur(90px)' }}
        />
        <div
          className="absolute -bottom-60 -left-60 h-[520px] w-[520px] rounded-full opacity-20"
          style={{ background: '#7c3aed', filter: 'blur(80px)' }}
        />
        <div
          className="absolute left-1/3 h-[420px] w-[420px] rounded-full opacity-15"
          style={{ top: '46%', background: '#0ea5e9', filter: 'blur(80px)' }}
        />
        <div
          className="absolute -top-36 -right-28 h-[360px] w-[360px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.30) 0%, rgba(249,115,22,0.07) 50%, transparent 75%)', filter: 'blur(88px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.28) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-20">
        <div
          className="absolute transition-[top] duration-300 mix-blend-screen"
          style={{
            top: `calc(${orbY}% - 220px)`,
            right: '-180px',
            height: '440px',
            width: '440px',
            opacity: 0.035,
            background: 'radial-gradient(circle, rgba(249,115,22,0.36) 0%, rgba(249,115,22,0.08) 40%, transparent 72%)',
            filter: 'blur(140px)',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex flex-col ml-0 lg:ml-[17.5rem]">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed left-4 top-4 z-30 rounded-md border border-border/70 bg-card/70 p-2 text-foreground shadow-sm supports-[backdrop-filter]:backdrop-blur-sm"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <div ref={contentRef} className={isChatPage ? "pt-2 px-4 sm:px-6 flex-1 min-h-0 overflow-hidden" : "p-6 pt-6 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}
