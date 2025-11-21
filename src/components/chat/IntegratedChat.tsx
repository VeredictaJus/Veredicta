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
    console.log('🔍 ChatContext não disponível no IntegratedChat');
    return (
      <div className="p-4 text-center text-gray-500">
        Chat não disponível no momento. Tente recarregar a página.
      </div>
    );
  }
  
  const { createConversation, selectConversation, conversations, loadConversations } = chatContext;
  const { user } = useNewAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [isLoadingWriters, setIsLoadingWriters] = useState(false);
  
  // Form para criar conversa
  const [formData, setFormData] = useState({
    title: '',
    type: 'support' as 'support' | string, // Agora pode ser 'support' ou ID do redator
    description: ''
  });

  // 🚀 Detectar se o usuário é um admin usando a propriedade role
  const userIsAdmin = user?.role === 'admin';
  
  // Debug: Log do tipo de usuário
  useEffect(() => {
    console.log('🔍 IntegratedChat - Tipo de usuário:', user?.role);
    console.log('🔍 IntegratedChat - É admin?', userIsAdmin);
  }, [user?.role, userIsAdmin]);

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
    console.log('💬 Sistema de chat simplificado - apenas suporte disponível');
    setWriters([]);
    setIsLoadingWriters(false);
  }, [user]);

  // 🚀 CORREÇÃO: Lidar com parâmetro conversation da URL (sem causar loop)
  const lastProcessedConversationRef = useRef<string | null>(null);

  // Selecionar conversa
  const handleSelectConversation = React.useCallback(
    async (conversationId: string) => {
      setSelectedConversationId(conversationId);
      try {
        await selectConversation(conversationId);
      } catch (error) {
        console.error('Erro ao selecionar conversa:', error);
      }
    },
    [selectConversation]
  );

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      if (lastProcessedConversationRef.current === conversationId) {
        return;
      }

      const conversationExists = conversations.find(conv => conv.id === conversationId);
      if (conversationExists && conversationId !== selectedConversationId) {
        console.log('🔍 IntegratedChat: Selecionando conversa da URL:', conversationId);
        lastProcessedConversationRef.current = conversationId;
        handleSelectConversation(conversationId);
      }
    }
  }, [searchParams, conversations, selectedConversationId, handleSelectConversation]);

  useEffect(() => {
    const handleExternalConversation = async () => {
      if (externalSelectedConversationId && externalSelectedConversationId !== selectedConversationId) {
        console.log('🔍 IntegratedChat: Selecionando conversa externa:', externalSelectedConversationId);
        lastProcessedConversationRef.current = externalSelectedConversationId;
        
        // Sempre selecionar a conversa, mesmo que não esteja na lista ainda
        // O ChatWindow vai tentar recarregar se necessário
        setSelectedConversationId(externalSelectedConversationId);
        
        // Verificar se a conversa existe na lista de conversas do ChatContext
        const conversationExists = conversations.find(conv => conv.id === externalSelectedConversationId);
        
        if (!conversationExists) {
          // Se a conversa não existe, recarregar as conversas primeiro
          console.log('🔄 Conversa não encontrada, recarregando conversas...');
          await loadConversations();
          
          // Aguardar um pouco para o estado atualizar
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Tentar selecionar novamente
          handleSelectConversation(externalSelectedConversationId);
        } else {
          // Se a conversa existe, apenas selecionar no ChatContext
          handleSelectConversation(externalSelectedConversationId);
        }
      }

      if (!externalSelectedConversationId && selectedConversationId) {
        setSelectedConversationId(null);
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
  const showFullChat = !!externalSelectedConversationId && !!selectedConversationId;

  return (
    <div className={`flex h-full space-x-4 min-h-0 ${className}`}>
      {/* Lista de Conversas - ocultar quando há conversa externa selecionada */}
      {!showFullChat && (
        <div className="w-1/3 h-full overflow-hidden flex flex-col">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            onCreateConversation={() => setIsCreateDialogOpen(true)}
          />
        </div>
      )}

      {/* Janela do Chat */}
      <div className={showFullChat ? "w-full h-full flex flex-col min-h-0" : "flex-1 h-full flex flex-col min-h-0"}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatWindow
            conversationId={selectedConversationId || undefined}
            onClose={() => setSelectedConversationId(null)}
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
