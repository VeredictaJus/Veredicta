import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Archive
} from 'lucide-react';
import { MultiAdminChatService, AdminStatus, AdminConversation } from '@/services/multiAdminChatService';
import { UserSearchService, UserSearchResult } from '@/services/userSearchService';
import { useChat } from '@/contexts/ChatContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface ConversationSummary {
  conversation_id: string;
  title?: string;
  client_name?: string;
  priority?: string;
  status?: AdminConversation['status'];
  type?: string;
  response_count?: number;
  unread_count?: number;
}

interface MultiAdminChatManagerProps {
  onConversationSelect?: (conversationId: string, conversation?: ConversationSummary) => void;
  selectedConversationId?: string | null;
}

export default function MultiAdminChatManager({ 
  onConversationSelect, 
  selectedConversationId 
}: MultiAdminChatManagerProps) {
  const { toast } = useToast();
  const { createConversationWithUser } = useChat();
  const { user } = useNewAuth();
  const [adminStatus, setAdminStatus] = useState<AdminStatus[]>([]);
  const [myConversations, setMyConversations] = useState<AdminConversation[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserSearchResult[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isMyConversationsExpanded, setIsMyConversationsExpanded] = useState(true);
  const [isClosedConversationsExpanded, setIsClosedConversationsExpanded] = useState(true);
  const [isAdminsExpanded, setIsAdminsExpanded] = useState(true);
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  const [stats, setStats] = useState({
    total_conversations: 0,
    open_conversations: 0,
    assigned_conversations: 0,
    in_progress_conversations: 0,
    resolved_conversations: 0,
    online_admins: 0,
    total_admins: 0
  });
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdatingPresence, setIsUpdatingPresence] = useState(false);

  const emitConversationSelection = (conversationId: string, conversation?: ConversationSummary) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId, conversation);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    if (user?.uid) {
      loadActiveUsers();
    }
    updatePresence(true);
    
    // Atualizar presença a cada 30 segundos
    const interval = setInterval(() => {
      updatePresence(isOnline);
    }, 30000);

    return () => {
      clearInterval(interval);
      updatePresence(false);
    };
  }, [user?.uid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminStatusData, myConversationsData, statsData] = await Promise.all([
        MultiAdminChatService.getAdminStatus(),
        MultiAdminChatService.getAdminConversations(),
        MultiAdminChatService.getChatStats()
      ]);

      setAdminStatus(adminStatusData || []);
      setMyConversations(Array.isArray(myConversationsData) ? myConversationsData : []);
      setStats(statsData || {
        total_conversations: 0,
        open_conversations: 0,
        assigned_conversations: 0,
        in_progress_conversations: 0,
        resolved_conversations: 0,
        online_admins: 0,
        total_admins: 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do chat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Carregar usuários ativos da plataforma
  const loadActiveUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await UserSearchService.getAllUsers(user?.uid);
      // Filtrar apenas clientes e redatores (não admins)
      const filteredUsers = users.filter(u => u.role === 'client' || u.role === 'writer');
      setActiveUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários ativos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários ativos',
        variant: 'destructive'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // ✅ NOVO: Iniciar conversa com usuário ativo
  const handleStartConversationWithUser = async (targetUser: UserSearchResult) => {
    try {
      if (!user?.uid) {
        console.error('❌ Usuário não autenticado');
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive'
        });
        return;
      }

      // Verificar se já existe conversa
      const existingConversationId = await UserSearchService.checkExistingConversation(
        user.uid,
        targetUser.firebase_uid
      );

      let conversationId: string;

      if (existingConversationId) {
        // Se já existe, abrir a conversa existente IMEDIATAMENTE
        conversationId = existingConversationId;
        
        // Abrir a conversa imediatamente (sem esperar recarregar dados)
        emitConversationSelection(conversationId, {
          conversation_id: conversationId,
          title: `Conversa com ${targetUser.full_name || targetUser.email}`,
          client_name: targetUser.full_name || targetUser.email,
          priority: 'normal',
          status: 'active',
          type: 'support',
        });
        
        // Recarregar dados em background (sem bloquear a abertura)
        loadData().catch(err => console.error('Erro ao recarregar dados:', err));
        
        toast({
          title: 'Sucesso',
          description: 'Conversa existente aberta'
        });
      } else {
        // Verificar novamente antes de criar (fallback - pode ter sido criada entre as verificações)
        const doubleCheckId = await UserSearchService.checkExistingConversation(
          user.uid,
          targetUser.firebase_uid
        );
        
        if (doubleCheckId) {
          conversationId = doubleCheckId;
          
          // Abrir a conversa existente
          emitConversationSelection(conversationId, {
            conversation_id: conversationId,
            title: `Conversa com ${targetUser.full_name || targetUser.email}`,
            client_name: targetUser.full_name || targetUser.email,
            priority: 'normal',
            status: 'active',
            type: 'support',
          });
          
          loadData().catch(err => console.error('Erro ao recarregar dados:', err));
          
          toast({
            title: 'Sucesso',
            description: 'Conversa existente aberta'
          });
        } else {
          // Criar nova conversa (a função createConversationWithUser também verifica antes de criar)
          const title = `Conversa com ${targetUser.full_name || targetUser.email}`;
          conversationId = await createConversationWithUser(
            targetUser.firebase_uid,
            title,
            `Olá ${targetUser.full_name || 'usuário'}! Como posso ajudar?`
          );
          
          if (!conversationId) {
            throw new Error('Falha ao criar conversa: ID não retornado');
          }
          
          // Abrir a conversa IMEDIATAMENTE após criar
          emitConversationSelection(conversationId, {
            conversation_id: conversationId,
            title: `Conversa com ${targetUser.full_name || targetUser.email}`,
            client_name: targetUser.full_name || targetUser.email,
            priority: 'normal',
            status: 'active',
            type: 'support',
          });
          
          // Recarregar dados em background (sem bloquear a abertura)
          loadData().catch(err => console.error('Erro ao recarregar dados:', err));
          
          toast({
            title: 'Sucesso',
            description: 'Conversa criada com sucesso'
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar conversa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: `Erro ao iniciar conversa: ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  const updatePresence = async (online: boolean) => {
    setIsUpdatingPresence(true);
    try {
      const success = await MultiAdminChatService.updateAdminPresence(online, online ? 'available' : 'offline');
      if (success) {
        setIsOnline(online);
        toast({
          title: 'Sucesso',
          description: `Status atualizado para ${online ? 'Online' : 'Offline'}`,
        });
        // Recarregar dados para atualizar estatísticas
        await loadData();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar presença',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingPresence(false);
    }
  };

  const handleToggleOnline = () => {
    updatePresence(!isOnline);
  };


  const handleReleaseConversation = async (conversationId: string) => {
    try {
      const success = await MultiAdminChatService.releaseConversation(conversationId);
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Conversa liberada com sucesso'
        });
        await loadData();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao liberar conversa',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao liberar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao liberar conversa',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (conversationId: string, status: 'in_progress' | 'resolved' | 'closed') => {
    try {
      const success = await MultiAdminChatService.updateConversationStatus(conversationId, status);
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Status atualizado com sucesso'
        });
        await loadData();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive'
      });
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      // Primeiro, enviar mensagem automática informando que a conversa foi encerrada
      try {
        const { ChatService } = await import('@/services/chatService');
        await ChatService.sendMessage(
          conversationId,
          'Esta conversa foi encerrada pelo administrador. Se precisar de mais ajuda, abra uma nova conversa.',
          'system'
        );
      } catch (messageError) {
        console.error('Erro ao enviar mensagem automática:', messageError);
        // Não falhar o encerramento se a mensagem falhar
      }

      // Depois, atualizar o status para 'closed'
      const success = await MultiAdminChatService.updateConversationStatus(conversationId, 'closed');
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Conversa encerrada com sucesso'
        });
        await loadData();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao encerrar conversa',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao encerrar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao encerrar conversa',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-gray-500';
      case 'assigned': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-400';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberta';
      case 'assigned': return 'Atribuída';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvida';
      case 'closed': return 'Fechada';
      case 'active': return 'Ativo';
      default: return status;
    }
  };

  const getAdminStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAdminStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  // URL fixa para avatar do admin/suporte
  const getAdminAvatarUrl = () => {
    // Usar logo da Veredicta como avatar fixo para admins
    return '/veredicta-logo.png';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total_conversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Abertas</p>
                <p className="text-2xl font-bold">{stats.open_conversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.in_progress_conversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Admins Online</p>
                <p className="text-2xl font-bold">{stats.online_admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Admins - Colapsável */}
      <Collapsible open={isAdminsExpanded} onOpenChange={setIsAdminsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Status dos Admins</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${isAdminsExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-3">
                {adminStatus.map((admin) => (
                  <div key={admin.admin_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getAdminAvatarUrl()} alt={admin.admin_name} />
                        <AvatarFallback>
                          {admin.admin_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admin.admin_name}</p>
                        <p className="text-sm text-gray-500">{admin.admin_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getAdminStatusColor(admin.status)} text-white`}
                      >
                        {getAdminStatusLabel(admin.status)}
                      </Badge>
                      <Badge variant="outline">
                        {admin.active_conversations_count} conversas
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


      {/* ✅ NOVO: Usuários Ativos - Colapsável */}
      <Collapsible open={isUsersExpanded} onOpenChange={setIsUsersExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Usuários Ativos</span>
                <Badge variant="secondary">{activeUsers.length}</Badge>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${isUsersExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {activeUsers.map((activeUser) => (
                    <div
                      key={activeUser.firebase_uid}
                      className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={activeUser.avatar_url} alt={activeUser.full_name} />
                          <AvatarFallback>
                            {activeUser.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{activeUser.full_name || activeUser.email}</p>
                          <p className="text-sm text-gray-500">
                            {activeUser.email} • {activeUser.role === 'client' ? 'Cliente' : 'Redator'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartConversationWithUser(activeUser)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Iniciar Conversa
                      </Button>
                    </div>
                  ))}
                  {activeUsers.length === 0 && !loadingUsers && (
                    <p className="text-center text-gray-500 py-4">Nenhum usuário ativo encontrado</p>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Minhas Conversas - Colapsável */}
      <Collapsible open={isMyConversationsExpanded} onOpenChange={setIsMyConversationsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Minhas Conversas</span>
                <Badge variant="secondary">{myConversations.filter(c => c.status !== 'closed').length}</Badge>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${isMyConversationsExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-3">
                {myConversations
                  .filter(conversation => conversation.status !== 'closed')
                  .map((conversation) => {
                    const isSelected = selectedConversationId === conversation.conversation_id;
                    return (
                      <div
                        key={conversation.conversation_id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isSelected ? 'border-orange-500 bg-orange-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(conversation.status)}`} />
                          <div>
                            <p className="font-medium">{conversation.title}</p>
                            <p className="text-sm text-gray-500">
                              {conversation.client_name} • {conversation.response_count} respostas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{getStatusLabel(conversation.status)}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              emitConversationSelection(conversation.conversation_id, {
                                conversation_id: conversation.conversation_id,
                                title: conversation.title,
                                client_name: conversation.client_name,
                                priority: conversation.priority,
                                status: conversation.status,
                                type: conversation.type,
                                response_count: conversation.response_count,
                                unread_count: conversation.unread_count,
                              });
                            }}
                          >
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReleaseConversation(conversation.conversation_id)}
                          >
                            Liberar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloseConversation(conversation.conversation_id)}
                            disabled={conversation.status === 'closed'}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            Encerrar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                {myConversations.filter(c => c.status !== 'closed').length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhuma conversa ativa</p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ✅ NOVO: Conversas Encerradas - Colapsável */}
      <Collapsible open={isClosedConversationsExpanded} onOpenChange={setIsClosedConversationsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <span>Conversas Encerradas</span>
                <Badge variant="secondary">{myConversations.filter(c => c.status === 'closed').length}</Badge>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${isClosedConversationsExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {myConversations
                  .filter(conversation => conversation.status === 'closed')
                  .map((conversation) => {
                    const isSelected = selectedConversationId === conversation.conversation_id;
                    return (
                      <div
                        key={conversation.conversation_id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isSelected ? 'border-orange-500 bg-orange-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(conversation.status)}`} />
                          <div>
                            <p className="font-medium">{conversation.title}</p>
                            <p className="text-sm text-gray-500">
                              {conversation.client_name} • {conversation.response_count} respostas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{getStatusLabel(conversation.status)}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              emitConversationSelection(conversation.conversation_id, {
                                conversation_id: conversation.conversation_id,
                                title: conversation.title,
                                client_name: conversation.client_name,
                                priority: conversation.priority,
                                status: conversation.status,
                                type: conversation.type,
                                response_count: conversation.response_count,
                                unread_count: conversation.unread_count,
                              });
                            }}
                          >
                            Abrir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                {myConversations.filter(c => c.status === 'closed').length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhuma conversa encerrada</p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Controles - Colapsável */}
      <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center space-x-2">
                <span>Controles</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${isControlsExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  variant={isOnline ? "default" : "outline"}
                  onClick={handleToggleOnline}
                  disabled={isUpdatingPresence}
                >
                  {isOnline ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {isUpdatingPresence ? 'Atualizando...' : (isOnline ? 'Online' : 'Offline')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadData}
                  disabled={loading}
                >
                  <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
