import { cn } from '@/lib/utils';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useLocation, Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import {
  Home, FileText, CreditCard, Settings, Users,
  BarChart3, Briefcase, DollarSign, Clock,
  MessageSquare, Bot, Lock
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

export default function Sidebar() {
  const { user } = useNewAuth();
  const { isDisabled, disabledReason } = useSidebar();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'client': return clientNavItems;
      case 'writer': return writerNavItems;
      case 'admin': return adminNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-background border-r border-border shadow-sm flex flex-col text-sm">
      {/* Logo Section - Padronizado como WriterLayout */}
      <div className="p-6 border-b border-border">
        <Logo size="md" textSize="xl" align="center" />
      </div>

      {/* Aviso de sidebar desabilitado */}
      {isDisabled && (
        <div className="mx-6 mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Finalizando pagamento...
            </span>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
            Complete o pagamento para continuar navegando
          </p>
        </div>
      )}

      {/* Menu Section - Padronizado como WriterLayout */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-md transition-colors font-semibold',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : isDisabled
                  ? 'text-muted-foreground/50 cursor-not-allowed opacity-50'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={isDisabled ? 'Complete o pagamento para continuar navegando' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isDisabled && <Lock className="h-3 w-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
