import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, X, Maximize2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useAvatar } from '@/contexts/AvatarContext';
import { useChat } from '@/contexts/ChatContext';
import { useNotificationSound } from '@/contexts/NotificationSoundContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DisplayConversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export default function FloatingChatModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useNewAuth();
  const { avatarUrl } = useAvatar();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { play: playNotificationSound } = useNotificationSound();
  const lastConversationMapRef = useRef<Map<string, { lastMessageAt: string | null }>>(new Map());

  const {
    conversations,
    currentConversation,
    loadConversations,
    selectConversation,
    loadConversationMessages,
  } = useChat();

  // Não mostrar o modal se estiver na página do chat
  const isOnChatPage = location.pathname.includes('/chat');

  useEffect(() => {
    if (!user || isOnChatPage) return;
    loadConversations();
  }, [user, isOnChatPage, loadConversations]);

  // Delay inicial para evitar flash do modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // 1 segundo de delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialized || !conversations?.length) {
      return;
    }

    const previousMap = lastConversationMapRef.current;
    let shouldPlay = false;

    conversations.forEach(conv => {
      const lastActivity = conv.last_message_at || conv.updated_at || conv.created_at || null;
      const previous = previousMap.get(conv.id);
      const isSameConversation = currentConversation?.id === conv.id;
      const hasNewActivity = lastActivity && previous?.lastMessageAt !== lastActivity;
      const hasUnread = (conv.unread_count || 0) > 0;

      if (hasNewActivity && hasUnread && !isSameConversation && !isOpen) {
        shouldPlay = true;
      }

      previousMap.set(conv.id, { lastMessageAt: lastActivity });
    });

    if (
      shouldPlay &&
      typeof document !== 'undefined' &&
      !document.hasFocus()
    ) {
      playNotificationSound();
    }
  }, [conversations, currentConversation?.id, isInitialized, isOpen, playNotificationSound]);

  const displayConversations = useMemo(() => {
      const relevant = conversations
        .filter(conv => conv.type === 'petition' || conv.type === 'support' || conv.type === 'general')
        .map(conv => ({
          ...conv,
          lastActivity: conv.last_message_at || conv.updated_at || conv.created_at,
        }));
      
      // ✅ OTIMIZAÇÃO: Cachear timestamps para evitar múltiplas conversões
      const timestampCache = new Map<string, number>();
      relevant.sort((a, b) => {
        if (!a.lastActivity && !b.lastActivity) return 0;
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        
        if (!timestampCache.has(a.lastActivity!)) {
          timestampCache.set(a.lastActivity!, new Date(a.lastActivity!).getTime());
        }
        if (!timestampCache.has(b.lastActivity!)) {
          timestampCache.set(b.lastActivity!, new Date(b.lastActivity!).getTime());
        }
        
        return timestampCache.get(b.lastActivity!)! - timestampCache.get(a.lastActivity!)!;
      });
      
      return relevant.map(conv => {
        // Função segura para formatar data
        const formatTime = (dateString: string | undefined) => {
          if (!dateString) return 'Agora';
          try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
          } catch (error) {
            console.warn('Erro ao formatar data:', dateString, error);
            return 'Agora';
          }
        };

      const metadata = (conv.metadata || {}) as Record<string, any>;
      const userRole = user?.role || 'client';
      let displayName = conv.title || 'Usuário';
      
      if (conv.type === 'support') {
        // Se é admin visualizando, mostrar nome do cliente/redator
        if (userRole === 'admin') {
          displayName = metadata.otherParticipantName || 
                       metadata.other_participant_name || 
                       metadata.partnerName || 
                       metadata.partner_name || 
                       'Cliente';
        } else {
          // Se é cliente/redator visualizando, mostrar "Suporte Veredicta"
          displayName = 'Suporte Veredicta';
        }
      } else if (metadata.otherParticipantName || metadata.other_participant_name) {
        displayName = metadata.otherParticipantName || metadata.other_participant_name;
      } else if (metadata.partnerName || metadata.partner_name) {
        displayName = metadata.partnerName || metadata.partner_name;
      }

        // Limitar mensagem a 50 caracteres e adicionar "..."
        const messageText = conv.last_message_content || 'Nenhuma mensagem';
        const truncatedMessage = messageText.length > 50 
          ? messageText.substring(0, 50) + '...'
          : messageText;

        return {
          id: conv.id,
          title: displayName,
          lastMessage: truncatedMessage,
          lastMessageTime: formatTime(conv.last_message_at) || formatTime(conv.updated_at) || 'Agora',
          unreadCount: conv.unread_count || 0,
          metadata,
          type: conv.type,
        };
      }).slice(0, 6);
  }, [conversations, user?.role]);

  const handleOpenChat = () => {
    const role = user?.role?.toLowerCase();
    const chatPath = role === 'client' ? '/client/chat' : 
                    role === 'writer' ? '/writer/chat' : 
                    role === 'admin' ? '/admin/chat-suporte' : '/chat';
    navigate(chatPath);
  };

  const handleConversationClick = async (conversationId: string) => {
    const role = user?.role?.toLowerCase();
    const chatPath = role === 'client' ? '/client/chat' : 
                    role === 'writer' ? '/writer/chat' : 
                    role === 'admin' ? '/admin/chat-suporte' : '/chat';
    
    setIsOpen(false);
    
    // ✅ CORREÇÃO: Garantir que as conversas estejam carregadas antes de navegar
    if (conversations.length === 0) {
      try {
        await loadConversations();
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      }
    }
    
    // ✅ Navegar com o parâmetro da conversa
    navigate(`${chatPath}?conversation=${conversationId}`);
    
    // ✅ CORREÇÃO: Fazer selectConversation e loadConversationMessages em background (não bloqueia a navegação)
    (async () => {
      try {
        await selectConversation(conversationId);
        await loadConversationMessages(conversationId);
      } catch (error) {
        console.error('Erro ao selecionar conversa em background:', error);
      }
    })();
  };

  const totalUnreadCount = displayConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // URL fixa para avatar do admin/suporte
  const getAdminAvatarUrl = React.useCallback(() => {
    return '/veredicta-logo.png';
  }, []);
  
  // Obter avatar da conversa
  const getConversationAvatar = React.useCallback((conversation: any): string | undefined => {
    const userRole = user?.role || 'client';
    
    // Se é conversa de suporte e o usuário é cliente/redator, mostrar logo fixo do admin
    if (conversation.type === 'support' && userRole !== 'admin') {
      return getAdminAvatarUrl();
    }
    
    // Para outras conversas, usar avatar do metadata
    return conversation.metadata?.avatar_url || undefined;
  }, [user?.role, getAdminAvatarUrl]);

  // O título sempre será "Mensagens"
  const getDisplayTitle = () => 'Mensagens';

  // 🚀 CORREÇÃO: Não mostrar apenas se estiver na página do chat ou não foi inicializado
  // Permitir mostrar mesmo sem conversas para que o usuário possa criar novas
  if (isOnChatPage || !isInitialized) {
    return null;
  }

  return (
    <>
      {/* Botão flutuante minimizado */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-3 min-w-[200px]"
          >
            <div className="relative">
              <MessageSquare className="h-5 w-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              )}
            </div>
            <span className="font-medium">Mensagens</span>
            {displayConversations.length > 0 && (
              <span className="text-xs text-gray-400">
                ({displayConversations.length})
              </span>
            )}
            {/* 🖼️ AVATARES DOS OUTROS PARTICIPANTES (com quem você conversa) */}
            <div className="flex -space-x-2">
              {displayConversations.slice(0, 3).map((conv, idx) => {
                const avatarUrl = getConversationAvatar(conv);
                const initials = conv.metadata?.initials;
                
                // Gerar iniciais a partir do título se não tiver em metadata
                const getInitials = (name: string) => {
                  return name
                    .split(' ')
                    .map(n => n[0])
                    .filter(n => n)
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                };

                const avatarText = initials || (conv.title ? getInitials(conv.title) : '?');
                
                return (
                  <Avatar key={conv.id} className="h-7 w-7 border-2 border-white">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-xs bg-orange-100 text-orange-800">
                      {avatarText}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
          </Button>
        </div>
      )}

      {/* Modal do chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{getDisplayTitle()}</h3>
              {totalUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de conversas */}
          {!isMinimized && (
            <ScrollArea className="flex-1">
              <div className="p-2">
                {displayConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                    <h4 className="text-gray-300 font-medium mb-2">Nenhuma conversa</h4>
                    <p className="text-gray-500 text-sm mb-4">Você ainda não tem conversas ativas</p>
                    <Button
                      onClick={handleOpenChat}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Abrir Chat Completo
                    </Button>
                  </div>
                ) : (
                  displayConversations.map((conversation) => {
                  const avatarUrl = getConversationAvatar(conversation);
                  const initials = conversation.metadata?.initials;
                  
                  // Gerar iniciais a partir do título se não tiver em metadata
                  const getInitials = (name: string) => {
                    return name
                      .split(' ')
                      .map(n => n[0])
                      .filter(n => n)
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                  };

                  const avatarText = initials || (conversation.title ? getInitials(conversation.title) : '?');
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
                        currentConversation?.id === conversation.id ? 'bg-gray-800/80' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl} className="object-cover" />
                        <AvatarFallback>
                          {avatarText}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium truncate">
                            {conversation.title}
                          </h4>
                          <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                            {conversation.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  );
                })
                )}
              </div>
            </ScrollArea>
          )}

          {/* Footer com botão de nova conversa */}
          {!isMinimized && (
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={handleOpenChat}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Abrir Chat Completo
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
