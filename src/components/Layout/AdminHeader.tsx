/* @ts-nocheck */
import React from 'react';
import {
  Menu, Bell, Search, Sun, Moon, ChevronDown, User as UserIcon, LogOut
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

import NotificationDropdown from '@/components/Notifications/NotificationDropdown';
import { UserAvatar } from '@/components/ui/UserAvatar';

import { useNotifications } from '@/contexts/NotificationContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';
import { useAvatar } from '@/contexts/AvatarContext';
import { useTabNavigation } from '@/contexts/TabNavigationContext';
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle';
import { ClientProfile, WriterProfile, AdminProfile } from '@/types';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
};

export default function AdminHeader({ title, subtitle, onToggleSidebar }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useNewAuth();
  const { profile: userProfile } = useUser();
  const { avatarUrl } = useAvatar();
  const { unreadCount, markAllAsRead } = useNotifications();
  const { navigateToProfileTab } = useTabNavigation();

  const [notifOpen, setNotifOpen] = React.useState(false);

  const getDisplayName = () => {
    if (!userProfile) return user?.email?.split('@')[0] || 'Usuário';
    if ((userProfile as any).company_name) return (userProfile as ClientProfile).company_name;
    if ((userProfile as any).full_name)   return (userProfile as WriterProfile | AdminProfile).full_name;
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const getRoleLabel = () => {
    const r = String(user?.role || '').toLowerCase();
    if (r === 'client') return 'Cliente';
    if (r === 'writer') return 'Redator';
    if (r === 'admin')  return 'Administrador';
    // compat: valores em CAIXA ALTA
    if (user?.role === 'CLIENT') return 'Cliente';
    if (user?.role === 'WRITER') return 'Redator';
    if (user?.role === 'ADMIN')  return 'Administrador';
    return 'Usuário';
  };

  const goToProfile = () => {
    navigateToProfileTab(); // garante “tab=profile” no seu contexto
    const r = String(user?.role || '').toLowerCase();
    const base = r === 'client' ? '/client' : r === 'admin' ? '/admin' : '/writer';
    navigate(`${base}/settings?tab=profile`);
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-background border-b border-border h-20">
      <div className="flex items-center h-full px-6">
        {/* Título */}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>

        {/* Direita */}
        <div className="ml-auto flex items-center gap-4">
          {/* Tema */}
          <SimpleThemeToggle className="rounded-md p-2 hover:bg-muted transition" />

          {/* Notificações */}
          <Popover
            open={notifOpen}
            onOpenChange={(open) => {
              setNotifOpen(open);
              if (open) markAllAsRead();
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

          {/* Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <UserAvatar size="md" />
                <div className="text-left">
                  <div className="text-sm font-medium">{getDisplayName()}</div>
                  <div className="text-xs text-muted-foreground">{getRoleLabel()}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={goToProfile}>
                <UserIcon className="mr-2 h-4 w-4" />
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
