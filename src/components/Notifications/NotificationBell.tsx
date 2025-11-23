import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, MessageSquare, FileText, CreditCard, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNewAuth } from '@/contexts/NewAuthContext';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { user } = useNewAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  console.log('🔔 NotificationBell - notifications:', notifications);
  console.log('🔔 NotificationBell - unreadCount:', unreadCount);

  const recentNotifications = notifications.slice(0, 10);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'petition':
      case 'petition_delivered':
      case 'petition_available':
        return <FileText className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'correction':
      case 'invoice_rejected':
      case 'limit_reached':
      case 'plan_expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'deadline':
      case 'plan_expiring_soon':
      case 'limit_near':
      case 'invoice_reminder':
        return <Clock className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  // Mapear tipo de notificação para URL ESPECÍFICA
  const getNavigationUrl = (notification: any): string | null => {
    const userRole = user?.role?.toLowerCase() || 'client';
    const entityType = notification.related_entity_type;
    const entityId = notification.related_entity_id;

    switch (notification.type) {
      // ===== PLANOS =====
      case 'plan_expiring_soon':
      case 'plan_expired':
      case 'limit_reached':
      case 'limit_near':
        return `/${userRole}/plans`;

      // ===== PAGAMENTOS =====
      case 'payment':
        if (userRole === 'writer') {
          return '/writer/payments';
        }
        return `/${userRole}/plans`;

      // ===== PETIÇÕES =====
      case 'petition':
      case 'petition_delivered':
        if (userRole === 'writer') {
          if (entityType === 'petition' && entityId) {
            return `/writer/my-petitions?petition=${entityId}`;
          }
          return '/writer/my-petitions';
        }
        // Cliente
        if (entityType === 'petition' && entityId) {
          return `/${userRole}/petitions?petition=${entityId}`;
        }
        return `/${userRole}/petitions`;

      // ===== CHAT / MENSAGENS =====
      case 'chat':
      case 'message':
        if (entityType === 'conversation' && entityId) {
          return `/${userRole}/chat?conversation=${entityId}`;
        }
        return `/${userRole}/chat`;

      // ===== CORREÇÃO (Redator) =====
      case 'correction':
        if (userRole === 'writer' && entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&tab=corrections`;
        }
        return userRole === 'writer' ? '/writer/my-petitions' : null;

      // ===== DEADLINE (Redator) =====
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

      // ===== APROVAÇÃO (Redator) =====
      case 'approval':
        if (userRole === 'writer' && entityType === 'petition' && entityId) {
          return `/writer/my-petitions?petition=${entityId}&approved=true`;
        }
        return userRole === 'writer' ? '/writer/my-petitions' : null;

      // ===== NOTA FISCAL (Redator) =====
      case 'invoice_rejected':
      case 'invoice_reminder':
        if (userRole === 'writer') {
          return '/writer/payments?tab=invoices';
        }
        return null;

      // ===== SUPORTE =====
      case 'support':
        if (entityId) {
          return `/${userRole}/chat?conversation=${entityId}`;
        }
        return `/${userRole}/chat`;

      // ===== STATUS (Não redireciona) =====
      case 'status':
      case 'system':
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navegar para o destino específico
    const url = getNavigationUrl(notification);
    if (url) {
      navigate(url);
      setIsOpen(false);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-[calc(100vh-4rem)] overflow-visible z-[100]"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-2 sticky top-0 bg-background z-10 border-b">
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4">
              {recentNotifications.map((notification) => {
                try {
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-0 focus:bg-transparent"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={`w-full p-3 border-l-4 ${
                          notification.is_read 
                            ? 'border-transparent bg-transparent' 
                            : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        } hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex-shrink-0 text-muted-foreground">
                              {getTypeIcon(notification.type || 'system')}
                            </div>
                            <p className={`text-sm font-medium truncate ${getPriorityColor(notification.priority || 'normal')}`}>
                              {notification.title || 'Sem título'}
                            </p>
                          </div>
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2 break-words">
                              {notification.message || 'Sem mensagem'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.created_at ? formatTimeAgo(notification.created_at) : 'Agora'}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                } catch (error) {
                  console.error('Erro ao renderizar notificação:', notification, error);
                  return null;
                }
              })}
            </div>
          </ScrollArea>
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 sticky bottom-0 bg-background border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => {
                  const userRole = user?.role?.toLowerCase() || 'client';
                  navigate(`/${userRole}/notifications`);
                  setIsOpen(false);
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};