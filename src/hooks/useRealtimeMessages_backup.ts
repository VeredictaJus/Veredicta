
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
}

export interface Conversation {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  last_message_time: string;
  participant_ids: string[];
  messages?: Message[];
  unreadCount: number;
}

export const useRealtimeMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setIsAdmin(user.email === 'contato@veredictajus.com');
      }
    };
    getCurrentUser();
  }, []);

  const getAuthHeaders = useCallback(async () => {
    // Use the new Firebase-based authentication system
    const { getSupabaseForCurrentUser } = await import('@/lib/session');
    const { supabase } = await getSupabaseForCurrentUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const loadMessagesForConversation = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_messages?select=*&conversation_id=eq.${conversationId}&order=created_at.asc`,
        { headers }
      );
      if (!response.ok) return [];
      const messagesData = await response.json();
      return messagesData.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.sender_id === 'a1241b3a-3267-4268-b4eb-9a20cd2a30d3' ? 'Suporte Veredicta' : 'Cliente',
        status: 'sent' as const,
        created_at: msg.created_at,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      }));
    } catch {
      return [];
    }
  }, [getAuthHeaders]);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (isAdmin) {
        const response = await fetch(
          'https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_conversations?select=id,participant_ids&order=updated_at.desc.nullslast',
          { headers }
        );
        if (!response.ok) throw new Error();
        const conversationsData = await response.json();
        const conversationsWithMessages: Conversation[] = await Promise.all(
          conversationsData.map(async (conv: any) => {
            const messages = await loadMessagesForConversation(conv.id);
            const clientId = conv.id.replace('support-', '');
            return {
              id: conv.id,
              name: `Cliente ${clientId.substring(0, 8)}...`,
              type: 'support',
              participant_ids: conv.participant_ids || [],
              last_message: messages[messages.length - 1]?.content || 'Sem mensagens',
              last_message_time: messages[messages.length - 1]?.created_at || new Date().toISOString(),
              unreadCount: 0,
              messages
            };
          })
        );
        setConversations(conversationsWithMessages);
      } else {
        const conversationId = await ensureConversationExists();
        const messages = await loadMessagesForConversation(conversationId);
        const clientConversation: Conversation = {
          id: conversationId,
          name: 'Suporte Veredicta',
          type: 'support',
          participant_ids: [currentUser.id, 'a1241b3a-3267-4268-b4eb-9a20cd2a30d3'],
          last_message: messages[messages.length - 1]?.content || 'Inicie uma conversa',
          last_message_time: messages[messages.length - 1]?.created_at || new Date().toISOString(),
          unreadCount: 0,
          messages
        };
        setConversations([clientConversation]);
      }
      setRealtimeConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, getAuthHeaders, loadMessagesForConversation]);

  const ensureConversationExists = useCallback(async (): Promise<string> => {
    const conversationId = `support-${currentUser.id}`;
    const headers = await getAuthHeaders();
    const checkResponse = await fetch(
      `https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_conversations?id=eq.${conversationId}`,
      { headers }
    );
    if (!checkResponse.ok) throw new Error('Erro ao verificar conversa existente');
    const existing = await checkResponse.json();
    if (existing.length > 0) return conversationId;
    const newConversation = {
      id: conversationId,
      name: 'Suporte Veredicta',
      type: 'support',
      participant_ids: [currentUser.id, 'a1241b3a-3267-4268-b4eb-9a20cd2a30d3']
    };
    const createResponse = await fetch(
      'https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_conversations',
      {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newConversation)
      }
    );
    if (!createResponse.ok) throw new Error('Erro ao criar nova conversa');
    return conversationId;
  }, [currentUser, getAuthHeaders]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    attachments: Array<{ id: string; name: string; size: number; type: string; url: string }> = []
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      content,
      sender_id: senderId,
      sender_name: senderName,
      status: 'sending',
      created_at: new Date().toISOString(),
      attachments
    };
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), optimisticMessage],
            last_message: content,
            last_message_time: optimisticMessage.created_at
          };
        }
        return conv;
      })
    );
    try {
      const headers = await getAuthHeaders();
      let actualSenderId: string;
      let actualConversationId: string;
      if (isAdmin) {
        actualSenderId = 'a1241b3a-3267-4268-b4eb-9a20cd2a30d3';
        actualConversationId = conversationId;
      } else {
        actualSenderId = currentUser.id;
        actualConversationId = await ensureConversationExists();
      }
      const messagePayload = {
        conversation_id: actualConversationId,
        sender_id: actualSenderId,
        content: content.trim()
      };
      const response = await fetch(
        'https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_messages',
        {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(messagePayload)
        }
      );
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      const [sentMessageData] = await response.json();
      const sentMessage: Message = {
        id: sentMessageData.id,
        conversation_id: sentMessageData.conversation_id,
        content: sentMessageData.content,
        sender_id: sentMessageData.sender_id,
        sender_name: sentMessageData.sender_id === 'a1241b3a-3267-4268-b4eb-9a20cd2a30d3' ? 'Suporte Veredicta' : senderName,
        status: 'sent',
        created_at: sentMessageData.created_at,
        attachments
      };
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId || conv.id === actualConversationId) {
            return {
              ...conv,
              messages: conv.messages?.map(msg =>
                msg.id === optimisticMessage.id ? sentMessage : msg
              ) || [],
              last_message: content,
              last_message_time: sentMessage.created_at
            };
          }
          return conv;
        })
      );
      return sentMessage;
    } catch (error: any) {
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages?.map(msg =>
                msg.id === optimisticMessage.id ? { ...msg, status: 'failed' } : msg
              ) || []
            };
          }
          return conv;
        })
      );
      throw error;
    }
  }, [currentUser, isAdmin, getAuthHeaders, ensureConversationExists]);

  const retryMessage = useCallback(async (message: Message) => {
    if (message.status !== 'failed') return;
    try {
      await sendMessage(
        message.conversation_id,
        message.content,
        message.sender_id,
        message.sender_name,
        message.attachments || []
      );
    } catch {}
  }, [sendMessage]);

  useEffect(() => {
    if (currentUser) loadConversations();
  }, [currentUser, loadConversations]);

  useEffect(() => {
    return () => {};
  }, []);

  return {
    conversations,
    loading,
    error,
    realtimeConnected,
    sendMessage,
    retryMessage,
    loadConversations,
    currentUser,
    isAdmin
  };
};
