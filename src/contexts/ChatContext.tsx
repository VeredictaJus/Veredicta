import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ChatService, Conversation, Message, ConversationParticipant } from '@/services/chatService';
import { ConversationPermissionService } from '@/services/conversationPermissionService';
import { SupportBotService } from '@/services/supportBotService';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useNotificationSound } from '@/contexts/NotificationSoundContext';
import { supabase } from '@/lib/supabaseClient';
import { containsExplicitLanguage } from '@/utils/messageFilter';

const MESSAGE_PAGE_SIZE = 50;

interface ChatContextType {
  // Estado
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  participants: ConversationParticipant[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingOlderMessages: boolean;
  error: string | null;
  hasMoreOlderMessages: boolean;
  
  // Ações
  loadConversations: () => Promise<void>;
  loadConversationMessages: (conversationId: string) => Promise<Message[]>;
  loadOlderMessages: () => Promise<number>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (
    content: string,
    messageType?: 'text' | 'file' | 'image' | 'system' | 'audio',
    fileData?: { url: string; name: string; size: number },
    replyToId?: string,
    files?: File[]
  ) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  createConversation: (title: string, type: 'support' | 'petition' | 'general', participants: { userId: string; role: 'client' | 'writer' | 'admin' | 'support' }[], metadata?: { petitionId?: string; [key: string]: any }) => Promise<string>;
  updateConversationStatus: (status: 'active' | 'closed' | 'archived', priority?: 'low' | 'normal' | 'high' | 'urgent', assignedTo?: string) => Promise<void>;
  
  // Utilitários
  getUnreadCount: () => number;
  getConversationUnreadCount: (conversationId: string) => number;
  
  // Exclusão
  deleteConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  
  // Sistema de Permissões - NOVA FUNCIONALIDADE
  getAvailableUsers: () => Promise<Array<{
    userId: string;
    userName: string;
    userRole: string;
    conversationType: 'support' | 'petition' | 'general';
    reason: string;
  }>>;
  createConversationWithUser: (targetUserId: string, title: string, message?: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    // 🚀 CORREÇÃO: Não mostrar warning repetitivo, apenas retornar contexto padrão
    // O warning será mostrado apenas uma vez por sessão
    if (!(window as any).chatContextWarningShown) {
      console.warn('useChat deve ser usado dentro de ChatProvider');
      (window as any).chatContextWarningShown = true;
    }
    
    // Retornar um contexto padrão ao invés de lançar erro
    return {
      conversations: [],
      currentConversation: null,
      messages: [],
      participants: [],
      isLoading: false,
      isLoadingMessages: false,
      isLoadingOlderMessages: false,
      error: null,
      hasMoreOlderMessages: true,
      loadConversations: async () => {},
      loadConversationMessages: async () => [],
      loadOlderMessages: async () => 0,
      selectConversation: async () => {},
      sendMessage: async () => {},
      markAsRead: async () => {},
      createConversation: async () => '',
      updateConversationStatus: async () => {},
      getUnreadCount: () => 0,
      getConversationUnreadCount: () => 0,
      deleteConversation: async () => {},
      archiveConversation: async () => {},
      
      // Sistema de Permissões - NOVA FUNCIONALIDADE
      getAvailableUsers: async () => [],
      createConversationWithUser: async () => ''
    } as ChatContextType;
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // CORREÇÃO CRÍTICA: Verificar se o contexto está disponível antes de usar
  let user = null;
  let loading = true;
  
  try {
    const authContext = useNewAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.warn('ChatProvider: NewAuthContext não disponível ainda');
  }
  
  const { play: playNotificationSound } = useNotificationSound();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProviderReady, setIsProviderReady] = useState(false);
  const messagePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conversationPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  
  // 🚀 CORREÇÃO: Usar refs ao invés de estados para controles internos (evita re-renders e loops)
  const isLoadingConversationsRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const isLoadingOlderMessagesRef = useRef<boolean>(false);
  const oldestMessageRef = useRef<string | null>(null);
  
  // 🚀 CACHE: Para reduzir chamadas ao banco e Disk IO (usando useRef para evitar re-renders)
  const lastConversationsLoadRef = useRef<number>(0);
  const CACHE_DURATION = useRef(5000); // 5 segundos de cache (reduzido para evitar problemas)

  const CHAT_BUCKET = 'chat_attachments';
  const localPreviewOverridesRef = useRef<Map<string, { preview: string; createdAt: string }>>(new Map());

  const applyLastMessageOverride = useCallback(
    (
      conversationId: string,
      serverPreview: string | undefined | null,
      serverCreatedAt: string | null | undefined
    ) => {
      const override = localPreviewOverridesRef.current.get(conversationId);
      const serverTimestamp = serverCreatedAt ? new Date(serverCreatedAt).getTime() : -Infinity;

      if (!override) {
        return {
          preview: serverPreview ?? '',
          createdAt: serverCreatedAt ?? null,
        };
      }

      const overrideTimestamp = new Date(override.createdAt).getTime();

      if (overrideTimestamp > serverTimestamp) {
        return {
          preview: override.preview,
          createdAt: override.createdAt,
        };
      }

      localPreviewOverridesRef.current.delete(conversationId);
      return {
        preview: serverPreview ?? '',
        createdAt: serverCreatedAt ?? null,
      };
    },
    []
  );

  const getPreviewFromMessage = useCallback((message?: Message | null) => {
    if (!message) return '';
    const content = (message.content || '').trim();
    if (content) return content;
    if (message.message_type && message.message_type !== 'text') {
      switch (message.message_type) {
        case 'image':
          return '🖼️ Imagem';
        case 'audio':
          return '🎵 Áudio';
        case 'file':
          return '📎 Arquivo anexado';
        default:
          return '📎 Anexo';
      }
    }
    if (message.file_url) return '📎 Arquivo anexado';
    return '';
  }, []);

  const sanitizeFileName = useCallback((original: string) => {
    const fallback = 'arquivo';
    const normalized = (original || fallback)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const safe = normalized.replace(/[^\w.\-]+/g, '_').slice(0, 120);

    if (!safe) {
      return fallback;
    }

    if (containsExplicitLanguage(safe)) {
      const dotIndex = safe.lastIndexOf('.');
      const extension = dotIndex !== -1 ? safe.slice(dotIndex) : '';
      const blockedName = `conteudo_bloqueado${extension}`;
      return blockedName.replace(/[^\w.\-]+/g, '_').slice(0, 120);
    }

    return safe;
  }, []);

  const detectMessageTypeFromFile = useCallback((file: File): 'image' | 'audio' | 'file' => {
    if (file.type?.startsWith('image/')) return 'image';
    if (file.type?.startsWith('audio/')) return 'audio';
    if (file.type?.startsWith('video/')) return 'file';

    const lowerName = (file.name || '').toLowerCase();
    if (/\.(png|jpe?g|gif|bmp|webp|svg)$/.test(lowerName)) return 'image';
    if (/\.(mp3|wav|ogg|m4a|opus|aac|flac)$/.test(lowerName)) return 'audio';
    return 'file';
  }, []);

  const uploadAttachmentToStorage = useCallback(
    async (conversationId: string, file: File) => {
      const sanitizedName = sanitizeFileName(file.name || 'arquivo');
      const filePath = `${conversationId}/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(CHAT_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        console.error('❌ Erro ao enviar anexo para o Storage:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        throw new Error('Não foi possível obter URL pública do arquivo');
      }

      return {
        fileData: {
          url: publicUrlData.publicUrl,
          name: file.name || sanitizedName,
          size: file.size || 0,
        },
        messageType: detectMessageTypeFromFile(file),
      };
    },
    [CHAT_BUCKET, detectMessageTypeFromFile, sanitizeFileName]
  );

  // 🚀 CORREÇÃO: Garantir que o provider só seja considerado pronto após inicialização
  useEffect(() => {
    if (!loading && user) {
      setIsProviderReady(true);
    } else {
      setIsProviderReady(false);
    }
  }, [loading, user]);

  // Criar valor padrão do contexto
  const defaultContextValue: ChatContextType = {
    conversations: [],
    currentConversation: null,
    messages: [],
    participants: [],
    isLoading: loading,
    isLoadingMessages: false,
    isLoadingOlderMessages: false,
    error: null,
    hasMoreOlderMessages: true,
    loadConversations: async () => {},
    loadConversationMessages: async () => [],
    loadOlderMessages: async () => 0,
    selectConversation: async () => {},
    sendMessage: async () => {},
    markAsRead: async () => {},
    createConversation: async () => '',
    updateConversationStatus: async () => {},
    getUnreadCount: () => 0,
    getConversationUnreadCount: () => 0,
    deleteConversation: async () => {},
    archiveConversation: async () => {},
    
    // Sistema de Permissões - NOVA FUNCIONALIDADE
    getAvailableUsers: async () => [],
    createConversationWithUser: async () => ''
  };

  const fetchConversations = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!user) {
      return;
    }

    if (isLoadingConversationsRef.current) {
      return;
    }

    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    isLoadingConversationsRef.current = true;

    try {
      const data = await ChatService.getUserConversations();

      setConversations(prev => {
        const prevMap = new Map(prev.map(conv => [conv.id, conv]));

        const merged = data.map(conv => {
          const previous = prevMap.get(conv.id);
          const existingPreview = previous?.last_message_content ?? '';
          const existingTime = previous?.last_message_at ?? null;

          const { preview, createdAt } = applyLastMessageOverride(
            conv.id,
            conv.last_message_content ?? existingPreview,
            conv.last_message_at ?? existingTime
          );

          const previousUnread = previous?.unread_count ?? 0;
          let unreadCount = conv.unread_count ?? previousUnread;
          const hasNewMessage =
            previous &&
            conv.last_message_at &&
            previous.last_message_at &&
            conv.last_message_at !== previous.last_message_at;

          if (!previous) {
            unreadCount = conv.unread_count ?? 0;
          } else if (hasNewMessage) {
            if (conv.last_message_sender_id && conv.last_message_sender_id !== user.uid) {
              unreadCount = previousUnread + 1;
            }
          }

          if (currentConversation?.id === conv.id) {
            unreadCount = 0;
          }

          return {
            ...conv,
            last_message_content: preview,
            last_message_at: createdAt,
            unread_count: unreadCount,
          };
        });

        return merged;
      });
    } catch (err) {
      console.error('❌ Erro ao carregar conversas:', err);

      setConversations([]);
      if (!silent) {
        setError('Erro ao carregar conversas');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      isLoadingConversationsRef.current = false;
    }
  }, [currentConversation?.id, user]);

  // Carregar conversas - VERSÃO SIMPLIFICADA E ESTÁVEL
  const loadConversations = useCallback(async () => {
    await fetchConversations({ silent: false });
  }, [fetchConversations]);

  const handleIncomingMessages = useCallback(
    (messagesList: Message[], options: { skipSound?: boolean } = {}) => {
      // ✅ CORREÇÃO: Filtrar mensagens apenas da conversa atual para evitar mostrar mensagens de outras conversas
      if (currentConversation?.id) {
        const filteredMessages = messagesList.filter(
          (msg) => msg.conversation_id === currentConversation.id
        );
        
        // ✅ CORREÇÃO: Mesclar mensagens ao invés de substituir completamente (preserva mensagens otimistas)
        setMessages(prev => {
          // Manter mensagens otimistas que ainda não foram confirmadas
          const optimisticMessages = prev.filter(msg => msg.id.startsWith('temp-'));
          const confirmedMessageIds = new Set(filteredMessages.map(msg => msg.id));
          
          // Remover mensagens otimistas que já foram confirmadas
          const remainingOptimistic = optimisticMessages.filter(optMsg => {
            const isConfirmed = filteredMessages.some(
              confirmedMsg => 
                confirmedMsg.content === optMsg.content &&
                confirmedMsg.sender_id === optMsg.sender_id &&
                Math.abs(new Date(confirmedMsg.created_at).getTime() - new Date(optMsg.created_at).getTime()) < 5000
            );
            return !isConfirmed;
          });
          
          // Combinar mensagens confirmadas com otimistas restantes
          const allMessages = [...filteredMessages, ...remainingOptimistic];
          
          // Remover duplicatas e ordenar por data
          const uniqueMessages = Array.from(
            new Map(allMessages.map(msg => [msg.id, msg])).values()
          ).sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          return uniqueMessages;
        });
      } else if (messagesList.length > 0) {
        // Se não há conversa selecionada mas há mensagens, usar todas (pode ser inicialização)
        setMessages(messagesList);
      } else {
        setMessages([]);
      }

      if (!messagesList.length) {
        return;
      }

      const latest = messagesList[messagesList.length - 1];
      const latestId = latest.id;
      const isNewMessage = latestId !== lastMessageIdRef.current;
      const isFromCurrentUser = user?.uid && latest.sender_id === user.uid;
      const isConversationActive =
        currentConversation?.id && latest.conversation_id === currentConversation.id;
      const isWindowFocused =
        typeof document === 'undefined' ? true : document.hasFocus();
      const shouldIncrementUnread =
        isNewMessage && !isFromCurrentUser && !isConversationActive;

      if (
        !options.skipSound &&
        isNewMessage &&
        !isFromCurrentUser &&
        (!isConversationActive || !isWindowFocused)
      ) {
        playNotificationSound();
      }

      if (shouldIncrementUnread || options.skipSound || isConversationActive) {
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== latest.conversation_id) {
              return conv;
            }

            const currentUnread = conv.unread_count || 0;
            let nextUnread = currentUnread;

            if (options.skipSound || isConversationActive) {
              nextUnread = 0;
            } else if (shouldIncrementUnread) {
              nextUnread = currentUnread + 1;
            }

            return {
              ...conv,
              unread_count: nextUnread,
            };
          })
        );
      }

      lastMessageIdRef.current = latestId;
    },
    [currentConversation?.id, playNotificationSound, user?.uid]
  );

  // 🚀 NOVA FUNÇÃO: Carregar mensagens de uma conversa específica
  const loadConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const messagesData = await ChatService.getConversationMessages(conversationId, {
        limit: MESSAGE_PAGE_SIZE,
      });

      const latestMessage = messagesData.at(-1);

      const serverPreview = getPreviewFromMessage(latestMessage);
      const serverCreatedAt = latestMessage?.created_at ?? null;
      const overrideResult = applyLastMessageOverride(
        conversationId,
        serverPreview,
        serverCreatedAt
      );

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message_content: overrideResult.preview,
                last_message_at: overrideResult.createdAt ?? conv.updated_at ?? conv.last_message_at ?? null,
              }
            : conv
        )
      );

      if (currentConversation?.id === conversationId) {
        handleIncomingMessages(messagesData, { skipSound: true });
        oldestMessageRef.current = messagesData[0]?.created_at ?? null;
        setHasMoreOlderMessages(messagesData.length === MESSAGE_PAGE_SIZE);
        if (messagesData.length === 0) {
          setHasMoreOlderMessages(false);
        }
        setIsLoadingOlderMessages(false);
        isLoadingOlderMessagesRef.current = false;
      }

      return messagesData;
    } catch (err) {
      console.error(`❌ Erro ao carregar mensagens da conversa ${conversationId}:`, err);
      return [];
    }
  }, [currentConversation?.id, handleIncomingMessages]);

  const loadOlderMessages = useCallback(async (): Promise<number> => {
    if (!currentConversation) {
      return 0;
    }

    if (isLoadingOlderMessagesRef.current) {
      return 0;
    }

    if (!hasMoreOlderMessages) {
      return 0;
    }

    const cursor =
      oldestMessageRef.current ??
      messages.filter((msg) => msg.conversation_id === currentConversation.id)[0]?.created_at ??
      null;

    if (!cursor) {
      return 0;
    }

    isLoadingOlderMessagesRef.current = true;
    setIsLoadingOlderMessages(true);

    try {
      const olderMessages = await ChatService.getConversationMessages(currentConversation.id, {
        limit: MESSAGE_PAGE_SIZE,
        before: cursor,
      });

      if (!olderMessages.length) {
        setHasMoreOlderMessages(false);
        return 0;
      }

      oldestMessageRef.current = olderMessages[0]?.created_at ?? cursor;

      setMessages((prev) => {
        // ✅ CORREÇÃO: Filtrar apenas mensagens da conversa atual
        const currentConversationId = currentConversation.id;
        const filteredPrev = prev.filter((msg) => msg.conversation_id === currentConversationId);
        const filteredOlder = olderMessages.filter((msg) => msg.conversation_id === currentConversationId);
        
        const existingIds = new Set(filteredPrev.map((msg) => msg.id));
        const merged = [
          ...filteredOlder.filter((msg) => !existingIds.has(msg.id)),
          ...filteredPrev,
        ];

        merged.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        lastMessageIdRef.current = merged.length ? merged[merged.length - 1].id : lastMessageIdRef.current;

        return merged;
      });

      if (olderMessages.length < MESSAGE_PAGE_SIZE) {
        setHasMoreOlderMessages(false);
      }

      return olderMessages.length;
    } catch (err) {
      console.error('❌ Erro ao carregar mensagens antigas:', err);
      return 0;
    } finally {
      isLoadingOlderMessagesRef.current = false;
      setIsLoadingOlderMessages(false);
    }
  }, [currentConversation, hasMoreOlderMessages, messages]);

  // Selecionar conversa - VERSÃO SIMPLIFICADA E ESTÁVEL
  const selectConversation = useCallback(async (conversationId: string) => {
    // 🚀 CORREÇÃO: Usar ref para evitar loop
    if (isLoadingRef.current) {
      return;
    }
    
    setIsLoadingMessages(true);
    isLoadingRef.current = true;
    setError(null);
    
    try {
      // Buscar conversa na lista local
      let conversation = conversations.find(c => c.id === conversationId);
      
      // Se não encontrou na lista local, tentar buscar diretamente primeiro (mais rápido)
      if (!conversation) {
        try {
          // ✅ OTIMIZAÇÃO: Buscar diretamente do banco primeiro (mais rápido que recarregar tudo)
          const directConversation = await ChatService.getConversationById(conversationId);
          
          if (directConversation) {
            conversation = directConversation;
            // Adicionar à lista de conversas
            setConversations(prev => {
              const exists = prev.find(c => c.id === conversationId);
              if (!exists) {
                return [...prev, conversation!];
              }
              return prev.map(c => c.id === conversationId ? conversation! : c);
            });
          } else {
            // Se não encontrou diretamente, tentar recarregar todas as conversas
            await loadConversations();
            const updatedConversations = await ChatService.getUserConversations();
            conversation = updatedConversations.find(c => c.id === conversationId);
            
            if (conversation) {
              setConversations(prev => {
                const exists = prev.find(c => c.id === conversationId);
                if (!exists) {
                  return [...prev, conversation!];
                }
                return prev.map(c => c.id === conversationId ? conversation! : c);
              });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar conversa:', error);
        }
        
        // Se ainda não encontrou, definir erro
        if (!conversation) {
          setError('Conversa não encontrada');
          setIsLoadingMessages(false);
          isLoadingRef.current = false;
          return;
        }
      }
      
      // ✅ CORREÇÃO: Limpar mensagens da conversa anterior ANTES de definir a nova conversa
      setMessages([]);
      setCurrentConversation(conversation);
      oldestMessageRef.current = null;
      setHasMoreOlderMessages(true);
      setIsLoadingOlderMessages(false);
      isLoadingOlderMessagesRef.current = false;
      
      // ✅ CORREÇÃO: Se a conversa foi criada recentemente (últimos 2 segundos), aguardar um pouco
      // para garantir que mensagens automáticas sejam salvas antes de carregar
      const conversationAge = conversation.created_at 
        ? Date.now() - new Date(conversation.created_at).getTime()
        : Infinity;
      const isRecentlyCreated = conversationAge < 2000; // Criada há menos de 2 segundos
      
      if (isRecentlyCreated) {
        // Aguardar um pouco para garantir que mensagens automáticas sejam processadas
        // Mas não bloquear - carregar em paralelo
        await new Promise(resolve => setTimeout(resolve, 300)); // Reduzido de 800ms para 300ms
      }
      
      // Carregar mensagens da nova conversa
      const messagesData = await ChatService.getConversationMessages(conversationId, {
        limit: MESSAGE_PAGE_SIZE,
      });
      
      // ✅ CORREÇÃO: Garantir que apenas mensagens da conversa atual sejam adicionadas
      const filteredMessages = messagesData.filter(
        (msg) => msg.conversation_id === conversationId
      );
      handleIncomingMessages(filteredMessages, { skipSound: true });
      oldestMessageRef.current = filteredMessages[0]?.created_at ?? null;
      setHasMoreOlderMessages(filteredMessages.length === MESSAGE_PAGE_SIZE);
      if (filteredMessages.length === 0) {
        setHasMoreOlderMessages(false);
      }

      const latestMessage = filteredMessages.at(-1);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message_content: getPreviewFromMessage(latestMessage),
                last_message_at: latestMessage?.created_at ?? conv.updated_at,
              }
            : conv
        )
      );
      
      // Carregar participantes
      const participantsData = await ChatService.getConversationParticipants(conversationId);
      setParticipants(participantsData);
      
      // Iniciar polling periódico como fallback para garantir atualização rápida
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }

      messagePollingRef.current = setInterval(async () => {
        try {
          const latestMessages = await ChatService.getConversationMessages(conversationId);

          handleIncomingMessages(latestMessages);
          oldestMessageRef.current = latestMessages[0]?.created_at ?? oldestMessageRef.current ?? null;
          if (latestMessages.length < MESSAGE_PAGE_SIZE) {
            setHasMoreOlderMessages(false);
          }

          const lastMessage = latestMessages.at(-1);
          const serverPreview = getPreviewFromMessage(lastMessage);
          const serverCreatedAt = lastMessage?.created_at ?? null;
          const overrideResult = applyLastMessageOverride(
            conversationId,
            serverPreview,
            serverCreatedAt
          );

          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversationId) return conv;

              return {
                ...conv,
                last_message_content: overrideResult.preview,
                last_message_at: overrideResult.createdAt,
              };
            })
          );
        } catch (pollError) {
          console.warn('⚠️ ChatContext: Falha no polling de mensagens:', pollError);
        }
      }, 1000);

    } catch (err) {
      setError('Erro ao carregar conversa');
      console.error('Erro ao carregar conversa:', err);
    } finally {
      setIsLoadingMessages(false);
      isLoadingRef.current = false;
    }
  }, [conversations]); // 🚀 CORREÇÃO: Apenas conversations como dependência

  const queueMessageNotification = useCallback(async (conversation: Conversation, messageContent: string) => {
    try {
      if (!user?.uid) return;

      const preview = messageContent.trim().slice(0, 200);
      if (!preview) return;

      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation.id);

      if (participantsError) {
        console.error('⚠️ Erro ao buscar participantes para notificação de mensagem:', participantsError);
        return;
      }

      const recipientIds =
        participants
          ?.map(p => p.user_id)
          .filter((id): id is string => !!id && id !== user.uid) || [];

      if (recipientIds.length === 0) return;

      const senderName =
        user.profile?.full_name ||
        user.profile?.company_name ||
        user.email?.split('@')[0] ||
        'Usuário Veredicta';

      const recentThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const notifications: any[] = [];

      for (const recipientId of recipientIds) {
        const { data: existing } = await supabase
          .from('app_2d8133c678_notifications')
          .select('id')
          .eq('user_id', recipientId)
          .eq('type', 'chat') // ✅ CORREÇÃO: usar 'chat' ao invés de 'message' (não está na lista permitida)
          .eq('related_entity_id', conversation.id)
          .gt('created_at', recentThreshold)
          .maybeSingle();

        if (existing) continue;

        notifications.push({
          user_id: recipientId,
          type: 'chat', // ✅ CORREÇÃO: usar 'chat' ao invés de 'message' (não está na lista permitida)
          title: `Nova mensagem de ${senderName}`,
          body: preview, // ✅ CORREÇÃO: usar 'body' ao invés de 'message'
          priority: 'normal',
          is_read: false,
          related_entity_type: 'conversation',
          related_entity_id: conversation.id
          // ✅ CORREÇÃO: Removido campo 'meta' que não existe na tabela
        });
      }

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('app_2d8133c678_notifications')
          .insert(notifications);
        
        if (insertError) {
          // ✅ CORREÇÃO: Não bloquear o envio de mensagem se a notificação falhar
          console.error('⚠️ Erro ao criar notificações de mensagem:', insertError);
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao enfileirar notificação de nova mensagem:', error);
    }
  }, [user]);

  // Enviar mensagem
  const sendSingleMessage = useCallback(
    async ({
      content,
      messageType = 'text',
      fileData,
      replyToId,
    }: {
      content: string;
      messageType?: 'text' | 'file' | 'image' | 'system' | 'audio';
      fileData?: { url: string; name: string; size: number };
      replyToId?: string;
    }) => {
      if (!currentConversation || !user) {
        console.error('❌ sendMessage: Faltando dados obrigatórios:', {
          currentConversation: currentConversation?.id,
          user: user?.uid,
        });
        return;
      }

      const now = new Date().toISOString();
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        conversation_id: currentConversation.id,
        sender_id: user.uid,
        content,
        message_type: messageType,
        file_url: fileData?.url,
        file_name: fileData?.name,
        file_size: fileData?.size,
        reply_to_id: replyToId,
        status: 'sending',
        created_at: now,
        updated_at: now,
        sender: {
          id: user.uid,
          name: user.email || 'Usuário',
          avatar_url: undefined,
          role: 'client',
        },
      };

      // ✅ CORREÇÃO: Verificar se a mensagem otimista pertence à conversa atual
      setMessages((prev) => {
        if (optimisticMessage.conversation_id === currentConversation.id) {
          return [...prev.filter((msg) => msg.conversation_id === currentConversation.id), optimisticMessage];
        }
        return prev;
      });
      lastMessageIdRef.current = optimisticMessage.id;
      localPreviewOverridesRef.current.set(currentConversation.id, {
        preview: getPreviewFromMessage(optimisticMessage),
        createdAt: optimisticMessage.created_at,
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation.id
            ? {
                ...conv,
                last_message_content: getPreviewFromMessage(optimisticMessage),
                last_message_at: optimisticMessage.created_at,
              }
            : conv
        )
      );

      let messageId: string | null = null;

      try {
        messageId = await ChatService.sendMessage(
          currentConversation.id,
          content,
          messageType,
          fileData,
          replyToId
        );

        // ✅ CORREÇÃO: Verificar conversation_id antes de atualizar
        setMessages((prev) =>
          prev
            .filter((msg) => msg.conversation_id === currentConversation.id)
            .map((msg) =>
              msg.id === optimisticMessage.id
                ? { ...msg, id: messageId as string, status: 'sent' as const }
                : msg
            )
        );
        lastMessageIdRef.current = messageId as string;
        localPreviewOverridesRef.current.set(currentConversation.id, {
          preview: getPreviewFromMessage({
            ...optimisticMessage,
            id: messageId,
            status: 'sent',
          }),
          createdAt: optimisticMessage.created_at,
        });
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation.id
              ? {
                  ...conv,
                  last_message_content: getPreviewFromMessage({
                    ...optimisticMessage,
                    id: messageId,
                    status: 'sent',
                  }),
                  last_message_at: optimisticMessage.created_at,
                }
              : conv
          )
        );

        if (currentConversation.type === 'support') {
          setTimeout(async () => {
            try {
              await SupportBotService.simulateSupportResponse(
                currentConversation.id,
                content,
                messageType === 'image' || messageType === 'audio' ? 'file' : messageType
              );
            } catch (error) {
              console.error('Erro na resposta automática do suporte:', error);
            }
          }, 1500);
        }

        // ✅ CORREÇÃO: Executar operações pesadas em background (não bloqueiam o envio)
        queueMessageNotification(currentConversation, content).catch(err => {
          console.error('Erro ao criar notificação:', err);
        });
        
        // Não recarregar mensagens após envio - a mensagem já foi adicionada otimisticamente
        // e será atualizada via real-time quando chegar do servidor
        // loadConversationMessages(currentConversation.id).catch(err => {
        //   console.error('Erro ao recarregar mensagens:', err);
        // });
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        
        // ✅ CORREÇÃO: Verificar conversation_id antes de atualizar
        setMessages((prev) =>
          prev
            .filter((msg) => msg.conversation_id === currentConversation.id)
            .map((msg): Message => {
              if (msg.id === optimisticMessage.id) {
                return {
                  ...msg,
                  status: 'failed' as const,
                  content: `${content || '📎 Arquivo anexado'} ❌ (Falha no envio)`,
                } as Message;
              }
              return msg;
            })
        );
        localPreviewOverridesRef.current.set(currentConversation.id, {
          preview: `${content || '📎 Arquivo anexado'} ❌ (Falha no envio)`,
          createdAt: optimisticMessage.created_at,
        });
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation.id
              ? {
                  ...conv,
                  last_message_content: `${content || '📎 Arquivo anexado'} ❌ (Falha no envio)`,
                  last_message_at: optimisticMessage.created_at,
                }
              : conv
          )
        );
        setError('Erro ao enviar mensagem');
        console.error('Erro ao enviar mensagem:', err);
        messageId = null;
        // ✅ CORREÇÃO: Lançar erro para que o ChatWindow possa tratá-lo e remover a mensagem otimista
        throw err;
      }
    },
    [currentConversation, queueMessageNotification, user, loadConversationMessages, getPreviewFromMessage]
  );

  const sendMessage = useCallback(
    async (
      content: string,
      messageType: 'text' | 'file' | 'image' | 'system' | 'audio' = 'text',
      fileData?: { url: string; name: string; size: number },
      replyToId?: string,
      files?: File[]
    ) => {
      if (!currentConversation || !user) {
        console.error('❌ sendMessage: Faltando dados obrigatórios:', {
          currentConversation: currentConversation?.id,
          user: user?.uid,
        });
        return;
      }

      const trimmedContent = (content || '').trim();
      const hasFiles = Array.isArray(files) && files.length > 0;

      if (hasFiles) {
        let captionUsed = false;
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          try {
            const { fileData: uploadedFile, messageType: derivedType } = await uploadAttachmentToStorage(
              currentConversation.id,
              file
            );

            const messageContent =
              trimmedContent && !captionUsed ? trimmedContent : '📎 Arquivo anexado';

            await sendSingleMessage({
              content: messageContent,
              messageType: derivedType,
              fileData: uploadedFile,
              replyToId,
            });

            captionUsed = captionUsed || Boolean(trimmedContent);
          } catch (uploadError) {
            console.error('❌ Falha ao enviar anexo:', uploadError);
            setError('Erro ao enviar anexo');
          }
        }
        return;
      }

      if (!trimmedContent && !fileData) {
        console.warn('⚠️ sendMessage: mensagem vazia e sem anexo');
        return;
      }

      await sendSingleMessage({
        content: trimmedContent || content || '📎 Arquivo anexado',
        messageType,
        fileData,
        replyToId,
      });
    },
    [currentConversation?.id, sendSingleMessage, uploadAttachmentToStorage, user]
  );

  // Marcar como lida
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await ChatService.markMessageAsRead(messageId);
      
      // Atualizar contador de não lidas
      setConversations(prev => 
        prev.map(c => 
          c.id === currentConversation?.id 
            ? { ...c, unread_count: Math.max(0, c.unread_count - 1) }
            : c
        )
      );
      
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err);
    }
  }, [currentConversation]);

  // Criar conversa
  const createConversation = useCallback(async (
    title: string,
    type: 'support' | 'petition' | 'general',
    participants: { userId: string; role: 'client' | 'writer' | 'admin' | 'support' }[],
    metadata?: { petitionId?: string; [key: string]: any }
  ): Promise<string> => {
    try {
      const conversationId = await ChatService.createConversation(title, type, participants, metadata);
      
      // 🚀 CORREÇÃO: Adicionar nova conversa à lista local
      const normalizedMetadata: Record<string, any> = { ...(metadata || {}) };
      if (!normalizedMetadata.petitionId && normalizedMetadata.petition_id) {
        normalizedMetadata.petitionId = normalizedMetadata.petition_id;
      }
      if (!normalizedMetadata.petitionDisplayId) {
        normalizedMetadata.petitionDisplayId =
          normalizedMetadata.petitionDisplayId ??
          normalizedMetadata.petition_display_id ??
          normalizedMetadata.display_id ??
          normalizedMetadata.petitionId ??
          (normalizedMetadata.petition as any)?.id;
      }

      const newConversation = {
        id: conversationId,
        title,
        type,
        status: 'active' as const,
        priority: 'normal' as const,
        created_by: user?.uid || 'unknown',
        petition_id: normalizedMetadata?.petitionId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_content: null,
        last_message_at: null,
        unread_count: 0,
        metadata: normalizedMetadata,
        conversation_participants: participants.map(p => ({
          user_id: p.userId,
          role: p.role,
          user_name: p.role === 'support' ? 'Suporte Veredicta' : 'Usuário',
          user: null
        }))
      };
      
      setConversations(prev => [newConversation, ...prev]);
      
      return conversationId;
    } catch (err) {
      setError('Erro ao criar conversa');
      console.error('Erro ao criar conversa:', err);
      throw err;
    }
  }, []); // 🔧 CORREÇÃO: Removido loadConversations das dependências

  // Atualizar status da conversa
  const updateConversationStatus = useCallback(async (
    status: 'active' | 'closed' | 'archived',
    priority?: 'low' | 'normal' | 'high' | 'urgent',
    assignedTo?: string
  ) => {
    if (!currentConversation) return;
    
    try {
      await ChatService.updateConversationStatus(
        currentConversation.id,
        status,
        priority,
        assignedTo
      );
      
      // Atualizar estado local
      setCurrentConversation(prev => 
        prev ? { ...prev, status, priority: priority || prev.priority, assigned_to: assignedTo || prev.assigned_to } : null
      );
      
      setConversations(prev => 
        prev.map(c => 
          c.id === currentConversation.id 
            ? { ...c, status, priority: priority || c.priority, assigned_to: assignedTo || c.assigned_to }
            : c
        )
      );
      
    } catch (err) {
      setError('Erro ao atualizar conversa');
      console.error('Erro ao atualizar conversa:', err);
    }
  }, [currentConversation]);

  // Obter contagem de não lidas
  const getUnreadCount = useCallback(() => {
    return conversations.reduce((total, c) => total + c.unread_count, 0);
  }, [conversations]);

  // Obter contagem de não lidas de uma conversa específica
  const getConversationUnreadCount = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.unread_count || 0;
  }, [conversations]);

  // Excluir conversa - VERSÃO SIMPLIFICADA
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      await ChatService.deleteConversation(conversationId);
      
      // Remover da lista local
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Se era a conversa atual, limpar
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
        lastMessageIdRef.current = null;
      }
      
    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error);
      setError('Erro ao excluir conversa');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation?.id]);

  // Sistema de Permissões - NOVA FUNCIONALIDADE
  const getAvailableUsers = useCallback(async () => {
    try {
      if (!user) {
        return [];
      }

      const availableUsers = await ConversationPermissionService.getAvailableUsersForCommunication(
        user.uid,
        'client' // TODO: Obter role real do usuário
      );

      return availableUsers;

    } catch (error) {
      console.error('❌ Erro ao buscar usuários disponíveis:', error);
      return [];
    }
  }, [user]);

  const createConversationWithUser = useCallback(async (
    targetUserId: string,
    title: string,
    message?: string
  ) => {
    try {
      setIsLoading(true);

      const conversationId = await ChatService.createConversationWithPermission(
        targetUserId,
        title,
        message
      );

      // Recarregar conversas para incluir a nova
      await loadConversations();

      return conversationId;

    } catch (error) {
      console.error('❌ Erro ao criar conversa com usuário:', error);
      setError('Erro ao criar conversa');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations]);

  // Arquivar conversa - VERSÃO SIMPLIFICADA
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      await ChatService.archiveConversation(conversationId);
      
      // Atualizar status na lista local
      setConversations(prev => {
        return prev.map(c => 
          c.id === conversationId 
            ? { ...c, status: 'archived' as const }
            : c
        );
      });
    } catch (error) {
      console.error('❌ ChatContext: Erro ao arquivar conversa:', error);
      setError('Erro ao arquivar conversa');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeitos - Carregar conversas quando usuário estiver pronto
  useEffect(() => {
    if (user && !loading && isProviderReady) {
      loadConversations();
    }
  }, [user, loading, isProviderReady]); // 🔧 CORREÇÃO: Removido loadConversations das dependências para evitar loop

  useEffect(() => {
    const shouldPoll = !!user && !loading && isProviderReady;

    if (!shouldPoll) {
      if (conversationPollingRef.current) {
        clearInterval(conversationPollingRef.current);
        conversationPollingRef.current = null;
      }
      return;
    }

    const pollConversations = () => {
      fetchConversations({ silent: true }).catch((pollError) => {
        console.warn('⚠️ ChatContext: Falha ao atualizar conversas via polling:', pollError);
      });
    };

    pollConversations();

    if (conversationPollingRef.current) {
      clearInterval(conversationPollingRef.current);
    }

    conversationPollingRef.current = setInterval(pollConversations, 5000);

    return () => {
      if (conversationPollingRef.current) {
        clearInterval(conversationPollingRef.current);
        conversationPollingRef.current = null;
      }
    };
  }, [user, loading, isProviderReady, fetchConversations]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
      if (conversationPollingRef.current) {
        clearInterval(conversationPollingRef.current);
        conversationPollingRef.current = null;
      }
    };
  }, []);

  const value: ChatContextType = {
    // Estado
    conversations,
    currentConversation,
    messages,
    participants,
    isLoading,
    isLoadingMessages,
    isLoadingOlderMessages,
    error,
    hasMoreOlderMessages,
    
    // Ações
    loadConversations,
    loadConversationMessages,
    loadOlderMessages,
    selectConversation,
    sendMessage,
    markAsRead,
    createConversation,
    updateConversationStatus,
    
    // Utilitários
    getUnreadCount,
    getConversationUnreadCount,
    
    // Exclusão
    deleteConversation,
    archiveConversation,
    
    // Sistema de Permissões - NOVA FUNCIONALIDADE
    getAvailableUsers,
    createConversationWithUser,
  };


  // 🚀 CORREÇÃO: Usar valor padrão apenas se não houver usuário, mas sempre fornecer conversas se disponíveis
  const contextValue = !user ? defaultContextValue : value;

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
