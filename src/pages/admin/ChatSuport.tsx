import React, { useState } from 'react';
import IntegratedChat from '../../components/chat/IntegratedChat';
import AdminChatNotification from './AdminChatNotification';
import MultiAdminChatManager from '@/components/chat/MultiAdminChatManager';
import type { AdminConversation } from '@/services/multiAdminChatService';

type SelectedConversationInfo = {
  conversation_id: string;
  title?: string;
  client_name?: string;
  priority?: AdminConversation['priority'];
  status?: AdminConversation['status'];
  type?: AdminConversation['type'];
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, ArrowLeft } from 'lucide-react';

export default function ChatSuport() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversationInfo | null>(null);
  const [viewMode, setViewMode] = useState<'manager' | 'chat'>('manager');

  const handleConversationSelect = (
    conversationId: string,
    conversation?: { conversation_id: string; title?: string; client_name?: string; priority?: string; status?: string; type?: string }
  ) => {
    setSelectedConversationId(conversationId);
    setSelectedConversation(
      conversation
        ? {
            conversation_id: conversation.conversation_id,
            title: conversation.title || 'Conversa',
            client_name: conversation.client_name,
            priority: conversation.priority as AdminConversation['priority'] | undefined,
            status: conversation.status as AdminConversation['status'] | undefined,
            type: conversation.type as AdminConversation['type'] | undefined,
          }
        : null
    );
    setViewMode('chat');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat de Suporte</h1>
          <p className="text-muted-foreground">Atendimento aos usuários</p>
        </div>
        <div className="flex items-center space-x-4">
          <AdminChatNotification />
          {viewMode === 'chat' && selectedConversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode('manager');
                setSelectedConversationId(null);
                setSelectedConversation(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Gerenciador
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'manager' ? (
        <MultiAdminChatManager
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
        />
      ) : (
        <div className="space-y-4">
          {selectedConversationId && selectedConversation ? (
            <div className="space-y-4">
              <div className="h-[600px] max-h-[70vh]">
                <IntegratedChat selectedConversationId={selectedConversationId} />
              </div>
              <Card>
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <MessageSquare className="h-3 w-3" />
                    <span>{selectedConversation.title || selectedConversation.client_name || 'Conversa'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2 px-3">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {selectedConversation.client_name && (
                      <p>👤 Cliente: {selectedConversation.client_name}</p>
                    )}
                    {selectedConversation.priority && (
                      <p>🏷️ Prioridade: {selectedConversation.priority}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma conversa selecionada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Selecione uma conversa no gerenciador para começar o atendimento
                </p>
                <Button
                  onClick={() => setViewMode('manager')}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ir para o Gerenciador
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}