import { useState } from 'react';
import { User, LogOut, Bell } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle';
import { useNotifications, NotificationContext } from '@/contexts/NotificationContext';
import { useContext } from 'react';
import NotificationDropdown from '@/components/Notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';
import { useAvatar } from '@/contexts/AvatarContext';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { ClientProfile, WriterProfile, AdminProfile } from '@/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

// Hook seguro para notificações que não lança erro
const useSafeNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return { unreadCount: 0, markAllAsRead: async () => {} };
  }
  return context;
};

export default function Header() {
  const { user, logout } = useNewAuth();
  const { profile: userProfile } = useUser();
  const { avatarUrl } = useAvatar();
  const { unreadCount, markAllAsRead } = useSafeNotifications();
  const { navigateToProfileTab } = useTabNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Função para obter o nome da página atual baseado na rota
  const getPageTitle = () => {
    const pathname = location.pathname;
    
    // Mapeamento de rotas para títulos
    const routeMap: Record<string, string> = {
      // Cliente
      '/client': 'Dashboard',
      '/client/petitions/new': 'Nova Petição',
      '/client/petitions': 'Minhas Petições',
      '/client/plans': 'Planos',
      '/client/chat': 'Chat',
      '/client/settings': 'Configurações',
      '/client/notifications': 'Notificações',
      
      // Redator
      '/writer': 'Dashboard',
      '/writer/available': 'Petições Disponíveis',
      '/writer/my-petitions': 'Minhas Petições',
      '/writer/calculator': 'Calculadora',
      '/writer/calculator/saved': 'Cálculos Salvos',
      '/writer/payments': 'Pagamentos',
      '/writer/history': 'Histórico',
      '/writer/chat': 'Chat',
      '/writer/settings': 'Configurações',
      '/writer/notifications': 'Notificações',
      
      // Admin
      '/admin': 'Dashboard',
      '/admin/users': 'Usuários',
      '/admin/peticoes': 'Petições',
      '/admin/pagamentos': 'Pagamentos',
      '/admin/relatorios': 'Relatórios',
      '/admin/plans': 'Planos',
      '/admin/settings': 'Configurações',
      '/admin/notifications': 'Notificações',
      '/admin/revisoes': 'Revisões',
      '/admin/chat-suporte': 'Chat Suporte',
      '/admin/chat-reports': 'Relatórios do Chat',
      '/admin/user-management': 'Gestão de Usuários',
      '/admin/invite-user': 'Convites',
      '/admin/activity-logs': 'Logs de Atividade',
    };

    // Retorna o título mapeado ou "Dashboard" como fallback
    return routeMap[pathname] || 'Dashboard';
  };

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  const getDisplayName = () => {
    // Usar o nome do UserContext que já está sincronizado com o banco
    if (userProfile?.name) {
      return truncateLongName(userProfile.name);
    }
    
    // Fallback: tentar pegar do perfil completo do NewAuthContext se disponível
    if (user?.profile) {
      const profile = user.profile as any;
      if (profile.company_name) {
        return truncateLongName(profile.company_name);
      }
      if (profile.full_name) {
        return truncateLongName(profile.full_name);
      }
    }
    
    // Último fallback: email
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const getRoleLabel = () => {
    const role = user?.role?.toUpperCase();
    switch (role) {
      case 'CLIENT': return 'Cliente';
      case 'WRITER': return 'Redator';
      case 'ADMIN': return 'Administrador';
      default: return 'Usuário';
    }
  };

  return (
  <header className="fixed top-0 right-0 left-64 z-40 bg-background border-b border-border h-20 flex items-center">
    <div className="flex items-center justify-between w-full px-6">
      {/* Esquerda */}
      <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>

      {/* Direita */}
      <div className="flex items-center gap-4">
        {/* 🌙 Botão de tema */}
        <SimpleThemeToggle className="rounded-md p-2 hover:bg-muted transition" />

        {/* 🔔 Popover de notificações */}
        <Popover
          open={notifOpen}
          onOpenChange={(open) => {
            setNotifOpen(open);
            if (open) markAllAsRead(); // zera badge ao abrir
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative rounded-md p-2 hover:bg-muted transition"
              aria-label="Abrir notificações"
            >
              <Bell size={18} className="text-orange-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[360px] p-0">
            <NotificationDropdown onSeeAll={() => setNotifOpen(false)} />
          </PopoverContent>
        </Popover>

        {/* 👤 Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <UserAvatar size="md" />
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={getDisplayName()}>{getDisplayName()}</div>
                <div className="text-xs text-muted-foreground">{getRoleLabel()}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* ✅ SUBSTITUA o item por este handler */}
            <DropdownMenuItem
              onClick={() => {
                // garante a aba "Perfil"
                navigateToProfileTab();

                // rota por papel com fallback
                const role = String(user?.role || '').toLowerCase();
                const base =
                  role === 'client' ? '/client' :
                  role === 'writer' ? '/writer' :
                  role === 'admin'  ? '/admin'  :
                  '/writer';

                navigate(`${base}/settings?tab=profile`);

                // re-tentativa opcional se role ainda não chegou
                if (!role) {
                  setTimeout(() => {
                    const r = String(user?.role || '').toLowerCase();
                    const retryBase =
                      r === 'client' ? '/client' :
                      r === 'admin'  ? '/admin'  :
                      '/writer';
                    navigate(`${retryBase}/settings?tab=profile`);
                  }, 100);
                }
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
);
}