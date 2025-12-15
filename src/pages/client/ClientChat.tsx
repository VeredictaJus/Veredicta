// src/components/chat/ClientChat.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useChat } from '@/contexts/ChatContext';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, Check, CheckCheck, RotateCcw
} from 'lucide-react';

// 🚀 CORREÇÃO: Remover ID fixo que estava causando problema
// const supportConversationId = '550e8400-e29b-41d4-a716-446655440000'; // UUID fixo do chat com o suporte

const ClientChat: React.FC = () => {
  const { toast } = useToast();
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    conversations,
    currentConversation,
    selectConversation,
    sendMessage,
    messages,
    isLoadingMessages,
  } = useChat();

  const combined = useMemo(() => conversations, [conversations]);

  // Selecionar conversa padrão ao carregar
  useEffect(() => {
    if (selectedConvId) return;
    const defaultConversationId =
      currentConversation?.id ?? combined[0]?.id ?? '';

    if (!defaultConversationId) return;

    setSelectedConvId(defaultConversationId);
    selectConversation(defaultConversationId).catch((error) => {
      console.error('Erro ao selecionar conversa inicial:', error);
    });
  }, [selectedConvId, currentConversation?.id, combined, selectConversation]);

  // Sincronizar seleção quando o contexto muda
  useEffect(() => {
    if (currentConversation?.id) {
      setSelectedConvId(currentConversation.id);
    }
  }, [currentConversation?.id]);

  const displayedMessages = useMemo(() => {
    if (currentConversation?.id !== selectedConvId) {
      return [];
    }
    return messages;
  }, [currentConversation?.id, messages, selectedConvId]);

  const retryMessage = async (message: Message) => {
    try {
      await sendMessage(message.content);
    } catch (error) {
      console.error('Erro ao reenviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar a mensagem.',
        variant: 'destructive',
      });
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  const handleSubmit = async () => {
    const trimmedContent = inputValue.trim();

    if (!trimmedContent && selectedFiles.length === 0) {
      return;
    }

    if (!selectedConvId) {
      toast({
        title: 'Conversa não selecionada',
        description: 'Selecione uma conversa para enviar mensagens.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await selectConversation(selectedConvId);
      await sendMessage(trimmedContent, 'text', undefined, undefined, selectedFiles);
      setInputValue('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar.',
        variant: 'destructive',
      });
    }
  };

  const statusMap = {
    sending: { icon: null, showRetry: false },
    sent: { icon: <Check className="w-3 h-3" />, showRetry: false },
    delivered: { icon: <CheckCheck className="w-3 h-3" />, showRetry: false },
    read: { icon: <CheckCheck className="w-3 h-3 text-blue-500" />, showRetry: false },
    failed: { icon: <AlertTriangle className="w-3 h-3 text-red-500" />, showRetry: true },
  };

  const renderMessageStatus = (msg: Message) => {
    const cfg = statusMap[msg.status as keyof typeof statusMap] || statusMap.sent;
    return cfg.showRetry ? (
      <button onClick={() => retryMessage(msg)}>
        {cfg.icon} <RotateCcw className="w-3 h-3 ml-1" />
      </button>
    ) : cfg.icon;
  };

  const renderAttachments = (attachments?: any[]) => {
    if (!attachments?.length) return null;
    return (
      <div className="mt-2 space-y-1">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center space-x-2 text-sm">
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              📎 {att.name}
            </a>
            <span className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader name="Chat Cliente" />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-2">
          {displayedMessages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-2">
              <Avatar><AvatarFallback>CL</AvatarFallback></Avatar>
              <div className="p-2 bg-gray-100 rounded-lg max-w-sm">
                <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                {renderAttachments(msg.attachments)}
                <div className="text-xs mt-1">{renderMessageStatus(msg)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {isLoadingMessages && (
        <div className="text-sm text-muted-foreground px-4 pb-2">
          Carregando mensagens...
        </div>
      )}
      <TypingIndicator users={[]} />
      <div className="border-t p-4 bg-white">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onFileSelect={setSelectedFiles}
          selectedFiles={selectedFiles}
          disabled={isLoadingMessages}
        />
      </div>
    </div>
  );
};

export default ClientChat;
