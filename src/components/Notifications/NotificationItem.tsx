import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, CreditCard, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { DatabaseService } from '@/services/databaseService';

// Usar o tipo correto do banco de dados
type Notification = Awaited<ReturnType<typeof DatabaseService.getUserNotifications>>[number];

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const formatTimestamp = (timestamp: string | Date) => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days === 1) return 'Ontem';
  return `Há ${days} dias`;
};

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  const { user } = useNewAuth();
  
  // Mapear tipo de notificação para ícone
  const getIcon = (type: string) => {
    switch (type) {
      case 'plan_expiring_soon': return Clock;
      case 'plan_expired': return AlertCircle;
      case 'limit_reached': return AlertCircle;
      case 'limit_near': return AlertCircle;
      case 'invoice_rejected': return XCircle;
      case 'petition': return FileText;
      case 'petition_delivered': return FileText;
      case 'petition_available': return FileText;
      case 'message': return MessageSquare;
      case 'chat': return MessageSquare;
      case 'payment': return CreditCard;
      case 'correction': return AlertCircle;
      case 'deadline': return Clock;
      case 'invoice_reminder': return XCircle;
      case 'approval': return CheckCircle;
      case 'status': return CheckCircle;
      default: return FileText;
    }
  };
  
  const IconComponent = getIcon(notification.type || 'system');

  // Mapear tipo de notificação para URL ESPECÍFICA
  const getNavigationUrl = (notification: Notification): string | null => {
    const userRole = user?.role?.toLowerCase() || 'client';
    const entityType = notification.related_entity_type;
    const entityId = notification.related_entity_id;

    switch (notification.type) {
      // ===== PLANOS (Genérico) =====
      case 'plan_expiring_soon':
      case 'plan_expired':
      case 'limit_reached':
      case 'limit_near':
        if (userRole === 'admin') {
          return '/admin/plans';
        }
        return `/${userRole}/plans`;

      // ===== PAGAMENTOS =====
      case 'payment':
        if (userRole === 'admin') {
          return '/admin/pagamentos';
        }
        if (userRole === 'writer') {
          return '/writer/payments';
        }
        return `/${userRole}/plans`;

      // ===== PETIÇÕES ATRIBUÍDAS (Redator) =====
      case 'petition':
      case 'petition_delivered':
        if (userRole === 'admin') {
          // ✅ CORREÇÃO: Admin usa rota específica de peticoes
          if (entityType === 'petition' && entityId) {
            return `/admin/peticoes?petition=${entityId}`;
          }
          return '/admin/peticoes';
        }
        if (userRole === 'writer') {
          if (entityType === 'petition' && entityId) {
            // Redireciona para "Minhas Petições" com a petição específica
            return `/writer/my-petitions?petition=${entityId}`;
          }
          return '/writer/my-petitions';
        }
        // Cliente - redireciona para lista de petições (não existe rota individual)
        if (entityType === 'petition' && entityId) {
          return `/${userRole}/petitions?petition=${entityId}`;
        }
        return `/${userRole}/petitions`;

      // ===== CORREÇÃO SOLICITADA (Redator) =====
      case 'correction':
        if (userRole === 'writer' && entityType === 'correction' && entityId) {
          // Buscar petition_id da correção (se necessário)
          // Por enquanto, usar related_entity_id se for petition_id
          return `/writer/my-petitions?correction=${entityId}`;
        } else if (userRole === 'writer' && entityType === 'petition' && entityId) {
          // Se a correção tem petition_id diretamente
          return `/writer/my-petitions?petition=${entityId}&tab=corrections`;
        }
        return userRole === 'writer' ? '/writer/my-petitions' : null;

      // ===== DEADLINE PRÓXIMO (Redator) =====
      case 'deadline':
        if (userRole === 'writer' && entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&deadline=warning`;
        }
        return userRole === 'writer' ? '/writer/my-petitions' : null;

      // ===== PETIÇÕES DISPONÍVEIS (Redator) =====
      case 'petition_available':
        if (userRole === 'writer' && entityType === 'petition' && entityId) {
          return `/writer/available?petition=${entityId}`;
        }
        return userRole === 'writer' ? '/writer/available' : null;

      // ===== CHAT / MENSAGENS =====
      case 'chat':
      case 'message':
        if (userRole === 'admin') {
          // ✅ CORREÇÃO: Admin usa rota específica de chat-suporte
          if (entityType === 'conversation' && entityId) {
            return `/admin/chat-suporte?conversation=${entityId}`;
          }
          return '/admin/chat-suporte';
        }
        if (entityType === 'conversation' && entityId) {
          return `/${userRole}/chat?conversation=${entityId}`;
        }
        return `/${userRole}/chat`;

      // ===== SUPORTE (Específico por Conversa) =====
      case 'support':
        if (userRole === 'admin') {
          // ✅ CORREÇÃO: Admin usa rota específica de chat-suporte
          if (entityId) {
            return `/admin/chat-suporte?conversation=${entityId}`;
          }
          return '/admin/chat-suporte';
        }
        if (entityId) {
          return `/${userRole}/chat?conversation=${entityId}`;
        }
        return `/${userRole}/chat`;

      // ===== NOTA FISCAL / INVOICE =====
      case 'invoice_rejected':
      case 'invoice_reminder':
        if (userRole === 'writer') {
          return '/writer/payments?tab=invoices';
        }
        return null;

      // ===== APROVAÇÃO (Redator) =====
      case 'approval':
        if (userRole === 'writer' && entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&approved=true`;
        }
        return userRole === 'writer' ? '/writer/my-petitions' : null;

      // ===== STATUS (Não redireciona) =====
      case 'status':
      case 'system':
      default:
        return null;
    }
  };

  const handleClick = () => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar se houver URL
    const url = getNavigationUrl(notification);
    if (url) {
      navigate(url);
      onClose();
    } else {
      // Se não houver redirecionamento, apenas fecha
      onClose();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'plan_expiring_soon': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'plan_expired': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'limit_reached': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'limit_near': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'invoice_rejected': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'invoice_reminder': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'petition': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'petition_delivered': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'petition_available': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'message': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'chat': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'payment': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'correction': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'deadline': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'approval': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'status': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
      case 'support': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getNotificationStyle = () => {
    // Notificações urgentes/críticas em vermelho
    if (notification.type === 'plan_expired' || notification.type === 'limit_reached') {
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/50 dark:border-l-red-400';
    }
    // Plano expirando em laranja
    if (notification.type === 'plan_expiring_soon') {
      return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/50 dark:border-l-orange-400';
    }
    // Limite próximo em amarelo
    if (notification.type === 'limit_near') {
      return 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 dark:border-l-yellow-400';
    }
    // Nota fiscal rejeitada em vermelho (redatores)
    if (notification.type === 'invoice_rejected') {
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/50 dark:border-l-red-400';
    }
    // Não lidas em geral
    if (!notification.is_read) {
      return 'bg-orange-50 border-l-4 border-l-orange-500 dark:bg-orange-950/50 dark:border-l-orange-400';
    }
    return '';
  };

  return (
    <div 
      className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${getNotificationStyle()}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <Avatar className={`w-10 h-10 ${getTypeColor(notification.type || 'system')}`}>
          <AvatarFallback className={getTypeColor(notification.type || 'system')}>
            <IconComponent className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-sm font-medium dark:text-gray-200 ${!notification.is_read ? 'font-semibold' : ''}`}>
              {notification.title || 'Notificação'}
            </p>
            <div className="flex items-center space-x-2">
              {!notification.is_read && (
                <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full">
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {notification.created_at ? formatTimestamp(notification.created_at) : 'Agora'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {notification.message || ''}
          </p>
        </div>
      </div>
    </div>
  );
}