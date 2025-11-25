import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChat } from '@/contexts/ChatContext';
import { Conversation } from '@/services/chatService';
import { ParticipantService } from '@/services/participantService';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Search, Plus, MessageCircle, Users, Phone, Video, Trash2, Archive, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '@/styles/chat-fixes.css';
import './ConversationsList.module.css';
import UserSelectionModal from '@/components/chat/UserSelectionModal';
import { UserSearchResult, UserSearchService } from '@/services/userSearchService';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

export default function ConversationsList({ onSelectConversation, onCreateConversation }: ConversationsListProps) {
  const { user } = useNewAuth();
  
  const { conversations, isLoading, getUnreadCount, deleteConversation, archiveConversation, updateConversationStatus, loadConversations, createConversation, selectConversation } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'support' | 'writers' | 'clients' | 'lawyers' | 'archived'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [userSelectionModalOpen, setUserSelectionModalOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Determinar tipo de usuário e filtros disponíveis
  const getUserType = (): 'admin' | 'writer' | 'client' => {
    // Usar o role do usuário do contexto de autenticação
    if (!user?.role) return 'client';
    
    if (user.role === 'admin') return 'admin';
    if (user.role === 'writer') return 'writer';
    
    return 'client';
  };

  const getAvailableFilters = () => {
    const userType = getUserType();
    
    switch (userType) {
      case 'admin':
        return [
          { key: 'all', label: 'Todas' },
          { key: 'writers', label: 'Redatores' },
          { key: 'clients', label: 'Clientes' },
          { key: 'archived', label: 'Arquivadas' }
        ];
      case 'writer':
        return [
          { key: 'all', label: 'Todas' },
          { key: 'support', label: 'Suporte' },
          { key: 'lawyers', label: 'Clientes' },
          { key: 'archived', label: 'Arquivadas' }
        ];
      default: // client
        return [
          { key: 'all', label: 'Todas' },
          { key: 'support', label: 'Suporte' },
          { key: 'writers', label: 'Redatores' },
          { key: 'archived', label: 'Arquivadas' }
        ];
    }
  };

  // Abrir modal de confirmação para excluir conversa
  const handleDeleteClick = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar selecionar a conversa
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  // Confirmar exclusão da conversa
  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    
    try {
      await deleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
      // Manter o modal aberto em caso de erro
    }
  };

  // Cancelar exclusão
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  // Arquivar/Desarquivar conversa
  const handleArchiveConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar selecionar a conversa
    
    // Encontrar a conversa para verificar o status atual
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const isCurrentlyArchived = conversation.status === 'archived';
    
    // 🚫 IMPEDIR desarquivamento de conversas arquivadas pelo sistema (exceto para admins)
    if (isCurrentlyArchived && (conversation as any).metadata?.system_archived === true) {
      const userType = getUserType();
      
      // ✅ APENAS ADMINS podem desarquivar conversas arquivadas automaticamente
      if (userType !== 'admin') {
        alert(`⚠️ Esta conversa foi arquivada automaticamente e não pode ser reaberta.\n\nMotivo: Petição aprovada pelo cliente.\n\nApenas administradores podem reabrir conversas arquivadas automaticamente.`);
        return;
      }
      
      // Continuar com o desarquivamento normalmente para admin
    }
    
    const newStatus = isCurrentlyArchived ? 'active' : 'archived';
    
    try {
      if (isCurrentlyArchived) {
        // Desarquivar: usar updateConversationStatus
        // Primeiro selecionar a conversa, depois atualizar o status
        await onSelectConversation(conversationId);
        await updateConversationStatus('active');
      } else {
        // Arquivar: usar função específica para arquivar
        await archiveConversation(conversationId);
      }
      
      // 🔧 CORREÇÃO: Não recarregar conversas para evitar sobrescrever estado
      
    } catch (error) {
      console.error('Erro ao alterar status da conversa:', error);
      const action = isCurrentlyArchived ? 'desarquivar' : 'arquivar';
      alert(`Erro ao ${action} conversa. Tente novamente.`);
    }
  };

  // Criar conversa com usuário selecionado (APENAS ADMIN)
  const handleUserSelected = async (selectedUser: UserSearchResult) => {
    if (!user) return;
    
    setIsCreatingConversation(true);
    try {
      // Verificar se já existe conversa
      const existingConversationId = await UserSearchService.checkExistingConversation(
        user.uid,
        selectedUser.firebase_uid
      );

      if (existingConversationId) {
        // Conversa já existe, apenas abrir
        await onSelectConversation(existingConversationId);
        await selectConversation(existingConversationId);
        setUserSelectionModalOpen(false);
        return;
      }

      // Criar nova conversa
      const conversationTitle = `Suporte: ${selectedUser.full_name || selectedUser.email}`;
      const participants = [
        { userId: user.uid, role: 'admin' as const },
        { userId: selectedUser.firebase_uid, role: selectedUser.role }
      ];

      const conversationId = await createConversation(
        conversationTitle,
        'support',
        participants
      );

      // Abrir a conversa criada
      await onSelectConversation(conversationId);
      await selectConversation(conversationId);
      
      // Fechar modal
      setUserSelectionModalOpen(false);
      
      // Recarregar lista
      await loadConversations();

    } catch (error) {
      console.error('❌ Erro ao criar conversa com usuário:', error);
      alert('Erro ao criar conversa. Tente novamente.');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const getOtherParticipantName = (conversation: Conversation): string | undefined => {
    const metadata = (conversation as any).metadata || {};
    if (metadata.otherParticipantName || metadata.other_participant_name) {
      return metadata.otherParticipantName || metadata.other_participant_name;
    }
    if (metadata.partnerName || metadata.partner_name) {
      return metadata.partnerName || metadata.partner_name;
    }

    const participants = (conversation as any).conversation_participants as any[] | undefined;
    if (participants && participants.length > 0) {
      const currentUserId = (user as any)?.uid;
      const other = participants.find(p => p.user_id !== currentUserId) || participants[0];
      if (other?.user_name) return other.user_name;
      if (other?.full_name) return other.full_name;
      if (other?.email) return other.email.split('@')[0];
    }

    return undefined;
  };

  // Obter nome de exibição da conversa
  // URL fixa para avatar do admin/suporte
  const getAdminAvatarUrl = () => {
    return '/veredicta-logo.png';
  };

  // Obter avatar da conversa
  const getConversationAvatar = (conversation: Conversation): string | undefined => {
    const userRole = user?.role || 'client';
    
    // Se é conversa de suporte e o usuário é cliente/redator, mostrar logo fixo do admin
    if (conversation.type === 'support' && userRole !== 'admin') {
      return getAdminAvatarUrl();
    }
    
    // Para outras conversas, usar avatar do metadata ou do participante
    const metadata = (conversation as any).metadata || {};
    return metadata.avatar_url || undefined;
  };

  const getConversationDisplayName = (conversation: Conversation): string => {
    const userRole = user?.role || 'client';
    
    // Para conversas de suporte, a lógica depende de quem está visualizando
    if (conversation.type === 'support') {
      // Se é admin visualizando, mostrar nome do cliente/redator
      if (userRole === 'admin') {
        const otherName = getOtherParticipantName(conversation);
        if (otherName && otherName !== 'Suporte Veredicta') {
          return otherName;
        }
        return 'Cliente'; // Fallback para admin
      } else {
        // Se é cliente/redator visualizando, mostrar "Suporte Veredicta"
        return 'Suporte Veredicta';
      }
    }
    
    // Para outras conversas, buscar nome do outro participante
    const otherName = getOtherParticipantName(conversation);
    if (otherName) {
      return otherName;
    }

    return conversation.title;
  };

  // Obter ícone baseado no tipo e nome
  const getConversationDisplayIcon = (conversation: Conversation) => {
    if (conversation.type === 'support') {
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    }
    
    // Para outras conversas, usar ícone baseado no tipo
    return getConversationIcon(conversation.type);
  };

  // Filtrar conversas
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType !== 'all') {
      switch (filterType) {
        case 'support':
          // Mostrar apenas conversas de suporte NÃO arquivadas
          matchesFilter = conversation.type === 'support' && conversation.status !== 'archived';
          break;
        case 'writers':
          // Filtrar conversas relacionadas a redatores/petições NÃO arquivadas
          matchesFilter = (conversation.type === 'petition' || 
                         conversation.title.toLowerCase().includes('redator') ||
                         conversation.title.toLowerCase().includes('petição')) &&
                         conversation.status !== 'archived';
          break;
        case 'clients':
          // Filtrar conversas relacionadas a clientes NÃO arquivadas
          matchesFilter = (conversation.type === 'general' ||
                         conversation.title.toLowerCase().includes('cliente') ||
                         conversation.title.toLowerCase().includes('usuário')) &&
                         conversation.status !== 'archived';
          break;
        case 'lawyers':
          // Para redatores: mostrar conversas com clientes (tipo petition)
          matchesFilter = conversation.type === 'petition' && 
                         conversation.status !== 'archived';
          break;
        case 'archived':
          // Mostrar apenas conversas arquivadas
          matchesFilter = conversation.status === 'archived';
          break;
        default:
          matchesFilter = conversation.type === filterType && conversation.status !== 'archived';
      }
    } else {
      // Para "Todas", mostrar TODAS as conversas (incluindo arquivadas)
      matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Obter ícone do tipo de conversa
  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'support':
        return <Phone className="h-4 w-4" />;
      case 'petition':
        return <MessageCircle className="h-4 w-4" />;
      case 'general':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Obter cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Obter cor do badge de prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Traduzir status da conversa
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'closed': 'Fechado',
      'archived': 'Arquivado'
    };
    return statusMap[status] || status;
  };

  // Traduzir tipo da conversa (com display_id para petições)
  const getTypeLabel = (conversation: Conversation) => {
    if (conversation.type === 'petition') {
      const metadata = (conversation as any).metadata || {};
      const convAny = conversation as any;
      
      // Tentar todos os possíveis caminhos para o display_id
      const displayId =
        metadata.petitionDisplayId ??
        metadata.petition_display_id ??
        metadata.display_id ??
        metadata.petitionId ??
        metadata.petition_id ??
        metadata.petition?.id ??
        convAny.petitionDisplayId ??
        convAny.petition_display_id ??
        convAny.petitionId ??
        convAny.petition_id;


      // Sempre mostrar o número, mesmo que seja o petition_id
      if (displayId) {
        return `Petição #${displayId}`;
      }
      
      // Se não tiver nada, mostrar apenas "Petição"
      return 'Petição';
    }

    const typeMap: Record<string, string> = {
      'support': 'Suporte',
      'general': 'Geral',
      'writer': 'Redator',
      'client': 'Cliente',
      'legal': 'Advogado',
      'lawyer': 'Advogado'
    };
    return typeMap[conversation.type] || conversation.type;
  };

  // Traduzir prioridade da conversa
  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Baixa',
      'normal': 'Normal',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || priority;
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    const messages = conversation.messages ?? [];
    const last = messages.at(-1);
    if (last) {
      const content = (last.content || '').trim();
      if (content) return content.length > 80 ? `${content.slice(0, 77)}...` : content;
      if (last.message_type && last.message_type !== 'text') {
        if (last.message_type === 'image') return '🖼️ Imagem';
        if (last.message_type === 'audio') return '🎵 Áudio';
        return '📎 Arquivo anexado';
      }
      if (last.file_url) {
        return '📎 Arquivo anexado';
      }
    }

    const fallback = conversation.last_message_content || '';
    if (fallback.length > 80) {
      return `${fallback.slice(0, 77)}...`;
    }
    return fallback;
  };

  return (
    <Card className="bg-container-primary border-border w-full h-full flex flex-col overflow-hidden conversationContainer">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversas</CardTitle>
          <div className="flex items-center space-x-2">
            {getUnreadCount() > 0 && (
              <Badge variant="destructive" className="text-xs">
                {getUnreadCount()}
              </Badge>
            )}
            {/* Botão "Conversa com Usuário" - APENAS ADMIN */}
            {getUserType() === 'admin' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUserSelectionModalOpen(true)}
                title="Iniciar conversa com usuário"
                disabled={isCreatingConversation}
              >
                <UserPlus className="h-4 w-4 text-orange-600" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onCreateConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="flex space-x-2">
          {getAvailableFilters().map((filter) => (
            <Button
              key={filter.key}
              variant={filterType === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(filter.key as any)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <Separator />

      {/* Conversations List */}
      <CardContent className="bg-container-inner rounded-b-lg flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[400px] overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando conversas...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
              {!searchTerm && (
                <Button variant="outline" size="sm" className="mt-2" onClick={onCreateConversation}>
                  Criar primeira conversa
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1 conversationList">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 relative group overflow-hidden conversationItem"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={getConversationAvatar(conversation)} className="object-cover" />
                      <AvatarFallback className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                          {(conversation as any).metadata?.initials || getConversationDisplayName(conversation).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    
                    <div className="flex-1 min-w-0 overflow-hidden conversationContent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {getConversationDisplayName(conversation)}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs h-5 px-1">
                              {conversation.unread_count}
                            </Badge>
                          )}
                          
                          {/* Botões de ação - aparecem sempre */}
                          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-orange-600"
                              onClick={(e) => handleArchiveConversation(conversation.id, e)}
                              title={conversation.status === 'archived' ? 'Desarquivar conversa' : 'Arquivar conversa'}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                              onClick={(e) => handleDeleteClick(conversation.id, e)}
                              title="Excluir conversa"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {conversation.last_message_at && 
                              formatDistanceToNow(new Date(conversation.last_message_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(conversation.status)} className="text-xs">
                          {getStatusLabel(conversation.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(conversation)}
                        </Badge>
                        {conversation.priority !== 'normal' && (
                          <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
                            {getPriorityLabel(conversation.priority)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                        {conversation.last_message_content || ''}
                      </p>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Excluir Conversa</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita e todas as mensagens serão permanentemente removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conversa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Seleção de Usuário - APENAS ADMIN */}
      <UserSelectionModal
        isOpen={userSelectionModalOpen}
        onClose={() => setUserSelectionModalOpen(false)}
        onSelectUser={handleUserSelected}
        currentUserId={user?.uid}
      />
    </Card>
  );
}
