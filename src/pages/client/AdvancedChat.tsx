import React, { useState, useEffect, useRef } from 'react';
import { useChatAPI } from '@/hooks/useChatAPI';
import { useToast } from '@/hooks/use-toast';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage, { ChatMessageData } from '@/components/chat/ChatMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConnectionStatus } from '@/components/chat/ConnectionStatus';
import type { ChatMessageItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdvancedChatProps {
  conversationId: string;
  userId: string;
  userType: 'client' | 'writer' | 'admin' | 'support';
  userName: string;
  onClose?: () => void;
}

const AdvancedChat: React.FC<AdvancedChatProps> = ({
  conversationId,
  userId,
  userType,
  userName,
  onClose,
}) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    isConnected,
    isLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    setOnline,
    setOffline,
  } = useChatAPI({ conversationId, userId });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setOnline();
    return () => setOffline();
  }, [setOnline, setOffline]);

  const handleSubmit = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) return;
    await sendMessage(messageText, selectedFiles);
    setMessageText('');
    setSelectedFiles([]);
  };

  return (
    <Card className="flex flex-col h-full max-w-3xl mx-auto">
      <CardHeader className="flex justify-between items-center border-b">
        <h3 className="text-xl font-semibold">Chat Avançado</h3>
        <ConnectionStatus isConnected={isConnected} />
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Fechar
          </button>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center text-gray-500">
                Carregando mensagens...
              </div>
            )}
            {!isLoading && messages.length === 0 && (
              <div className="text-center text-gray-500">
                Nenhuma mensagem ainda. Comece a conversa!
              </div>
            )}

            {!isLoading &&
              messages.map((msg: ChatMessageItem) => {
                const formatted: ChatMessageData = {
                  id: msg.id,
                  senderName: msg.sender_name,
                  senderType:
                    msg.sender_type === 'support' ? 'admin' : msg.sender_type,
                  content: msg.content,
                  timestamp: new Date(msg.created_at),
                };

                return (
                  <ChatMessage
                    key={msg.id}
                    message={formatted}
                    isOwn={msg.sender_id === userId}
                    showTimestamp
                    onRetry={() => sendMessage(msg.content)}
                    onEdit={(id, content) => editMessage(id, content)}
                    onDelete={(id) => deleteMessage(id)}
                    onReport={undefined}
                  />
                );
              })}

            <TypingIndicator users={typingUsers} />
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        <ChatInput
          value={messageText}
          onChange={setMessageText}
          onSubmit={handleSubmit}
          onFileSelect={setSelectedFiles}
          selectedFiles={selectedFiles}
          disabled={!isConnected}
          placeholder={
            isConnected ? `Digite como ${userName}...` : 'Conectando...'
          }
        />
      </CardContent>
    </Card>
  );
};

export default AdvancedChat;
