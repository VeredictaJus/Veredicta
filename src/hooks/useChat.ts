import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatUser {
  id: string;
  name: string;
  role: string;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  conversation_id: string;
  created_at: string;
}

interface UseChatOptions {
  conversationId: string;
  userId: string;
}

export function useChat({ conversationId, userId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Buscar mensagens existentes
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id,name,role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setMessages(
        data.map((msg) => ({
          ...msg,
          sender_name: msg.sender.name
        }))
      );
    }

    setLoading(false);
  }, [conversationId]);

  // 2️⃣ Enviar nova mensagem
  const sendMessage = useCallback(
  async (content: string, attachments?: File[]) => {
    try {
      const mod = await contentModerator.moderateMessage(content, userId, conversationId);
      if (mod.isViolation) {
        toast({ title: 'Mensagem bloqueada', description: mod.reason || '', variant: 'destructive' });
        return;
      }

      let final = content;
      try {
        const enc = await messageEncryption.encryptMessage(content);
        if (enc) final = `encrypted:${JSON.stringify(enc)}`;
      } catch {}

      // 🔹 Envia para o Supabase
      const newMessage = await chatAPI.sendMessage(conversationId, final, attachments);
      const mappedMessage = Array.isArray(newMessage)
  ? convertKeysToCamelCase(newMessage[0])
  : convertKeysToCamelCase(newMessage);

      // 🔹 Adiciona imediatamente ao estado local
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, mappedMessage],
      }));

      // 🔹 Salva no cache local
      await chatStorage.saveMessages(conversationId, [mappedMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({ title: 'Erro ao enviar mensagem', description: '', variant: 'destructive' });
    }
  },
  [conversationId, userId, toast]
);

  // 3️⃣ Inscrever em tempo real
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              sender_name: '' // será atualizado via fetchUsers se quiser
            }
          ]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [conversationId, fetchMessages]);

  // 4️⃣ Buscar lista de participantes da conversa (usuários)
  useEffect(() => {
    async function loadParticipants() {
      const { data, error } = await supabase
        .from('participants')
        .select('user_id, users (name, role)')
        .eq('conversation_id', conversationId);

      if (!error && data) {
        setUsers(
          data.map((p) => ({
            id: p.user_id,
            name: p.users.name,
            role: p.users.role
          }))
        );
      }
    }

    loadParticipants();
  }, [conversationId]);

  return {
    messages,
    users,
    loading,
    error,
    sendMessage
  };
}
