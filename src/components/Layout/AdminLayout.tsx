import React, { useMemo, useState, ReactNode } from 'react';
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
  const meta = usePageMeta();
  const location = useLocation();
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');
  // Chat-suporte deve ter scroll externo como outras páginas
  const isSupportChatPage = location.pathname.includes('/chat-suporte');

  const content = children ?? <Outlet />;

  return (
    <div className={`flex ${isChatPage && !isSupportChatPage ? 'h-screen' : 'min-h-screen'} bg-background`}>
      {/* Sidebar */}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col ml-0 lg:ml-64">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onToggleSidebar={() => setOpen(true)}
        />
        <div className={isChatPage && !isSupportChatPage ? "pt-20 px-6 flex-1 min-h-0 overflow-hidden" : "p-6 pt-24 flex-1 overflow-y-auto"}>
          {content}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}