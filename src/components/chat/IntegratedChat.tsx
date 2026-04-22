import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { WriterService, Writer } from '@/services/writerService';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatWindow from '@/components/chat/ChatWindow';
import { MessageCircle, Plus, Users, Phone, FileText, User } from 'lucide-react';

interface IntegratedChatProps {
  className?: string;
  selectedConversationId?: string | null;
}

export default function IntegratedChat({ className, selectedConversationId: externalSelectedConversationId }: IntegratedChatProps) {
  // 🚀 CORREÇÃO: Verificação defensiva do ChatContext
  let chatContext;
  try {
    chatContext = useChat();
  } catch (error) {
    return (
      <div className="p-4 text-center text-gray-500">
        Chat não disponível no momento. Tente recarregar a página.
      </div>
    );
  }
  
  const { createConversation, selectConversation, conversations, loadConversations } = chatContext;
  const { user } = useNewAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // ✅ CORREÇÃO: Inicializar com externalSelectedConversationId ou parâmetro da URL
  const initialConversationId = externalSelectedConversationId || searchParams.get('conversation') || null;
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [isLoadingWriters, setIsLoadingWriters] = useState(false);
  
  // ✅ CORREÇÃO: Garantir que selectedConversationId seja atualizado quando searchParams mudar na montagem
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversationId !== selectedConversationId && !externalSelectedConversationId) {
      // Atualizar imediatamente quando houver parâmetro na URL
      setSelectedConversationId(conversationId);
    }
  }, [searchParams]); // Executar quando searchParams mudar
  
  // Form para criar conversa
  const [formData, setFormData] = useState({
    title: '',
    type: 'support' as 'support' | string, // Agora pode ser 'support' ou ID do redator
    description: ''
  });

  // 🚀 Detectar se o usuário é um admin usando a propriedade role
  const userIsAdmin = user?.role === 'admin';
  

  // 🚀 Garantir que não-admins sempre usem tipo "support"
  useEffect(() => {
    if (!userIsAdmin && formData.type !== 'support') {
      setFormData(prev => ({ ...prev, type: 'support' }));
    }
  }, [userIsAdmin, formData.type]);

  // Sistema simplificado - sem dependência de redatores reais
  useEffect(() => {
    // Por enquanto, não carregamos redatores reais
    // O sistema funciona apenas com "Suporte"
    setWriters([]);
    setIsLoadingWriters(false);
  }, [user]);

  // 🚀 CORREÇÃO: Lidar com parâmetro conversation da URL (sem causar loop)
  const lastProcessedConversationRef = useRef<string | null>(null);
  const conversationIdFromUrlRef = useRef<string | null>(null);
  
  // ✅ CORREÇÃO: Carregar conversas na montagem se houver parâmetro na URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length === 0 && user) {
      // Carregar conversas imediatamente se houver parâmetro na URL
      loadConversations().catch((error) => {
        console.error('Erro ao carregar conversas na montagem:', error);
      });
    }
  }, [user, searchParams, conversations.length, loadConversations]); // Executar quando necessário

  // Selecionar conversa
  const handleSelectConversation = React.useCallback(
    async (conversationId: string) => {
      // ✅ CORREÇÃO: Atualizar URL quando seleção é manual (antes de resetar o ref)
      const currentConversationParam = searchParams.get('conversation');
      if (currentConversationParam !== conversationId) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('conversation', conversationId);
        setSearchParams(newSearchParams, { replace: true });
      }
      
      // ✅ CORREÇÃO: Resetar lastProcessedConversationRef para permitir mudanças
      // Mas marcar como processado após atualizar a URL
      lastProcessedConversationRef.current = conversationId;
      
      setSelectedConversationId(conversationId);
      
      try {
        await selectConversation(conversationId);
      } catch (error) {
        console.error('Erro ao selecionar conversa:', error);
      }
    },
    [selectConversation, searchParams, setSearchParams, selectedConversationId]
  );

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    const currentSelected = selectedConversationId; // Capturar valor atual
    const currentLastProcessed = lastProcessedConversationRef.current; // Capturar valor atual
    
    // ✅ CORREÇÃO: Se o conversationId da URL não mudou, não fazer nada
    if (conversationIdFromUrlRef.current === conversationId) {
      return;
    }
    
    // Atualizar ref do conversationId da URL
    conversationIdFromUrlRef.current = conversationId;
    
    if (!conversationId) {
      // Se não há parâmetro na URL, limpar seleção se necessário
      if (currentSelected && !externalSelectedConversationId) {
        setSelectedConversationId(null);
        lastProcessedConversationRef.current = null;
      }
      return;
    }
    
    // ✅ CORREÇÃO CRÍTICA: Se já foi processado, não fazer nada (evitar loops)
    // Usar apenas lastProcessedConversationRef para verificar, não selectedConversationId
    if (currentLastProcessed === conversationId) {
      return;
    }

    // ✅ CORREÇÃO: Se não há conversas carregadas, carregar primeiro
    if (conversations.length === 0) {
      loadConversations().then(() => {
        // Após carregar, tentar selecionar novamente
        // O useEffect será executado novamente quando conversations mudar
        // Mas garantir que selectedConversationId esteja definido
        if (conversationId !== currentSelected) {
          setSelectedConversationId(conversationId);
        }
      }).catch((error) => {
        console.error('Erro ao carregar conversas:', error);
      });
      return;
    }

    // ✅ CORREÇÃO: Marcar como processado ANTES de fazer qualquer atualização
    // Isso evita que o useEffect seja executado novamente
    lastProcessedConversationRef.current = conversationId;
    
    // ✅ CORREÇÃO: Atualizar selectedConversationId apenas se for diferente
    if (conversationId !== currentSelected) {
      setSelectedConversationId(conversationId);
    }
    
    // ✅ CORREÇÃO: Chamar selectConversation diretamente (sem handleSelectConversation)
    // para evitar atualizar a URL novamente (já está na URL)
    // Isso é apenas para mudanças na URL, não para cliques manuais
    selectConversation(conversationId).catch((error) => {
      console.error('Erro ao selecionar conversa:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations.length]); // ✅ CORREÇÃO: Usar searchParams e conversations.length, mas verificar mudança do conversationId internamente

  useEffect(() => {
    const handleExternalConversation = async () => {
      if (externalSelectedConversationId) {
        // Se já está processado, não fazer nada
        if (lastProcessedConversationRef.current === externalSelectedConversationId && selectedConversationId === externalSelectedConversationId) {
          return;
        }
        
        lastProcessedConversationRef.current = externalSelectedConversationId;
        
        // ✅ OTIMIZAÇÃO: Definir selectedConversationId imediatamente para mostrar o chat
        setSelectedConversationId(externalSelectedConversationId);
        
        // ✅ OTIMIZAÇÃO: Verificar se a conversa já existe na lista antes de recarregar
        const conversationExists = conversations.find(conv => conv.id === externalSelectedConversationId);
        
        if (!conversationExists) {
          // Se não existe, recarregar conversas em paralelo com a seleção
          loadConversations().catch(error => {
            console.error('Erro ao recarregar conversas:', error);
          });
        }
        
        // ✅ OTIMIZAÇÃO: Selecionar a conversa imediatamente (o selectConversation vai buscar se necessário)
        handleSelectConversation(externalSelectedConversationId).catch(error => {
          console.error('Erro ao selecionar conversa:', error);
        });
      } else if (!externalSelectedConversationId && selectedConversationId) {
        // Limpar apenas se não há externalSelectedConversationId
        setSelectedConversationId(null);
        lastProcessedConversationRef.current = null;
      }
    };

    handleExternalConversation();
  }, [externalSelectedConversationId, selectedConversationId, handleSelectConversation, conversations, loadConversations]);


  // Criar conversa
  const handleCreateConversation = async () => {
    if (!formData.title.trim() || !user) return;

    setIsLoading(true);
    try {
      // Criar conversa com o usuário atual
      const participants = [
        { userId: user.uid, role: 'client' as const }
      ];
      
      // Determinar o tipo de conversa e adicionar participante apropriado
      let conversationType = 'general';
      
      if (formData.type === 'support') {
        // Conversa de suporte - adicionar admin/suporte
        participants.push({ userId: 'support-admin', role: 'client' as const });
        conversationType = 'support';
      } else if (formData.type === 'writer') {
        // Conversa com redator genérico - adicionar um redator padrão
        participants.push({ userId: 'writer-default', role: 'client' as const });
        conversationType = 'petition';
      }

      const conversationId = await createConversation(
        formData.title,
        conversationType as 'support' | 'petition' | 'general',
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

  // Se há uma conversa selecionada externamente (do admin), mostrar apenas o chat em tela cheia
  // Usar externalSelectedConversationId diretamente se disponível, senão usar selectedConversationId interno
  const activeConversationId = externalSelectedConversationId || selectedConversationId;
  const showFullChat = !!externalSelectedConversationId;

  return (
    <div className={`flex h-full space-x-3 min-h-0 ${className}`}>
      {/* Lista de Conversas - ocultar quando há conversa externa selecionada */}
      {!showFullChat && (
        <div className="h-full w-[360px] min-w-[320px] overflow-hidden flex flex-col">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            onCreateConversation={() => setIsCreateDialogOpen(true)}
          />
        </div>
      )}

      {/* Janela do Chat */}
      <div className={showFullChat ? "w-full h-full flex flex-col min-h-0 min-w-0" : "flex-1 h-full flex flex-col min-h-0 min-w-0"}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatWindow
            conversationId={activeConversationId || undefined}
            onClose={() => {
              if (externalSelectedConversationId) {
                // Se é externo, não fazer nada (o componente pai controla)
                return;
              }
              setSelectedConversationId(null);
            }}
          />
        </div>
      </div>

      {/* Dialog para Criar Conversa */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>{userIsAdmin ? 'Nova Conversa' : 'Nova Conversa com Suporte'}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Mensagem informativa - apenas para não-admins */}
            {!userIsAdmin && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Phone className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-orange-900 dark:text-orange-100">
                  Fale com nossa equipe de suporte técnico
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título da Conversa</Label>
              <Input
                id="title"
                placeholder="Ex: Dúvida sobre petição, problema técnico..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            {/* 🚀 Mostrar dropdown "Tipo de Conversa" apenas para Admin */}
            {userIsAdmin && (
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Conversa</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Suporte</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="writer">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Redator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente o que você precisa..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
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
              {isLoading ? 'Criando...' : 'Criar Conversa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
