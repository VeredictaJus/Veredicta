import { cn } from '@/lib/utils';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useLocation, Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import Logo from '@/components/ui/Logo';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Home, FileText, CreditCard, Settings, Users,
  BarChart3, Briefcase, DollarSign, Clock,
  MessageSquare, Bot, Lock, LogOut
} from 'lucide-react';

const clientNavItems = [
  { icon: Home, label: 'Dashboard', href: '/client' },
  { icon: FileText, label: 'Minhas Petições', href: '/client/petitions' },
  { icon: Briefcase, label: 'Planos', href: '/client/plans' },
  { icon: MessageSquare, label: 'Chat', href: '/client/chat' },
  { icon: Settings, label: 'Configurações', href: '/client/settings' },
];

const writerNavItems = [
  { icon: Home, label: 'Dashboard', href: '/writer' },
  { icon: FileText, label: 'Petições Disponíveis', href: '/writer/available' },
  { icon: Briefcase, label: 'Minhas Petições', href: '/writer/my-petitions' },
  { icon: DollarSign, label: 'Pagamentos', href: '/writer/payments' },
  { icon: Clock, label: 'Histórico', href: '/writer/history' },
  { icon: MessageSquare, label: 'Chat', href: '/writer/chat' },
  { icon: Settings, label: 'Configurações', href: '/writer/settings' },
];

const adminNavItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Usuários', href: '/admin/users' },
  { icon: FileText, label: 'Petições', href: '/admin/petitions' },
  { icon: DollarSign, label: 'Pagamentos', href: '/admin/payments' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/reports' },
  { icon: Bot, label: 'Corretor IA', href: '/admin/corretor-ia' },
  { icon: MessageSquare, label: 'Chat Suporte', href: '/admin/chat-suporte' },
  { icon: CreditCard, label: 'Planos', href: '/admin/plans' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
];

export default function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const { user, logout } = useNewAuth();
  const { profile: userProfile } = useUser();
  const { isDisabled, disabledReason } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();

  const getNavItems = () => {
    switch (user?.role) {
      case 'client': return clientNavItems;
      case 'writer': return writerNavItems;
      case 'admin': return adminNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();
  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'Usuário';
  const roleLabel = user?.role === 'client' ? 'Cliente' : user?.role === 'writer' ? 'Redator' : user?.role === 'admin' ? 'Administrador' : 'Usuário';
  const profilePath = user?.role === 'client' ? '/client/settings?tab=profile' : user?.role === 'admin' ? '/admin/settings?tab=profile' : '/writer/settings?tab=profile';

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (isMobile) onClose?.();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-border shadow-sm flex flex-col text-sm transition-transform duration-200 lg:translate-x-0
        overflow-hidden
        bg-gradient-to-b from-background to-muted/30
        dark:from-slate-950 dark:to-slate-900/30
        before:content-[''] before:absolute before:inset-0 before:pointer-events-none
        before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_55%)]
        dark:before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_55%)]
        ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section - Padronizado como WriterLayout */}
        <div className="p-6 relative z-10">
          <Logo size="md" textSize="xl" align="center" />
        </div>

        {/* Aviso de sidebar desabilitado */}
        {isDisabled && (
          <div className="mx-6 mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl shadow-sm relative z-10">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Finalizando pagamento...
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Complete o pagamento para continuar navegando
            </p>
          </div>
        )}

        {/* Menu Section - Padronizado como WriterLayout */}
        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-primary/10 text-foreground border-primary/20 shadow-sm'
                    : isDisabled
                    ? 'text-muted-foreground/50 cursor-not-allowed opacity-50'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:-translate-y-[1px] hover:shadow-sm hover:border-border/60 motion-reduce:transform-none'
                )}
                title={isDisabled ? 'Complete o pagamento para continuar navegando' : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  )}
                />
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-primary'
                      : isDisabled
                        ? 'text-muted-foreground/40'
                        : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className={cn('flex-1 truncate', isActive ? 'font-semibold' : 'font-medium')}>{item.label}</span>
                {isActive && !isDisabled && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/70" />}
                {isDisabled && <Lock className="h-3 w-3 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 p-4 border-t border-white/5">
          <Link
            to={profilePath}
            onClick={(e) => handleLinkClick(e, profilePath)}
            className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-3 py-3 transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
          >
            <UserAvatar size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground hover:bg-card/70"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
