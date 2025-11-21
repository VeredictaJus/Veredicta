// src/components/chat/UserSelectionModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, MessageCircle, Users, FileText, Shield, Loader2 } from 'lucide-react';
import { UserSearchService, UserSearchResult } from '@/services/userSearchService';
import { cn } from '@/lib/utils';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserSearchResult) => void;
  currentUserId?: string;
}

export default function UserSelectionModal({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId
}: UserSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'client' | 'writer' | 'admin'>('all');

  // Carregar usuários ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Filtrar usuários quando searchTerm ou selectedRole mudam
  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await UserSearchService.getAllUsers(currentUserId);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    onSelectUser(user);
    // Resetar modal
    setSearchTerm('');
    setSelectedRole('all');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'writer':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return 'Cliente';
      case 'writer':
        return 'Redator';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'writer':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (email: string, fullName?: string) => {
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-orange-600" />
            <span>Iniciar Conversa com Usuário</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros por role */}
          <div className="flex space-x-2">
            <Button
              variant={selectedRole === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('all')}
              className="flex-1"
            >
              Todos
            </Button>
            <Button
              variant={selectedRole === 'client' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('client')}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-1" />
              Clientes
            </Button>
            <Button
              variant={selectedRole === 'writer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('writer')}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-1" />
              Redatores
            </Button>
          </div>

          {/* Lista de usuários */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Users className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} alt={user.email} />
                        <AvatarFallback className="bg-orange-100 text-orange-700">
                          {getInitials(user.email, user.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Informações do usuário */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm truncate">
                            {user.full_name || user.email}
                          </p>
                          <Badge className={cn('text-xs', getRoleBadgeColor(user.role))}>
                            <span className="mr-1">{getRoleIcon(user.role)}</span>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                        {user.full_name && (
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Botão de iniciar conversa */}
                    <Button
                      size="sm"
                      onClick={() => handleSelectUser(user)}
                      className="ml-2 flex items-center space-x-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Conversar</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Contador de resultados */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="text-sm text-gray-500 text-center">
              {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

























