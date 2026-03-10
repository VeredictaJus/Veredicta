import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import FloatingChatModal from '@/components/chat/FloatingChatModal';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [orbY, setOrbY] = useState(30);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');
  // Chat-suporte deve ter scroll externo como outras páginas
  const isSupportChatPage = location.pathname.includes('/chat-suporte');

  const content = children ?? <Outlet />;

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
  }, [location.pathname, isChatPage, isSupportChatPage]);

  return (
    <div className={`relative flex ${isChatPage && !isSupportChatPage ? 'h-screen' : 'min-h-screen'} bg-background overflow-hidden`}>
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
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
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
            opacity: 0.075,
            background: 'radial-gradient(circle, rgba(249,115,22,0.65) 0%, rgba(249,115,22,0.16) 40%, transparent 72%)',
            filter: 'blur(125px)',
          }}
        />
      </div>

      {/* Sidebar */}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex flex-col ml-0 lg:ml-[17.5rem]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="lg:hidden fixed left-4 top-4 z-30 rounded-md border border-border/70 bg-card/70 p-2 text-foreground shadow-sm supports-[backdrop-filter]:backdrop-blur-sm"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <div ref={contentRef} className={isChatPage && !isSupportChatPage ? "pt-2 px-4 sm:px-6 flex-1 min-h-0 overflow-hidden" : "p-6 pt-6 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}