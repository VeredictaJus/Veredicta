import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { ClientProfile, WriterProfile, AdminProfile } from '@/types';

export default function Header() {
  const { user, profile, logout } = useAuth();

  const getDisplayName = () => {
    if (!profile) return user?.email;
    
    if ('company_name' in profile) {
      return (profile as ClientProfile).company_name;
    }
    if ('full_name' in profile) {
      return (profile as WriterProfile | AdminProfile).full_name;
    }
    return user?.email;
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'CLIENT': return 'Cliente';
      case 'WRITER': return 'Redator';
      case 'ADMIN': return 'Administrador';
      default: return 'Usuário';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard Veredicta
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{getDisplayName()}</div>
                  <div className="text-xs text-gray-500">{getRoleLabel()}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
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