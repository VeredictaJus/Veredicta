// src/hooks/useChatAPI.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI, ChatReport, Conversation } from '@/services/ChatAPI';
import { messageEncryption } from '@/services/MessageEncryption';
import { contentModerator } from '@/services/ContentModerator';
import { chatStorage } from '@/services/chatStorage';
import { useToast } from '@/hooks/use-toast';
import { convertKeysToCamelCase } from '@/lib/utils';
import type { ChatMessageItem } from '@/lib/types';
import { useNotificationSound } from '@/hooks/useNotificationSound';

export interface UseChatAPIProps {
  conversationId: string;
  userId: string;
}

export interface ChatState {
  messages: ChatMessageItem[];
  reports: ChatReport[];
  conversations: Conversation[];
  isConnected: boolean;
  isLoading: boolean;
  typingUsers: { id: string; name: string }[];
  onlineUsers: string[];
  readByMap: Record<string, string[]>;
}

export const useChatAPI = ({ conversationId, userId }: UseChatAPIProps) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    reports: [],
    conversations: [],
    isConnected: false,
    isLoading: true,
    typingUsers: [],
    onlineUsers: [],
    readByMap: {},
  });

  const { toast } = useToast();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const encryptionInitialized = useRef(false);

  const { play: playNotification, enabled: soundEnabled, toggle: toggleSound } = useNotificationSound('/sounds/ding.mp3');

  // Initialize encryption once
  useEffect(() => {
    (async () => {
      if (!encryptionInitialized.current) {
        await messageEncryption.initialize();
        encryptionInitialized.current = true;
      }
    })();
  }, []);

  // Load chat messages
  useEffect(() => {
    (async () => {
      const cached = await chatStorage.getMessages(conversationId);
      if (cached.length) {
        setState(prev => ({ ...prev, messages: cached }));
      }

      try {
        const raw = await chatAPI.getMessages(conversationId);
        const decrypted = await Promise.all(
  raw.map(async (msg) => {
    if (msg.isEncrypted && msg.content.startsWith('encrypted:')) {
      try {
        const data = JSON.parse(msg.content.replace('encrypted:', ''));
        console.log('[DEBUG] Conteúdo criptografado:', data);

        const content = await messageEncryption.decryptMessage(data);
        console.log('[DEBUG] Conteúdo descriptografado:', content);

        return content ? { ...msg, content } : msg;
      } catch (error) {
        console.error('[ERRO] Falha ao descriptografar mensagem:', error);
        return msg;
      }
    }

    return msg;
  })
);
        const mapped = decrypted.map(mapMessage);
        await chatStorage.saveMessages(conversationId, mapped);
        setState(prev => ({ ...prev, messages: mapped, isLoading: false }));
      } catch {
        toast({ title: 'Erro ao carregar mensagens', description: 'Tente novamente', variant: 'destructive' });
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, [conversationId, toast]);

  // WebSocket event handlers
  useEffect(() => {
    const handlers: Record<string, any> = {
      connected: () => {
        console.log('[useChatAPI] WebSocket conectado com sucesso!');
        setState(prev => ({ ...prev, isConnected: true }));
        toast({ title: 'Conectado', description: 'Chat ativo em tempo real' });
      },
      disconnected: () => {
        console.log('[useChatAPI] WebSocket desconectado.');
        setState(prev => ({ ...prev, isConnected: false }));
        toast({ title: 'Desconectado', description: 'Reconectando...', variant: 'destructive' });
      },
      message_received: (raw: any) => {
        const msg = mapMessage(raw);
        setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
        if (msg.sender_id !== userId && soundEnabled) playNotification();
        chatStorage.saveMessages(conversationId, [msg]);
      },
      message_updated: (raw: any) => {
        const msg = mapMessage(raw);
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => (m.id === msg.id ? msg : m)),
        }));
        chatStorage.saveMessages(conversationId, [msg]);
      },
      message_deleted: ({ messageId }: { messageId: string }) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== messageId),
        }));
        chatStorage.clearConversation(conversationId);
      },
      message_read: (data: { messageId: string; userId: string }) => {
        setState(prev => {
          const list = prev.readByMap[data.messageId] || [];
          return {
            ...prev,
            readByMap: {
              ...prev.readByMap,
              [data.messageId]: list.includes(data.userId) ? list : [...list, data.userId],
            },
          };
        });
      },
      user_typing: (data: { userId: string; userName?: string; conversationId: string }) => {
        if (data.conversationId === conversationId && data.userId !== userId) {
          const name = data.userName ?? 'Alguém';
          setState(prev => ({
            ...prev,
            typingUsers: [...prev.typingUsers.filter(u => u.id !== data.userId), { id: data.userId, name }],
          }));
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              typingUsers: prev.typingUsers.filter(u => u.id !== data.userId),
            }));
          }, 3000);
        }
      },
      user_online: ({ userId: uid }: { userId: string }) => {
        setState(prev => ({
          ...prev,
          onlineUsers: [...prev.onlineUsers.filter(id => id !== uid), uid],
        }));
      },
      user_offline: ({ userId: uid }: { userId: string }) => {
        setState(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers.filter(id => id !== uid),
        }));
      },
      report_received: (raw: any) => {
        const report = convertKeysToCamelCase(raw) as ChatReport;
        setState(prev => ({ ...prev, reports: [...prev.reports, report] }));
        if (report.status === 'pending') {
          toast({ title: 'Nova denúncia', description: 'Mensagem reportada', variant: 'destructive' });
        }
      },
      report_updated: (raw: any) => {
        const report = convertKeysToCamelCase(raw) as ChatReport;
        setState(prev => ({
          ...prev,
          reports: prev.reports.map(r => (r.id === report.id ? report : r)),
        }));
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => chatAPI.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => chatAPI.off(event, handler));
  }, [conversationId, userId, soundEnabled, playNotification, toast]);

  // Functions
  const sendMessage = useCallback(
  async (content: string, attachments?: File[]) => {
    try {
      // 🔎 Moderação antes de enviar
      const mod = await contentModerator.moderateMessage(content, userId, conversationId);
      if (mod.isViolation) {
        toast({
          title: 'Mensagem bloqueada',
          description: mod.reason || '',
          variant: 'destructive',
        });
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
      console.log("📩 Mensagem enviada com sucesso:", mappedMessage);

      // 🔹 Adiciona imediatamente ao estado local (pra aparecer na tela)
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, mappedMessage],
      }));

      // 🔹 Salva no cache local
      await chatStorage.saveMessages(conversationId, [mappedMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: '',
        variant: 'destructive',
      });
    }
  },
  [conversationId, userId, toast]
);

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        const mod = await contentModerator.moderateMessage(newContent, userId, conversationId);
        if (mod.isViolation) {
          toast({ title: 'Edição bloqueada', description: mod.reason || '', variant: 'destructive' });
          return;
        }
        let final = newContent;
        try {
          const enc = await messageEncryption.encryptMessage(newContent);
          if (enc) final = `encrypted:${JSON.stringify(enc)}`;
        } catch {}
        await chatAPI.editMessage(messageId, final);
      } catch {
        toast({ title: 'Erro ao editar mensagem', description: '', variant: 'destructive' });
      }
    },
    [conversationId, userId, toast]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatAPI.deleteMessage(messageId);
    } catch {
      toast({ title: 'Erro ao deletar mensagem', description: '', variant: 'destructive' });
    }
  }, [toast]);

  const startTyping = useCallback(() => {
    chatAPI.sendTyping(conversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => chatAPI.stopTyping(conversationId), 3000);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatAPI.stopTyping(conversationId);
  }, [conversationId]);

  const setOnline = useCallback(() => chatAPI.setOnline(), []);
  const setOffline = useCallback(() => chatAPI.setOffline(), []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      chatAPI.setOffline();
    };
  }, []);

  return {
    ...state,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    setOnline,
    setOffline,
    toggleSound,
    soundEnabled,
  };
};
