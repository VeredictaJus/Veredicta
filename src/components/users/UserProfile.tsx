import React, { useState, useEffect } from 'react';
import { User, ActivityLog } from '../../types/user';
import { UserService } from '../../services/userService';
import { AuthService } from '../../services/authService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Activity,
  Crown,
  PenTool,
  FileText,
  Badge,
  Clock,
  Edit,
  AlertCircle
} from 'lucide-react';
import { useParams } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userLogs, setUserLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadUserProfile();
    }
  }, [id]);

  const loadUserProfile = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const userData = await UserService.getUserById(id);
      if (!userData) {
        setError('Usuário não encontrado');
        return;
      }
      
      setUser(userData);
      
      // Load user activity logs
      const logsResult = await UserService.getActivityLogs(1, 10, { userId: id });
      setUserLogs(logsResult.logs);
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'editor':
        return <PenTool className="h-5 w-5 text-blue-600" />;
      case 'redactor':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', class: 'bg-yellow-100 text-yellow-800' },
      editor: { label: 'Editor', class: 'bg-blue-100 text-blue-800' },
      redactor: { label: 'Redator', class: 'bg-green-100 text-green-800' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inativo', class: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || status}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro</h3>
          <p className="text-gray-600">{error || 'Usuário não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
        {AuthService.hasPermission('users', 'update') && (
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-gray-600" />
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getRoleIcon(user.role)}
                {getRoleBadge(user.role)}
              </div>
              
              <div className="mb-4">
                {getStatusBadge(user.status)}
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">{user.phone}</span>
                </div>
              )}
              
              {user.oab && (
                <div className="flex items-center">
                  <Badge className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">{user.oab}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">
                  Membro desde {formatDate(user.createdAt)}
                </span>
              </div>
              
              {user.lastLoginAt && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">
                    Último login: {formatDateTime(user.lastLoginAt)}
                  </span>
                </div>
              )}
            </div>

            {user.bio && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Biografia</h4>
                <p className="text-sm text-gray-600">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Conta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">{getStatusBadge(user.status)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <p className="mt-1">{getRoleBadge(user.role)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(user.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(user.updatedAt)}</p>
              </div>
              
              {user.specialty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                  <p className="mt-1 text-sm text-gray-900">{user.specialty}</p>
                </div>
              )}
              
              {user.activatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Ativação</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(user.activatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            
            {userLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhuma atividade registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <Activity className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {log.action.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {log.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};