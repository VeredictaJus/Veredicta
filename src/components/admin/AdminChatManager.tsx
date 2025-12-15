import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { MessageSquare, Clock, CheckCircle, User, FileText, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationItem {
  id: string;
  petition_id: string | null;
  client_id: string;
  writer_id: string | null;
  status: 'pending' | 'active' | 'resolved';
  assigned_admin_id: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  client_name: string;
  writer_name: string | null;
  petition_title: string | null;
}

interface AdminChatManagerProps {
  onConversationSelect: (conversationId: string, conversation: ConversationItem) => void;
}

export default function AdminChatManager({ onConversationSelect }: AdminChatManagerProps) {
  const { user } = useNewAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('pending');

  useEffect(() => {
    loadConversations();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      // Buscar conversas da tabela conversations (agora com as novas colunas!)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          status,
          created_at,
          updated_at,
          last_message_at,
          metadata,
          assigned_admin_id,
          assigned_at
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Mapear para o formato esperado
      const mapped: ConversationItem[] = await Promise.all((data || []).map(async (conv: any) => {
        // Buscar participantes
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id, role')
          .eq('conversation_id', conv.id);

        // Buscar última mensagem
        const { data: messages } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Buscar mensagens não lidas (status = 'sent', não 'read')
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('status', 'sent');

        const clientParticipant = participants?.find((p: any) => p.role === 'client');
        const writerParticipant = participants?.find((p: any) => p.role === 'writer');

        // Buscar nomes dos participantes
        let clientName = 'Cliente';
        let writerName: string | null = null;

        if (clientParticipant) {
          const { data: clientProfile } = await supabase
            .from('profiles_v2')
            .select('full_name, email')
            .eq('firebase_uid', clientParticipant.user_id)
            .single();
          clientName = clientProfile?.full_name || clientProfile?.email || 'Cliente';
        }

        if (writerParticipant) {
          const { data: writerProfile } = await supabase
            .from('profiles_v2')
            .select('full_name, email')
            .eq('firebase_uid', writerParticipant.user_id)
            .single();
          writerName = writerProfile?.full_name || writerProfile?.email || null;
        }

        return {
          id: conv.id,
          petition_id: conv.metadata?.petition_id || (conv.type === 'petition' ? conv.id : null),
          client_id: clientParticipant?.user_id || '',
          writer_id: writerParticipant?.user_id || null,
          status: conv.status === 'archived' ? 'resolved' : (conv.assigned_admin_id ? 'active' : 'pending'),
          assigned_admin_id: conv.assigned_admin_id || null,
          last_message: messages?.[0]?.content || null,
          last_message_at: conv.last_message_at || messages?.[0]?.created_at || conv.updated_at,
          unread_count: unreadCount || 0,
          created_at: conv.created_at,
          client_name: clientName,
          writer_name: writerName,
          petition_title: conv.metadata?.petition_title || (conv.type === 'petition' ? 'Conversa sobre Petição' : conv.type === 'support' ? 'Suporte' : null),
        };
      }));

      console.log(`✅ ${mapped.length} conversas carregadas`);
      setConversations(mapped);
    } catch (error: any) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async (conversationId: string) => {
    if (!user?.uid) return;

    try {
      // Buscar conversa atual para preservar metadata existente
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('metadata')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar atribuição ao admin
      const { error } = await supabase
        .from('conversations')
        .update({
          assigned_admin_id: user.uid,
          assigned_at: new Date().toISOString(),
          metadata: {
            ...(conversation?.metadata || {}),
            assigned_admin_name: user.email || 'Admin',
          }
        })
        .eq('id', conversationId);

      if (error) throw error;

      console.log('✅ Conversa atribuída ao admin:', user.uid);
      toast.success('Conversa atribuída a você!');
      loadConversations();
    } catch (error: any) {
      console.error('❌ Erro ao atribuir conversa:', error);
      toast.error('Erro ao atribuir conversa');
    }
  };

  const handleResolve = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) throw error;

      toast.success('Conversa resolvida!');
      loadConversations();
    } catch (error: any) {
      console.error('❌ Erro ao resolver conversa:', error);
      toast.error('Erro ao resolver conversa');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.petition_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: conversations.filter(c => c.status === 'pending').length,
    active: conversations.filter(c => c.status === 'active').length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atendimento</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-shrink-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, petição ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pendentes ({stats.pending})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Atendendo ({stats.active})
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Todas
          </Button>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mr-3" />
              <span className="text-muted-foreground">Carregando conversas...</span>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === 'pending' ? 'Nenhuma conversa pendente' : 'Nenhuma conversa encontrada'}
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'pending' 
                  ? 'Todas as conversas foram atendidas! 🎉' 
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conv) => (
            <Card key={conv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Status Badge */}
                      {conv.status === 'pending' && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      {conv.status === 'active' && (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {conv.assigned_admin_id === user?.uid ? 'Você está atendendo' : 'Em Atendimento'}
                        </Badge>
                      )}
                      {conv.status === 'resolved' && (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolvida
                        </Badge>
                      )}

                      {/* Unread count */}
                      {conv.unread_count > 0 && (
                        <Badge className="bg-orange-500 text-white">
                          {conv.unread_count} nova{conv.unread_count > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{conv.client_name}</span>
                      {conv.writer_name && (
                        <>
                          <span className="text-muted-foreground">↔</span>
                          <span className="text-sm text-muted-foreground">{conv.writer_name}</span>
                        </>
                      )}
                    </div>

                    {conv.petition_title && (
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {conv.petition_title}
                        </span>
                      </div>
                    )}

                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        "{conv.last_message}"
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(conv.last_message_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {conv.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          handleAssignToMe(conv.id);
                          onConversationSelect(conv.id, conv);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Atender
                      </Button>
                    )}

                    {conv.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConversationSelect(conv.id, conv)}
                        >
                          {conv.assigned_admin_id === user?.uid ? 'Continuar' : 'Ver Conversa'}
                        </Button>
                        {conv.assigned_admin_id === user?.uid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(conv.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        )}
                      </>
                    )}

                    {conv.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onConversationSelect(conv.id, conv)}
                      >
                        Ver Histórico
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

