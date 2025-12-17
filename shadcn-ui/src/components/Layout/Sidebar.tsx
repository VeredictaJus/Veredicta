import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  CreditCard, 
  Settings, 
  Users, 
  BarChart3,
  Briefcase,
  DollarSign,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const clientNavItems = [
  { icon: Home, label: 'Dashboard', href: '/client' },
  { icon: FileText, label: 'Minhas Petições', href: '/client/petitions' },
  { icon: CreditCard, label: 'Créditos', href: '/client/credits' },
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
  { icon: CreditCard, label: 'Planos', href: '/admin/plans' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'CLIENT': return clientNavItems;
      case 'WRITER': return writerNavItems;
      case 'ADMIN': return adminNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Veredicta</span>
        </div>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}