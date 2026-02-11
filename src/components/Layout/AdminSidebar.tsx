import React from 'react';
import { NavLink } from 'react-router-dom';
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
  const base = 'flex items-center space-x-2 px-4 py-2 rounded-md font-semibold transition-colors';
  const off = 'text-muted-foreground hover:bg-muted hover:text-foreground';
  const on = 'bg-primary/10 text-primary';
  return `${base} ${isActive ? on : off}`;
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
          top-0 left-0 bottom-0 w-64 bg-background border-r border-border shadow-sm
          transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col text-sm
        `}
      >
        {/* Logo Section - Padronizado como WriterLayout */}
        <div className="p-6 border-b border-border">
          <Logo size="md" textSize="xl" align="center" />
        </div>

        {/* Menu Section - Padronizado como WriterLayout */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={!!exact}
              className={({ isActive }) => linkClass(isActive)}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}