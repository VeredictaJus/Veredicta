import React, { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import FloatingChatModal from '@/components/chat/FloatingChatModal';

type Meta = { title: string; subtitle?: string };

function usePageMeta(): Meta {
  const { pathname } = useLocation();

  return useMemo<Meta>(() => {
    if (pathname.startsWith('/admin/users')) return { title: 'Usuários', subtitle: 'Listagem baseada apenas em dados reais' };
    if (pathname.startsWith('/admin/peticoes')) return { title: 'Petições', subtitle: 'Gestão completa de petições' };
    if (pathname.startsWith('/admin/pagamentos')) return { title: 'Pagamentos', subtitle: 'Acompanhamento financeiro' };
    if (pathname.startsWith('/admin/relatorios')) return { title: 'Relatórios', subtitle: 'Indicadores e métricas' };
    if (pathname.startsWith('/admin/plans')) return { title: 'Planos', subtitle: 'Gestão de planos e limites' };
    if (pathname.startsWith('/admin/settings')) return { title: 'Configurações', subtitle: 'Preferências do painel' };
    if (pathname.startsWith('/admin/notifications')) return { title: 'Notificações', subtitle: 'Alertas do sistema' };
    if (pathname.startsWith('/admin/revisoes')) return { title: 'Revisões', subtitle: 'Controle de revisões e correções de petições' };
    if (pathname.startsWith('/admin/Revisoes')) return { title: 'Revisões', subtitle: 'Controle de revisões e correções de petições' };
    if (pathname.startsWith('/admin/chat-suporte')) return { title: 'Chat de Suporte', subtitle: 'Atendimento aos usuários' };
    if (pathname.startsWith('/admin/chat-reports')) return { title: 'Relatórios do Chat', subtitle: 'Acompanhamento de conversas' };
    if (pathname.startsWith('/admin/writer-approval')) return { title: 'Aprovação de Redatores', subtitle: 'Gerenciar solicitações de cadastro' };
    if (pathname.startsWith('/admin/user-management')) return { title: 'Gestão de Usuários', subtitle: 'Permissões e papéis' };
    if (pathname.startsWith('/admin/invite-user')) return { title: 'Convites', subtitle: 'Convidar novos usuários' };
    if (pathname.startsWith('/admin/activity-logs')) return { title: 'Logs de Atividade', subtitle: 'Auditoria do sistema' };
    if (pathname.startsWith('/admin/user-profile')) return { title: 'Perfil do Usuário', subtitle: 'Detalhes e histórico' };
    return { title: 'Dashboard', subtitle: 'Visão geral da plataforma Veredicta' };
  }, [pathname]);
}

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [orbY, setOrbY] = useState(30);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const meta = usePageMeta();
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
      setOrbY(22 + ratio * 62);
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
          className="absolute right-[-220px] h-[560px] w-[560px] rounded-full opacity-26 transition-[top] duration-300"
          style={{ top: `calc(${orbY}% - 280px)`, background: 'radial-gradient(circle, rgba(249,115,22,0.95) 0%, rgba(249,115,22,0.15) 42%, transparent 72%)', filter: 'blur(86px)' }}
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
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex flex-col ml-0 lg:ml-64">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onToggleSidebar={() => setOpen(true)}
        />
        <div ref={contentRef} className={isChatPage && !isSupportChatPage ? "pt-20 px-6 flex-1 min-h-0 overflow-hidden" : "p-6 pt-24 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}