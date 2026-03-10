import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Link2,
  FileText,
  DollarSign,
  BarChart3,
  Bot,
  MessageSquare,
  Layers,
  Settings,
  UserCheck,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const navItems: Item[] = [
  { to: '/admin',            label: 'Dashboard',   icon: Home, exact: true },
  { to: '/admin/users',      label: 'Usuários',    icon: Users },
  { to: '/admin/ativacoes',  label: 'Ativações',   icon: Link2 },
  { to: '/admin/writer-approval', label: 'Aprovação de Redatores', icon: UserCheck },
  { to: '/admin/peticoes',   label: 'Petições',    icon: FileText },
  { to: '/admin/pagamentos', label: 'Pagamentos',  icon: DollarSign },
  { to: '/admin/relatorios', label: 'Relatórios',  icon: BarChart3 },
  // ✅ renomeado e apontando para a nova rota
  { to: '/admin/Revisoes',   label: 'Revisões',    icon: Bot },
  // ✅ corrigido para bater com App.tsx
  { to: '/admin/chat-suporte', label: 'Chat Suporte', icon: MessageSquare },
  // ✅ corrigido: /admin/planos -> /admin/plans
  { to: '/admin/plans',      label: 'Planos',      icon: Layers },
  // ✅ corrigido: /admin/config -> /admin/settings
  { to: '/admin/settings',   label: 'Configurações', icon: Settings },
];

function linkClass(isActive: boolean) {
  const base =
    'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent transition-all duration-200 outline-none';
  const focus = 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const off =
    'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:-translate-y-[1px] hover:shadow-sm hover:border-border/60 motion-reduce:transform-none';
  const on = 'bg-primary/10 text-foreground border-primary/20 shadow-sm';
  return `${base} ${focus} ${isActive ? on : off}`;
}

export function AdminSidebar({
  open = true,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* overlay no mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`
          fixed z-50 lg:translate-x-0
          top-0 left-0 bottom-0 w-64 border-r border-border shadow-sm
          transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col text-sm
          overflow-hidden
          bg-gradient-to-b from-background to-muted/30
          dark:from-slate-950 dark:to-slate-900/30
          before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:z-0
          before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_55%)]
          dark:before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_55%)]
        `}
      >
        {/* Logo Section - Padronizado como WriterLayout */}
        <div className="p-6 relative z-10">
          <Logo size="md" textSize="xl" align="center" />
        </div>

        {/* Menu Section - Padronizado */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto relative z-10">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={!!exact}
              className={({ isActive }) => linkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    )}
                  />
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className={cn('flex-1 truncate', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}