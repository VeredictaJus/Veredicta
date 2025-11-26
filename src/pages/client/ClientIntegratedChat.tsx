import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatWindow from '@/components/chat/ChatWindow';
import { MessageCircle, Plus, Users, Phone, FileText } from 'lucide-react';

interface ClientIntegratedChatProps {
  className?: string;
}

export default function ClientIntegratedChat({ className }: ClientIntegratedChatProps) {
  const { user } = useNewAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { createConversation, currentConversation, selectConversation, conversations, loadConversationMessages, loadConversations } = useChat();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form para criar conversa (APENAS SUPORTE - conversas com redatores são automáticas)
  const [formData, setFormData] = useState({
    title: '',
    type: 'support' as const,
    description: ''
  });

  // 🚀 CORREÇÃO: Lidar com parâmetro conversation da URL (sem causar loop)
  const lastProcessedConversationRef = useRef<string | null>(null);
  const lastProcessedStateRef = useRef<any>(null);
  const isManualSelectionRef = useRef<boolean>(false);
  
  // ✅ Definir selectedConversationId imediatamente quando houver parâmetro na URL
  // Isso garante que o ChatWindow seja renderizado imediatamente
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversationId !== selectedConversationId) {
      // Se foi uma seleção manual, não processar aqui (já foi processado em handleSelectConversation)
      if (isManualSelectionRef.current) {
        isManualSelectionRef.current = false;
        return;
      }
      setSelectedConversationId(conversationId);
      lastProcessedConversationRef.current = conversationId;
    }
  }, [searchParams, selectedConversationId]);
  
  // ✅ Carregar e selecionar a conversa quando as conversas estiverem disponíveis
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (!conversationId) return;
    
    // Evitar processar a mesma conversa múltiplas vezes
    if (lastProcessedConversationRef.current === conversationId && selectedConversationId === conversationId) {
      return;
    }
    
    // Se foi uma seleção manual, não processar aqui (já foi processado em handleSelectConversation)
    if (isManualSelectionRef.current) {
      return;
    }
    
    // ✅ CORREÇÃO: Se não há conversas carregadas, carregar primeiro
    if (conversations.length === 0) {
      loadConversations().then(() => {
        // Após carregar, tentar selecionar novamente
        // O useEffect será executado novamente quando conversations mudar
      }).catch((error) => {
        console.error('Erro ao carregar conversas:', error);
      });
      return;
    }
    
    // Verificar se a conversa existe
    const conversationExists = conversations.find(conv => conv.id === conversationId);
    if (conversationExists && selectedConversationId !== conversationId) {
      lastProcessedConversationRef.current = conversationId;
      // Não atualizar URL aqui para evitar loop (já está na URL)
      setSelectedConversationId(conversationId);
      // Carregar mensagens e selecionar no contexto
      (async () => {
        try {
          if (loadConversationMessages) {
            await loadConversationMessages(conversationId);
          }
          await selectConversation(conversationId);
        } catch (error) {
          console.error('Erro ao selecionar conversa:', error);
        }
      })();
    } else if (!conversationExists && selectedConversationId !== conversationId) {
      // ✅ CORREÇÃO: Se a conversa não existe na lista, tentar selecionar mesmo assim
      // (pode ser que ainda não tenha sido carregada)
      lastProcessedConversationRef.current = conversationId;
      setSelectedConversationId(conversationId);
      // Tentar selecionar diretamente - o selectConversation vai buscar se necessário
      selectConversation(conversationId).catch((error) => {
        console.error('Erro ao selecionar conversa:', error);
      });
    }
  }, [searchParams, conversations, selectedConversationId, loadConversationMessages, selectConversation, loadConversations]);

  // 🚀 Processar state do botão de chat (conversa com redator)
  useEffect(() => {
    const state = location.state as any;
    
    // Processar se tiver petitionId (com ou sem autoSelect)
    if (state?.petitionId && conversations.length > 0) {
      // Evitar processar o mesmo state múltiplas vezes
      if (lastProcessedStateRef.current?.petitionId === state.petitionId) {
        return;
      }
      
      lastProcessedStateRef.current = state;
      
      handleWriterConversation(state);
    }
  }, [location.state, conversations]);

  // Selecionar conversa
  const handleSelectConversation = async (conversationId: string) => {
    // ✅ Marcar como seleção manual para evitar que o useEffect interfira
    isManualSelectionRef.current = true;
    setSelectedConversationId(conversationId);
    
    // ✅ Atualizar URL para manter sincronização quando seleção é manual
    const currentConversationParam = searchParams.get('conversation');
    if (currentConversationParam !== conversationId) {
      // Atualizar URL sem recarregar a página
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('conversation', conversationId);
      setSearchParams(newSearchParams, { replace: true });
      // Atualizar ref para permitir que o useEffect processe a nova seleção
      lastProcessedConversationRef.current = conversationId;
    }
    
    // ✅ OTIMIZAÇÃO: Não bloquear a UI - carregar em background
    // selectConversation já carrega as mensagens internamente, não precisa chamar loadConversationMessages separadamente
    selectConversation(conversationId).catch((error) => {
      console.error('Erro ao selecionar conversa:', error);
    });
  };

  // 🚀 Buscar ou criar conversa com redator
  const handleWriterConversation = async (state: any) => {
    try {
      // Buscar conversa existente para esta petição
      const existingConv = conversations.find(conv => {
        // Verificar se é conversa relacionada a esta petição
        return conv.metadata?.petitionId === state.petitionId || 
               conv.petition_id === state.petitionId ||
               (state.petitionTitle && conv.title?.includes(state.petitionTitle));
      });

      if (existingConv) {
        await handleSelectConversation(existingConv.id);
        return;
      }

      // Se não existe, buscar dados da petição para criar conversa
      if (!state.petitionTitle || !state.assigned_writer_id) {
        // Buscar dados da petição do Supabase
        const { data: petition } = await supabase
          .from('petitions')
          .select('title, assigned_writer_id')
          .eq('id', state.petitionId)
          .single();
        
        if (petition) {
          state.petitionTitle = petition.title;
          state.assigned_writer_id = petition.assigned_writer_id;
        }
      }

      // Se não existe, criar nova conversa
      const conversationTitle = `Petição: ${state.petitionTitle || 'Sem título'}`;
      const participants = [
        { userId: user!.uid, role: 'client' as const },
        { userId: state.writerId || state.assigned_writer_id || 'writer-temp', role: 'writer' as const }
      ];

      const conversationId = await createConversation(
        conversationTitle,
        'petition',
        participants,
        { petitionId: state.petitionId }
      );

      // Recarregar conversas para garantir que aparece na lista
      if (loadConversations) {
        await loadConversations();
      }
      
      await handleSelectConversation(conversationId);
      
    } catch (error) {
      console.error('❌ Erro ao processar conversa com redator:', error);
    }
  };

  // Criar conversa (APENAS SUPORTE - conversas com redatores são criadas automaticamente)
  const handleCreateConversation = async () => {
    if (!formData.title.trim() || !user) return;

    setIsLoading(true);
    try {
      // Criar conversa de suporte com admin
      const participants = [
        { userId: user.uid, role: 'client' as const },
        { userId: 'support-admin', role: 'support' as const }
      ];

      const conversationId = await createConversation(
        formData.title,
        'support',
        participants
      );

      setSelectedConversationId(conversationId);
      setIsCreateDialogOpen(false);
      
      // 🚀 CORREÇÃO: Selecionar automaticamente a nova conversa criada
      await handleSelectConversation(conversationId);
      
      // Reset form
      setFormData({
        title: '',
        type: 'support',
        description: ''
      });
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obter ícone do tipo de conversa
  const getTypeIcon = (type: string) => {
    if (type === 'support') {
      return <Phone className="h-4 w-4" />;
    } else if (type === 'writer') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <Users className="h-4 w-4" />;
    }
  };

  // Obter descrição do tipo de conversa
  const getTypeDescription = (type: string): string => {
    if (type === 'support') {
      return 'Conversa de suporte técnico';
    } else if (type === 'writer') {
      return 'Conversa com redator';
    } else {
      return 'Conversa geral';
    }
  };

  return (
    <div className={`flex h-full space-x-4 ${className}`}>
      {/* Lista de Conversas */}
      <div className="w-1/3 h-full">
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          onCreateConversation={() => setIsCreateDialogOpen(true)}
        />
      </div>

      {/* Janela do Chat */}
      <div className="flex-1 h-full">
        <ChatWindow
          conversationId={selectedConversationId || undefined}
          onClose={() => setSelectedConversationId(null)}
        />
      </div>

      {/* Dialog para Criar Conversa */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-orange-600" />
              <span>Falar com Suporte</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Informação sobre conversas automáticas com redatores */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-100">
                  <p className="font-semibold mb-1">💡 Conversas com Redatores</p>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    As conversas com redatores são criadas automaticamente quando eles aceitam suas petições. Use este formulário apenas para falar com o suporte.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Assunto do Suporte</Label>
              <Input
                id="title"
                placeholder="Ex: Dúvida sobre pagamento, Problema técnico..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descreva sua dúvida ou problema</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o que você precisa..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <Phone className="h-4 w-4 text-orange-600" />
              <span className="text-gray-700 dark:text-gray-300">Conversa de <strong>Suporte Técnico</strong></span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!formData.title.trim() || isLoading}
            >
              {isLoading ? 'Criando...' : 'Abrir Suporte'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
