import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Filter, XCircle, FileText, MessageSquare, CreditCard, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type FilterType = 'all' | 'invoice_rejected' | 'invoice_reminder' | 'petition' | 'petition_available' | 'message' | 'chat' | 'payment' | 'correction' | 'deadline' | 'approval' | 'status';
type FilterStatus = 'all' | 'unread' | 'read';
type SortOrder = 'newest' | 'oldest' | 'priority';

export default function WriterNotifications() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar e ordenar notificações
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filtro por status (lida/não lida)
    if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        // Por prioridade
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
      }
    });

    return filtered;
  }, [notifications, filterType, filterStatus, sortOrder]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice_rejected': return XCircle;
      case 'invoice_reminder': return XCircle;
      case 'petition': return FileText;
      case 'petition_available': return FileText;
      case 'message': return MessageSquare;
      case 'chat': return MessageSquare;
      case 'payment': return CreditCard;
      case 'correction': return AlertCircle;
      case 'deadline': return Clock;
      case 'approval': return CheckCircle;
      case 'status': return CheckCircle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice_rejected': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'invoice_reminder': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'petition': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'petition_available': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'message': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'chat': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'payment': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'correction': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'deadline': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'approval': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'status': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'invoice_rejected': return 'Nota Fiscal';
      case 'invoice_reminder': return 'Nota Fiscal';
      case 'petition': return 'Petição Atribuída';
      case 'petition_available': return 'Petição Disponível';
      case 'message': return 'Mensagem';
      case 'chat': return 'Chat';
      case 'payment': return 'Pagamento';
      case 'correction': return 'Correção';
      case 'deadline': return 'Prazo';
      case 'approval': return 'Aprovação';
      case 'status': return 'Status';
      default: return 'Sistema';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Mapear tipo de notificação para URL ESPECÍFICA (REDATORES)
  const getNavigationUrl = (notification: any): string | null => {
    const entityType = notification.related_entity_type;
    const entityId = notification.related_entity_id;

    switch (notification.type) {
      // ===== PETIÇÕES ATRIBUÍDAS =====
      case 'petition':
        if (entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}`;
        }
        return '/writer/my-petitions';

      // ===== PETIÇÕES DISPONÍVEIS =====
      case 'petition_available':
        if (entityType === 'petition' && entityId) {
          return `/writer/available?petition=${entityId}`;
        }
        return '/writer/available';

      // ===== CORREÇÃO SOLICITADA =====
      case 'correction':
        if (entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&tab=corrections`;
        } else if (entityType === 'correction' && entityId) {
          // Se temos correction_id, buscar petition_id (ou usar diretamente)
          return `/writer/my-petitions?correction=${entityId}`;
        }
        return '/writer/my-petitions';

      // ===== DEADLINE PRÓXIMO =====
      case 'deadline':
        if (entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&deadline=warning`;
        }
        return '/writer/my-petitions';

      // ===== CHAT / MENSAGENS =====
      case 'chat':
      case 'message':
        if (entityType === 'conversation' && entityId) {
          return `/writer/chat?conversation=${entityId}`;
        }
        return '/writer/chat';

      // ===== PAGAMENTOS =====
      case 'payment':
        return '/writer/payments';

      // ===== NOTA FISCAL =====
      case 'invoice_rejected':
      case 'invoice_reminder':
        return '/writer/payments?tab=invoices';

      // ===== APROVAÇÃO =====
      case 'approval':
        if (entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&approved=true`;
        }
        return '/writer/my-petitions';

      // ===== STATUS (Não redireciona) =====
      case 'status':
      case 'system':
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar para o destino específico
    const url = getNavigationUrl(notification);
    if (url) {
      navigate(url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Notificações
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acompanhe todas as suas notificações em um só lugar
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </Badge>
          )}
        </div>

        {/* Filtros e Ações */}
        <Card className="dark:bg-gray-800/50 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {/* Filtro por Tipo */}
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="petition">Petições Atribuídas</SelectItem>
                    <SelectItem value="petition_available">Petições Disponíveis</SelectItem>
                    <SelectItem value="correction">Correções</SelectItem>
                    <SelectItem value="deadline">Prazos</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="message">Mensagens</SelectItem>
                    <SelectItem value="payment">Pagamentos</SelectItem>
                    <SelectItem value="invoice_reminder">Notas Fiscais</SelectItem>
                    <SelectItem value="invoice_rejected">Notas Rejeitadas</SelectItem>
                    <SelectItem value="approval">Aprovações</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro por Status */}
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigas</SelectItem>
                    <SelectItem value="priority">Por prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ação: Marcar todas como lidas */}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filterType !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros para ver mais notificações'
                  : 'Você não tem notificações no momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getIcon(notification.type || 'system');
            const isExpanded = expandedId === notification.id;

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 ${
                  !notification.is_read 
                    ? 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20 dark:border-l-orange-400' 
                    : 'dark:bg-gray-800/50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <Avatar className={`w-12 h-12 ${getTypeColor(notification.type || 'system')}`}>
                      <AvatarFallback className={getTypeColor(notification.type || 'system')}>
                        <IconComponent className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-semibold text-gray-900 dark:text-gray-100 ${
                              !notification.is_read ? 'font-bold' : ''
                            }`}>
                              {notification.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeName(notification.type || 'system')}
                            </Badge>
                          </div>
                          <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                            isExpanded ? '' : 'line-clamp-2'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Metadados */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        {notification.priority && notification.priority !== 'normal' && (
                          <Badge 
                            variant={notification.priority === 'high' || notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority === 'urgent' ? 'Urgente' : 
                             notification.priority === 'high' ? 'Alta' : 
                             notification.priority === 'low' ? 'Baixa' : 'Normal'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Contador */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredNotifications.length} de {notifications.length} notificações
        </div>
      )}
    </div>
  );
}
