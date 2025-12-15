// src/hooks/useSupabaseConversation.ts
import { useEffect, useState } from 'react';
import {
  fetchMessages,
  sendMessage as sendMessageAPI,
  subscribeMessages,
} from '@/lib/chatService';
import type { ChatMessage } from '@/lib/chatService';

// ordena do mais antigo -> mais novo
const byCreatedAt = (a: ChatMessage, b: ChatMessage) =>
  new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();

export function useSupabaseConversation(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setLoading] = useState(true);

  // helper: só adiciona se ainda não existir
  const upsertMessage = (m: ChatMessage) =>
    setMessages(prev => {
     const i = prev.findIndex(x => x.id === m.id);
    if (i >= 0) {
       const copy = [...prev];
        copy[i] = { ...copy[i], ...m };
       return copy.sort(byCreatedAt);
     }
      return [...prev, m].sort(byCreatedAt);
    });

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      setLoading(true);

      // carga inicial + ordenação
      const initial = await fetchMessages(conversationId);
      setMessages(initial.sort(byCreatedAt));

      // realtime: insere se não existir e mantém ordenado
      unsubscribe = subscribeMessages(conversationId, (m) => {
       upsertMessage(m);
     });

      setLoading(false);
    })();

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (text: string, files: File[] = []) => {
    try {
      const created = await sendMessageAPI(conversationId, text, files);
      if (created) upsertMessage(created);
    } catch (e) {
      // deixa o chamador (EnhancedChat) exibir o toast de erro
      throw e;
    }
  };

  return { messages, isLoading, sendMessage };
}
