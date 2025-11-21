import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { useNotificationSound } from '@/contexts/NotificationSoundContext';
import { MessageCircle, Bell, BellOff } from 'lucide-react';

interface AdminChatNotificationProps {
  className?: string;
}

export default function AdminChatNotification({ className }: AdminChatNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const { getUnreadCount, conversations } = useChat();
  const unreadCount = getUnreadCount();
  const { play: playNotificationSound, enabled: soundEnabled, toggle: toggleSound } = useNotificationSound();

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mostrar notificação do navegador
  const showBrowserNotification = (title: string, body: string) => {
    if (!notificationsEnabled || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'chat-notification'
      });
    }
  };

  // Detectar novas mensagens
  const previousUnreadCountRef = useRef(0);
  
  useEffect(() => {
    // Se o contador aumentou, significa que há novas mensagens
    if (unreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current >= 0) {
      // Tocar som de notificação (se habilitado)
      if (soundEnabled) {
        playNotificationSound();
      }
      
      // Mostrar notificação do navegador (se habilitado)
      if (notificationsEnabled) {
        showBrowserNotification(
          'Nova mensagem',
          'Você tem uma nova mensagem no chat'
        );
      }
    }
    
    // Atualizar referência para próxima comparação
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, notificationsEnabled, soundEnabled, playNotificationSound]);

  // Alternar notificações
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão de notificação */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <Card className="absolute top-10 right-0 w-80 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notificações</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  title={soundEnabled ? "Desabilitar som" : "Habilitar som"}
                >
                  {soundEnabled ? "🔊" : "🔇"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleNotifications}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {conversations
                  .filter(c => c.unread_count > 0)
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.title}
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message_content}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {conversation.last_message_at && 
                                new Date(conversation.last_message_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
                
                {conversations.filter(c => c.unread_count > 0).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
