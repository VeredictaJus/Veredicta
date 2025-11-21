import React, { useState } from 'react';
import { UserRole } from '../../types/user';
import { UserService } from '../../services/userService';
import { AuthService } from '../../services/authService';
import { 
  Mail, 
  UserPlus, 
  Crown, 
  PenTool, 
  FileText, 
  Send,
  Check,
  AlertCircle
} from 'lucide-react';

interface UserInviteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UserInviteForm: React.FC<UserInviteFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'redactor' as UserRole,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }

      await UserService.inviteUser(
        formData.email.trim(),
        formData.role,
        currentUser.id
      );

      // Mock email sending - in production, integrate with EmailJS or backend
      console.log('Invitation email sent to:', formData.email);
      console.log('Role:', formData.role);
      console.log('Message:', formData.message);

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor':
        return <PenTool className="h-4 w-4 text-blue-600" />;
      case 'redactor':
        return <FileText className="h-4 w-4 text-green-600" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Acesso total ao sistema, pode gerenciar usuários e configurações';
      case 'editor':
        return 'Pode criar, editar e publicar artigos, gerenciar conteúdo';
      case 'redactor':
        return 'Pode criar e editar artigos, aguarda aprovação para publicação';
    }
  };

  if (!AuthService.hasPermission('users', 'invite')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para convidar usuários.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Convite Enviado!
          </h3>
          <p className="text-green-700">
            O convite foi enviado para <strong>{formData.email}</strong>. 
            Eles receberão um email com instruções para ativar a conta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <UserPlus className="h-6 w-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Convidar Novo Usuário
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Usuário *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="usuario@exemplo.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função (Role) *
            </label>
            <div className="space-y-3">
              {(['admin', 'editor', 'redactor'] as UserRole[]).map((role) => (
                <label key={role} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center mb-1">
                      {getRoleIcon(role)}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Redator'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem Personalizada (Opcional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Adicione uma mensagem personalizada ao convite..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Como funciona o convite:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• O usuário receberá um email com link de ativação</li>
            <li>• O link será válido por 7 dias</li>
            <li>• Após ativar, poderá fazer login com a função selecionada</li>
            <li>• Você receberá uma notificação quando o convite for aceito</li>
          </ul>
        </div>
      </div>
    </div>
  );
};