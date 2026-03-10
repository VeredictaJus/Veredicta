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
          className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute -bottom-60 -left-60 h-[520px] w-[520px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute left-1/3 h-[420px] w-[420px] rounded-full opacity-15"
          style={{ top: '46%', background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute -top-36 -right-28 h-[360px] w-[360px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.58) 0%, rgba(249,115,22,0.12) 50%, transparent 75%)', filter: 'blur(74px)' }}
        />
        <div
          className="absolute right-[-220px] h-[560px] w-[560px] rounded-full opacity-26 transition-[top] duration-300"
          style={{ top: `calc(${orbY}% - 230px)`, right: '-170px', height: '460px', width: '460px', opacity: 0.16, background: 'radial-gradient(circle, rgba(249,115,22,0.52) 0%, rgba(249,115,22,0.12) 45%, transparent 74%)', filter: 'blur(108px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex flex-col ml-0 lg:ml-64">
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
