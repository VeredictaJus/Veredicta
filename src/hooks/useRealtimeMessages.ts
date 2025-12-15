// @ts-nocheck
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChatService, Conversation as ServiceConversation, Message as ServiceMessage } from '@/services/chatService';

type MessageState = ServiceMessage & {
  sender_name?: string;
};

type ConversationState = ServiceConversation & {
  name?: string;
  participant_ids?: string[];
  unreadCount?: number;
  last_message?: string;
  last_message_time?: string | null;
  messages?: MessageState[];
  last_fetched_at?: string | null;
};

export default function useRealtimeMessages() {
  const [conversations, setConversations] = useState<ConversationState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const conversationPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageSignatureRef = useRef<Map<string, string>>(new Map());
  const conversationsRef = useRef<ConversationState[]>([]);
  const activeConversationIdRef = useRef<string | null>(null);

  // 🚀 CORREÇÃO: Remover ID fixo que estava causando problema
  // const supportConversationId = '550e8400-e29b-41d4-a716-446655440000';

  const loadConversations = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 loadConversations: Iniciando carregamento...');
      const cs = await ChatService.getUserConversations();
      console.log('📋 loadConversations: Conversas carregadas:', cs);

      const normalized: ConversationState[] = cs.map((c: any) => ({
        id: c.id,
        name: c.title || c.name || 'Conversa',
        type: c.type ?? 'client',
        participant_ids: c.participant_ids ?? [],
        unreadCount: c.unread_count ?? c.unreadCount ?? 0,
        last_message: c.last_message_content || c.last_message || '',
        last_message_time: String(c.last_message_at || c.last_message_time || new Date().toISOString()),
        messages: [], // 🚀 Inicializar sem mensagens para carregamento rápido
      }));

      const filtered = normalized.filter(
        (c) => c.name !== 'Suporte Veredicta'
      );

      console.log('🎯 Total de conversas carregadas:', filtered.length);
      setConversations(prev => {
        const prevMap = new Map(prev.map(conv => [conv.id, conv]));
        const merged = filtered.map(conv => {
          const previous = prevMap.get(conv.id);
          const previousMessages = previous?.messages ?? conv.messages ?? [];

          const latestMessage = previousMessages.reduce<Message | undefined>((latest, current) => {
            if (!latest) return current;
            const latestTime = new Date(latest.created_at).getTime();
            const currentTime = new Date(current.created_at).getTime();
            return currentTime > latestTime ? current : latest;
          }, undefined);

          return {
            ...conv,
            last_message: latestMessage?.content ?? conv.last_message ?? '',
            last_message_time: latestMessage?.created_at ?? conv.last_message_time ?? null,
            messages: previousMessages,
          };
        });
        conversationsRef.current = merged;
        return merged;
      });

    } catch (e) {
      console.error(e);
      setError('Falha ao carregar conversas.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // 🚀 NOVA FUNÇÃO: Carregar mensagens de uma conversa específica
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    try {
      console.log(`📥 Carregando mensagens da conversa: ${conversationId}`);
      const msgs = await ChatService.getConversationMessages(conversationId);
      console.log(`✅ Mensagens carregadas para ${conversationId}:`, msgs.length, 'mensagens');

      const existingConversation = conversationsRef.current.find(conv => conv.id === conversationId);
      const existingMessages = existingConversation?.messages ?? [];

      const mergedMap = new Map<string, MessageState>();
      for (const msg of existingMessages) {
        mergedMap.set(msg.id, msg);
      }
      for (const msg of msgs) {
        mergedMap.set(msg.id, msg);
      }

      const mergedMessages = Array.from(mergedMap.values()).sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const latestMessage = mergedMessages.at(-1);
      const signature = mergedMessages
        .map(msg => `${msg.id}:${msg.updated_at ?? msg.created_at}:${msg.content}`)
        .join('|');

      if (lastMessageSignatureRef.current.get(conversationId) === signature) {
        return mergedMessages;
      }

      lastMessageSignatureRef.current.set(conversationId, signature);

      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: latestMessage?.content ?? conv.last_message,
                last_message_time: latestMessage?.created_at ?? conv.last_message_time,
                messages: mergedMessages,
                last_fetched_at: new Date().toISOString(),
              }
            : conv
        );
        conversationsRef.current = updated;
        return updated;
      });
      
      return mergedMessages;
    } catch (err) {
      console.error(`❌ Erro ao carregar mensagens da conversa ${conversationId}:`, err);
      return [];
    }
  }, []);

  const sendChatMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      files: File[] = []
    ) => {
      const optimistic: MessageState = {
        id: `tmp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: 'me',        // ajuste conforme necessário
        sender_name: 'Eu',      // ajuste conforme necessário
        content,
        created_at: new Date().toISOString(),
        status: 'sending',
        attachments: files.map(f => ({
          id: f.name,
          name: f.name,
          size: f.size,
          type: f.type,
          url: '' // URL temporária, será preenchida após upload
        })),
      };

      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === conversationId
            ? {
                ...c,
                last_message: content,
                last_message_time: new Date().toISOString(),
                messages: [...(c.messages ?? []), optimistic],
                last_fetched_at: c.last_fetched_at ?? null,
              }
            : c
        );
        conversationsRef.current = updated;
        return updated;
      });

      try {
        // Processar arquivos se houver
        let fileData: { url: string; name: string; size: number } | undefined;
        if (files.length > 0) {
          // Para simplificar, vamos usar apenas o primeiro arquivo
          const file = files[0];
          fileData = {
            url: URL.createObjectURL(file), // URL temporária
            name: file.name,
            size: file.size
          };
        }

        const messageId = await ChatService.sendMessage(conversationId, content, 'text', fileData);

        if (!messageId) throw new Error("Envio falhou");

        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  last_message: content,
                  last_message_time: new Date().toISOString(),
                  messages: (c.messages ?? []).map(m =>
                    m.id === optimistic.id ? { ...m, status: 'sent', id: messageId } : m
                  ),
                  last_fetched_at: new Date().toISOString(),
                }
              : c
          );
          conversationsRef.current = updated;
          return updated;
        });
      } catch (err) {
        console.error('Erro ao enviar mensagem', err);
        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: (c.messages ?? []).map(m =>
                    m.id === optimistic.id ? { ...m, status: 'failed' } : m
                  ),
                }
              : c
          );
          conversationsRef.current = updated;
          return updated;
        });
      }
    },
    []
  );

  const retryMessage = useCallback((message: Message) => {
    // Lógica para reenviar mensagens com falha
    // Nota: Para retry, enviamos sem anexos pois não temos os arquivos File originais
    sendChatMessage(message.conversation_id, message.content, []);
  }, [sendChatMessage]);

  useEffect(() => {
    loadConversations();

    if (conversationPollingRef.current) {
      clearInterval(conversationPollingRef.current);
    }

    conversationPollingRef.current = setInterval(() => {
      loadConversations({ silent: true }).catch((err) => {
        console.warn('⚠️ useRealtimeMessages: erro ao atualizar conversas via polling', err);
      });
    }, 5000);

    return () => {
      if (conversationPollingRef.current) {
        clearInterval(conversationPollingRef.current);
        conversationPollingRef.current = null;
      }
    };
  }, [loadConversations]);

  const conversationIdsKey = useMemo(
    () => conversations.map(c => c.id).join(','),
    [conversations]
  );

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!conversationIdsKey) {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
      return;
    }

    const pollMessages = async () => {
      const activeConversationId = activeConversationIdRef.current;

      const conversationsToPoll =
        activeConversationId
          ? conversationsRef.current.filter(conv => conv.id === activeConversationId)
          : conversationsRef.current.slice(0, 3);

      if (conversationsToPoll.length === 0) {
        return;
      }

      for (const conversation of conversationsToPoll) {
        try {
          await loadConversationMessages(conversation.id);
        } catch (pollError) {
          console.warn(`⚠️ useRealtimeMessages: Falha ao atualizar mensagens da conversa ${conversation.id}`, pollError);
        }
      }
    };

    pollMessages();

    if (messagePollingRef.current) {
      clearInterval(messagePollingRef.current);
    }
    messagePollingRef.current = setInterval(pollMessages, 2000);

    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
    };
  }, [conversationIdsKey, loadConversationMessages]);

  const setActiveConversationId = useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId;
    if (conversationId) {
      console.log('🎯 Conversation ativa definida:', conversationId);
    } else {
      console.log('🎯 Conversation ativa limpa');
    }
  }, []);

  useEffect(() => {
    return () => {
      activeConversationIdRef.current = null;
    };
  }, []);

  return {
    conversations,
    loading,
    error,
    sendMessage: sendChatMessage,
    retryMessage,
    loadConversations,
    loadConversationMessages,
    setActiveConversationId,
  };
}
