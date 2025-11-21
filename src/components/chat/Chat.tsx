import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useChat } from '@/contexts/ChatContext';
import { MessageSquare, Send, ArrowLeft, Clock, CheckCheck, User, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { filterSensitiveInfo, containsSensitiveInfo } from '@/utils/messageFilter';
import { toast } from 'sonner';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPetitionId?: string;
}

export default function Chat({ isOpen, onClose, selectedPetitionId }: ChatProps) {
  const { user } = useNewAuth();
  
  // 🚀 SINCRONIZAÇÃO: Usar o mesmo ChatContext do chat principal
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    loadConversations,
    loadConversationMessages,
    selectConversation,
    sendMessage,
    markAsRead
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user, loadConversations]);

  useEffect(() => {
    if (selectedPetitionId && conversations.length > 0) {
      const conversation = conversations.find(c => c.petition_id === selectedPetitionId);
      if (conversation) {
        selectConversation(conversation.id);
        loadConversationMessages(conversation.id);
      }
    }
  }, [selectedPetitionId, conversations, selectConversation, loadConversationMessages]);

  // 🚀 SINCRONIZAÇÃO: Usar função do ChatContext
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !user) return;

    const messageContent = newMessage.trim();
    
    // 🔒 FILTRAR INFORMAÇÕES SENSÍVEIS
    const filteredContent = filterSensitiveInfo(messageContent);
    
    // Verificar se houve filtragem e avisar o usuário
    if (containsSensitiveInfo(messageContent)) {
      toast.warning('⚠️ Conteúdo sensível ou inadequado foi filtrado', {
        description: 'Por segurança, não compartilhe dados pessoais nem linguagem inapropriada no chat.',
        duration: 5000
      });
    }
    
    setNewMessage('');
    setIsTyping(false);

    try {
      await sendMessage(currentConversation.id, filteredContent); // Envia a mensagem filtrada
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const getMessageStatus = (message: any) => {
    if (message.status === 'read') {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else if (message.status === 'sent') {
      return <CheckCheck className="h-3 w-3 text-gray-300" />;
    }
    return <Clock className="h-3 w-3 text-gray-300" />;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {currentConversation ? currentConversation.title : 'Selecione uma conversa'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Conversations List */}
          {!currentConversation && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      selectConversation(conversation.id);
                      loadConversationMessages(conversation.id);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm truncate">
                            {conversation.title}
                          </span>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 text-xs flex items-center justify-center p-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Última mensagem: {conversation.updated_at ? formatMessageTime(conversation.updated_at) : 'Nunca'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Messages */}
          {currentConversation && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-xs ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          {message.sender_id === user?.id && getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoadingMessages && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border-t">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}