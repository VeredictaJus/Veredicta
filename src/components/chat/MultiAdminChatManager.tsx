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
  EyeOff
} from 'lucide-react';
import { MultiAdminChatService, AdminStatus, AvailableConversation, AdminConversation } from '@/services/multiAdminChatService';
import { useToast } from '@/hooks/use-toast';

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
  const [adminStatus, setAdminStatus] = useState<AdminStatus[]>([]);
  const [availableConversations, setAvailableConversations] = useState<AvailableConversation[]>([]);
  const [myConversations, setMyConversations] = useState<AdminConversation[]>([]);
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
    updatePresence(true);
    
    // Atualizar presença a cada 30 segundos
    const interval = setInterval(() => {
      updatePresence(isOnline);
    }, 30000);

    return () => {
      clearInterval(interval);
      updatePresence(false);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminStatusData, availableData, myConversationsData, statsData] = await Promise.all([
        MultiAdminChatService.getAdminStatus(),
        MultiAdminChatService.getAvailableConversations(),
        MultiAdminChatService.getAdminConversations(),
        MultiAdminChatService.getChatStats()
      ]);

      setAdminStatus(adminStatusData || []);
      setAvailableConversations(Array.isArray(availableData) ? availableData : []);
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

  const handleAssignConversation = async (conversation: AvailableConversation) => {
    try {
      const success = await MultiAdminChatService.assignConversation(conversation.conversation_id);
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Conversa atribuída com sucesso'
        });
        await loadData();
        emitConversationSelection(conversation.conversation_id, {
          conversation_id: conversation.conversation_id,
          title: conversation.title,
          client_name: conversation.client_name,
          priority: conversation.priority,
          status: 'assigned',
          type: conversation.type,
          unread_count: conversation.unread_count,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atribuir conversa',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atribuir conversa',
        variant: 'destructive'
      });
    }
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
        console.log('✅ Mensagem automática de encerramento enviada');
      } catch (messageError) {
        console.warn('⚠️ Erro ao enviar mensagem automática:', messageError);
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

      {/* Status dos Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Status dos Admins</span>
          </CardTitle>
        </CardHeader>
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
      </Card>

      {/* Conversas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversas Disponíveis</span>
            <Badge variant="secondary">{availableConversations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableConversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(conversation.priority)}`} />
                  <div>
                    <p className="font-medium">{conversation.title}</p>
                    <p className="text-sm text-gray-500">
                      {conversation.client_name} • {conversation.unread_count} não lidas
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{conversation.priority}</Badge>
                  <Button
                    size="sm"
                    onClick={() => handleAssignConversation(conversation)}
                  >
                    Atribuir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minhas Conversas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Minhas Conversas</span>
            <Badge variant="secondary">{myConversations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myConversations.map((conversation) => {
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
                      onClick={() =>
                        emitConversationSelection(conversation.conversation_id, {
                          conversation_id: conversation.conversation_id,
                          title: conversation.title,
                          client_name: conversation.client_name,
                          priority: conversation.priority,
                          status: conversation.status,
                          type: conversation.type,
                          response_count: conversation.response_count,
                          unread_count: conversation.unread_count,
                        })
                      }
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
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles</CardTitle>
        </CardHeader>
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
      </Card>
    </div>
  );
}
