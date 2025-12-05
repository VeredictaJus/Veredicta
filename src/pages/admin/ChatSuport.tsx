import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import IntegratedChat from '../../components/chat/IntegratedChat';
import AdminChatNotification from './AdminChatNotification';
import MultiAdminChatManager from '@/components/chat/MultiAdminChatManager';
import type { AdminConversation } from '@/services/multiAdminChatService';
import { supabase } from '@/lib/supabaseClient';
import { ChatService } from '@/services/chatService';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { selectConversation, loadConversations } = useChat();
  
  // ✅ CORREÇÃO: Verificar se há petitionId ou conversation na URL no estado inicial
  const initialPetitionId = searchParams.get('petitionId');
  const initialConversationId = searchParams.get('conversation');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversationInfo | null>(null);
  const [viewMode, setViewMode] = useState<'manager' | 'chat'>((initialPetitionId || initialConversationId) ? 'chat' : 'manager');
  const isSelectingRef = useRef(false);
  const hasProcessedPetitionIdRef = useRef(false);
  const hasProcessedConversationIdRef = useRef(false);

  const handleConversationSelect = React.useCallback(async (
    conversationId: string,
    conversation?: { conversation_id: string; title?: string; client_name?: string; priority?: string; status?: string; type?: string }
  ) => {
    if (!conversationId) {
      return;
    }
    
    if (isSelectingRef.current) {
      return;
    }
    
    isSelectingRef.current = true;
    
    setSelectedConversationId(conversationId);
    
    if (conversation) {
      setSelectedConversation({
        conversation_id: conversation.conversation_id,
        title: conversation.title || 'Conversa',
        client_name: conversation.client_name,
        priority: conversation.priority as AdminConversation['priority'] | undefined,
        status: conversation.status as AdminConversation['status'] | undefined,
        type: conversation.type as AdminConversation['type'] | undefined,
      });
    } else {
      setSelectedConversation({
        conversation_id: conversationId,
        title: 'Conversa',
      });
    }
    
    setViewMode('chat');
    
    // ✅ CORREÇÃO: Carregar conversa (selectConversation já carrega mensagens)
    // Não precisa chamar loadConversationMessages aqui pois selectConversation já faz isso
    // Usar .then() em vez de await para evitar erro de build
    selectConversation(conversationId)
      .catch((error) => {
        console.error('Erro ao carregar conversa no contexto:', error);
        toast.error('Erro ao carregar conversa');
      });
    
    // Resetar flag após um pequeno delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  }, [selectConversation, toast]);

  // ✅ CORREÇÃO: Garantir que quando selectedConversationId muda, o viewMode também muda
  useEffect(() => {
    if (selectedConversationId) {
      setViewMode('chat');
    }
  }, [selectedConversationId]);

  // ✅ CORREÇÃO: Buscar e abrir conversa quando petitionId está na URL - executar imediatamente
  useEffect(() => {
    const petitionId = searchParams.get('petitionId');
    const locationState = location.state as any;
    
    if (petitionId && !hasProcessedPetitionIdRef.current) {
      hasProcessedPetitionIdRef.current = true;
      setViewMode('chat'); // ✅ Mudar para 'chat' imediatamente para não mostrar o gerenciador
      
      // Buscar conversa relacionada à petição
      const findConversationForPetition = async () => {
        try {
          // Tentar buscar por petition_id
          let { data: conversations, error } = await supabase
            .from('conversations')
            .select('id, title, type, status, priority, metadata, petition_id')
            .eq('petition_id', petitionId)
            .limit(1);

          // Se não encontrar, tentar por metadata
          if ((!conversations || conversations.length === 0) && !error) {
            const { data: conversationsByMetadata } = await supabase
              .from('conversations')
              .select('id, title, type, status, priority, metadata, petition_id')
              .contains('metadata', { petitionId })
              .limit(1);
            
            if (conversationsByMetadata && conversationsByMetadata.length > 0) {
              conversations = conversationsByMetadata;
            }
          }

          if (conversations && conversations.length > 0) {
            const conversation = conversations[0];
            
            // ✅ Abrir a conversa imediatamente (sem esperar selectConversation)
            setSelectedConversationId(conversation.id);
            setSelectedConversation({
              conversation_id: conversation.id,
              title: conversation.title || locationState?.petitionTitle || 'Conversa',
              client_name: locationState?.clientName,
              priority: conversation.priority as AdminConversation['priority'],
              status: conversation.status as AdminConversation['status'],
              type: conversation.type as AdminConversation['type'],
            });
            setViewMode('chat');

            // ✅ CORREÇÃO: Usar .then() em vez de await para evitar erro de build
            selectConversation(conversation.id)
              .catch((err) => {
                console.error('Erro ao carregar conversa no contexto:', err);
              });

            // Limpar parâmetro da URL após processar
            setSearchParams({});
          } else {
            setViewMode('manager'); // Voltar para o gerenciador se não encontrar conversa
            toast.info('Nenhuma conversa encontrada para esta petição. Você pode criar uma nova conversa de suporte.');
            // Limpar parâmetro da URL
            setSearchParams({});
          }
        } catch (error) {
          console.error('Erro ao buscar conversa para petição:', error);
          setViewMode('manager'); // Voltar para o gerenciador em caso de erro
          toast.error('Erro ao buscar conversa para esta petição');
          setSearchParams({});
        }
      };

      findConversationForPetition();
    }

    // Resetar flag quando o componente desmonta ou quando não há mais petitionId
    return () => {
      if (!searchParams.get('petitionId')) {
        hasProcessedPetitionIdRef.current = false;
      }
    };
  }, [searchParams, location.state, setSearchParams, selectConversation]);

  // ✅ CORREÇÃO: Buscar e abrir conversa quando conversation está na URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    
    if (conversationId && !hasProcessedConversationIdRef.current) {
      hasProcessedConversationIdRef.current = true;
      
      // ✅ DEFINIR IMEDIATAMENTE para garantir que a UI atualize
      setSelectedConversationId(conversationId);
      setViewMode('chat'); // ✅ Mudar para 'chat' imediatamente para não mostrar o gerenciador
      setSelectedConversation({
        conversation_id: conversationId,
        title: 'Conversa',
      });
      
      // ✅ Limpar parâmetro da URL imediatamente (não esperar selectConversation)
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('conversation');
      setSearchParams(newSearchParams, { replace: true });
      
      // ✅ CORREÇÃO: Usar .then() em vez de await para evitar erro de build
      selectConversation(conversationId)
        .catch((error) => {
          console.error('Erro ao abrir conversa:', error);
          toast.error('Erro ao abrir conversa');
          setViewMode('manager'); // Voltar para o gerenciador em caso de erro
          setSelectedConversationId(null);
        });
    }

    // Resetar flag quando o componente desmonta ou quando não há mais conversation
    return () => {
      if (!searchParams.get('conversation')) {
        hasProcessedConversationIdRef.current = false;
      }
    };
  }, [searchParams, setSearchParams, selectConversation, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat de Suporte</h1>
          <p className="text-muted-foreground">Atendimento aos usuários</p>
        </div>
        <div className="flex items-center space-x-4">
          <AdminChatNotification />
          {selectedConversationId && (
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

      {/* ✅ CORREÇÃO: Priorizar selectedConversationId - abrir conversa diretamente */}
      {selectedConversationId ? (
        <div className="space-y-4">
          <div className="h-[600px] max-h-[70vh]">
            <IntegratedChat selectedConversationId={selectedConversationId} />
          </div>
          {selectedConversation && (
            <Card>
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="h-3 w-3" />
                  <span className="truncate" title={selectedConversation.title || selectedConversation.client_name || 'Conversa'}>
                    {(() => {
                      const displayName = selectedConversation.title || selectedConversation.client_name || 'Conversa';
                      return displayName.length > 50 ? displayName.substring(0, 47) + '...' : displayName;
                    })()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-2 px-3">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {selectedConversation.client_name && (
                    <p className="truncate" title={selectedConversation.client_name}>
                      👤 Cliente: {selectedConversation.client_name.length > 50 
                        ? selectedConversation.client_name.substring(0, 47) + '...' 
                        : selectedConversation.client_name}
                    </p>
                  )}
                  {selectedConversation.priority && (
                    <p>🏷️ Prioridade: {selectedConversation.priority}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <MultiAdminChatManager
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
        />
      )}
    </div>
  );
}