import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Petition, Message } from '@/types';

export function useAdvancedChat(writerId: string | undefined, petitionId: string | null) {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Buscar petições do redator
  const fetchPetitions = useCallback(async () => {
    if (!writerId) return;
    const { data, error } = await supabase
      .from('peticoes')
      .select('*')
      .eq('writer_id', writerId)
      .eq('status', 'IN_PROGRESS')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPetitions(data);
    }
  }, [writerId]);

  // Buscar mensagens da petição selecionada
  const fetchMessages = useCallback(async () => {
    if (!petitionId) return;
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('petition_id', petitionId)
      .order('timestamp', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }, [petitionId]);

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, timestamp: string) => {
      if (!petitionId) return;
      await supabase.from('mensagens').insert([
        {
          petition_id: petitionId,
          sender_id: writerId,
          sender_type: 'writer',
          content,
          timestamp,
          is_read: false,
          is_system_message: false
        }
      ]);
    },
    [petitionId, writerId]
  );

  // Real-time listener para novas mensagens
  useEffect(() => {
    fetchPetitions();
  }, [fetchPetitions]);

  useEffect(() => {
    fetchMessages();

    if (!petitionId) return;

    const channel = supabase
      .channel(`chat-${petitionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `petition_id=eq.${petitionId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petitionId, fetchMessages]);

  return { petitions, messages, sendMessage };
}
