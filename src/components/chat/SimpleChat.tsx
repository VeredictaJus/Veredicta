import React, { useState } from 'react';
import { useSimpleChat } from '@/contexts/SimpleChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { filterSensitiveInfo, containsSensitiveInfo } from '@/utils/messageFilter';
import { toast } from 'sonner';

export default function SimpleChat() {
  const { 
    conversations, 
    messages, 
    currentConversation, 
    isLoading, 
    error,
    selectConversation,
    sendMessage 
  } = useSimpleChat();

  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const content = messageInput.trim();
    
    // 🔒 FILTRAR INFORMAÇÕES SENSÍVEIS
    const filteredContent = filterSensitiveInfo(content);
    
    // Verificar se houve filtragem e avisar o usuário
    if (containsSensitiveInfo(content)) {
      toast.warning('⚠️ Conteúdo sensível ou inadequado foi filtrado', {
        description: 'Por segurança, não compartilhe dados pessoais nem linguagem inapropriada no chat.',
        duration: 5000
      });
    }
    
    await sendMessage(filteredContent); // Envia a mensagem filtrada
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full space-x-4">
      {/* Lista de Conversas */}
      <div className="w-1/3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Carregando...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id
                        ? 'bg-orange-100 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{conversation.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {conversation.type}
                      </Badge>
                    </div>
                    {conversation.last_message_content && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {conversation.last_message_content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Janela do Chat */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          {currentConversation ? (
            <>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{currentConversation.title}</CardTitle>
                <Badge variant={currentConversation.status === 'active' ? 'default' : 'secondary'}>
                  {currentConversation.status}
                </Badge>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Mensagens */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === 'support-admin' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg ${
                            message.sender_id === 'support-admin'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-orange-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
