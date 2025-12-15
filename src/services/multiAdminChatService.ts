import { supabase } from '@/lib/supabase';

export interface AdminStatus {
  admin_id: string;
  admin_name: string;
  admin_email: string;
  is_online: boolean;
  status: 'available' | 'busy' | 'away' | 'offline';
  current_conversation_id?: string;
  last_seen: string;
  active_conversations_count: number;
}

export interface AvailableConversation {
  conversation_id: string;
  title: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  last_message_at: string;
  unread_count: number;
  client_name: string;
  client_email: string;
}

export interface AdminConversation {
  conversation_id: string;
  title: string;
  type: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_at: string;
  last_message_at: string;
  unread_count: number;
  client_name: string;
  client_email: string;
  response_count: number;
}

export class MultiAdminChatService {
  /**
   * Obter usuário autenticado atual - usando Firebase Auth
   */
  private static async getAuthUser() {
    // ✅ CORREÇÃO: Usar auth exportado do firebase.ts para evitar múltiplas inicializações
    const { auth } = await import('@/lib/firebase');
    
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    return auth.currentUser;
  }

  /**
   * Atualizar presença do admin
   */
  static async updateAdminPresence(
    isOnline: boolean,
    status: 'available' | 'busy' | 'away' | 'offline' = 'available'
  ): Promise<boolean> {
    try {
      const user = await this.getAuthUser();

      const { data, error } = await supabase.rpc('update_admin_presence', {
        admin_id_input: user.uid,
        is_online_input: isOnline,
        status_input: status
      });

      if (error) {
        console.error('Erro ao atualizar presença:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      return false;
    }
  }

  /**
   * Obter status de todos os admins
   */
  static async getAdminStatus(): Promise<AdminStatus[]> {
    try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        console.error('❌ Supabase client não está disponível');
        return [];
      }

      const { data, error } = await supabase.rpc('get_admin_status');

      if (error) {
        console.error('Erro ao buscar status dos admins:', error);
        // Se for erro de função não encontrada, retornar array vazio
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.warn('⚠️ Função get_admin_status não encontrada no banco de dados');
        }
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar status dos admins:', error);
      // Se for NetworkError, pode ser problema de conectividade
      if (error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
        console.error('❌ Erro de rede ao buscar status dos admins. Verifique a conexão com o Supabase.');
      }
      return [];
    }
  }

  /**
   * Obter conversas disponíveis para atribuição
   */
  static async getAvailableConversations(): Promise<AvailableConversation[]> {
    try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        console.error('❌ Supabase client não está disponível');
        return [];
      }

      const { data, error } = await supabase.rpc('get_available_conversations');

      if (error) {
        console.error('Erro ao buscar conversas disponíveis:', error);
        // Se for erro de função não encontrada, retornar array vazio
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.warn('⚠️ Função get_available_conversations não encontrada no banco de dados');
        }
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar conversas disponíveis:', error);
      // Se for NetworkError, pode ser problema de conectividade
      if (error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
        console.error('❌ Erro de rede ao buscar conversas disponíveis. Verifique a conexão com o Supabase.');
      }
      return [];
    }
  }

  /**
   * Obter conversas atribuídas ao admin atual
   */
  static async getAdminConversations(): Promise<AdminConversation[]> {
    try {
      const user = await this.getAuthUser();

      // Verificar se o Supabase está configurado
      if (!supabase) {
        console.error('❌ Supabase client não está disponível');
        return [];
      }

      const { data, error } = await supabase.rpc('get_admin_conversations', {
        admin_id_input: user.uid
      });

      if (error) {
        console.error('Erro ao buscar conversas do admin:', error);
        // Se for erro de função não encontrada, retornar array vazio
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.warn('⚠️ Função get_admin_conversations não encontrada no banco de dados');
        }
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar conversas do admin:', error);
      // Se for NetworkError, pode ser problema de conectividade
      if (error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
        console.error('❌ Erro de rede ao buscar conversas do admin. Verifique a conexão com o Supabase.');
      }
      return [];
    }
  }

  /**
   * Atribuir conversa ao admin atual
   */
  static async assignConversation(conversationId: string): Promise<boolean> {
    try {
      const user = await this.getAuthUser();

      const { data, error } = await supabase.rpc('assign_conversation_to_admin', {
        conversation_id_input: conversationId,
        admin_id_input: user.uid
      });

      if (error) {
        console.error('Erro ao atribuir conversa:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error);
      return false;
    }
  }

  /**
   * Liberar conversa atribuída
   */
  static async releaseConversation(conversationId: string): Promise<boolean> {
    try {
      const user = await this.getAuthUser();

      const { data, error } = await supabase.rpc('release_conversation', {
        conversation_id_input: conversationId,
        admin_id_input: user.uid
      });

      if (error) {
        console.error('Erro ao liberar conversa:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Erro ao liberar conversa:', error);
      return false;
    }
  }

  /**
   * Atualizar status da conversa
   */
  static async updateConversationStatus(
    conversationId: string,
    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed',
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  ): Promise<boolean> {
    try {
      const user = await this.getAuthUser();

      const updateData: any = {
        status,
        last_admin_activity: new Date().toISOString()
      };

      if (priority) {
        updateData.priority = priority;
      }

      if (status === 'in_progress') {
        updateData.assigned_to = user.uid;
        updateData.assigned_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) {
        console.error('Erro ao atualizar status da conversa:', error);
        return false;
      }

      // Registrar atividade
      await supabase
        .from('conversation_admin_activity')
        .insert({
          conversation_id: conversationId,
          admin_id: user.uid,
          activity_type: status === 'in_progress' ? 'started' : status,
          activity_data: { status, priority }
        });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
      return false;
    }
  }

  /**
   * Incrementar contador de respostas
   * NOTA: O trigger no banco já faz isso automaticamente, mas mantemos esta função como fallback
   */
  static async incrementResponseCount(conversationId: string): Promise<boolean> {
    try {
      // Usar RPC para incrementar (mais seguro que raw SQL)
      const { data, error } = await supabase.rpc('increment_conversation_response_count', {
        conversation_id_input: conversationId
      });

      if (error) {
        // Se RPC não existir, tentar update direto
        const { data: convData } = await supabase
          .from('conversations')
          .select('response_count')
          .eq('id', conversationId)
          .single();

        const currentCount = convData?.response_count || 0;
        
        const { error: updateError } = await supabase
          .from('conversations')
          .update({
            response_count: currentCount + 1,
            last_admin_activity: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Erro ao incrementar contador de respostas:', updateError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao incrementar contador de respostas:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas do chat
   */
  static async getChatStats(): Promise<{
    total_conversations: number;
    open_conversations: number;
    assigned_conversations: number;
    in_progress_conversations: number;
    resolved_conversations: number;
    online_admins: number;
    total_admins: number;
  }> {
    try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        console.error('❌ Supabase client não está disponível');
        return {
          total_conversations: 0,
          open_conversations: 0,
          assigned_conversations: 0,
          in_progress_conversations: 0,
          resolved_conversations: 0,
          online_admins: 0,
          total_admins: 0
        };
      }

      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('status, assigned_to')
        .eq('type', 'support');

      if (convError) {
        console.error('Erro ao buscar estatísticas das conversas:', convError);
        // Se for NetworkError, pode ser problema de conectividade
        if (convError.message?.includes('NetworkError') || convError.name === 'TypeError') {
          console.error('❌ Erro de rede ao buscar estatísticas. Verifique a conexão com o Supabase.');
        }
        return {
          total_conversations: 0,
          open_conversations: 0,
          assigned_conversations: 0,
          in_progress_conversations: 0,
          resolved_conversations: 0,
          online_admins: 0,
          total_admins: 0
        };
      }

      const { data: admins, error: adminError } = await supabase
        .from('admin_presence')
        .select('is_online');

      if (adminError) {
        console.error('Erro ao buscar estatísticas dos admins:', adminError);
        // Se for NetworkError, pode ser problema de conectividade
        if (adminError.message?.includes('NetworkError') || adminError.name === 'TypeError') {
          console.error('❌ Erro de rede ao buscar estatísticas dos admins. Verifique a conexão com o Supabase.');
        }
      }

      // Função auxiliar para verificar se assigned_to está vazio/null
      const isAssigned = (assignedTo: any): boolean => {
        if (!assignedTo) return false;
        if (typeof assignedTo === 'string') {
          const trimmed = assignedTo.trim().toLowerCase();
          return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
        }
        return true;
      };

      const stats = {
        total_conversations: conversations?.length || 0,
        // Conversas abertas: status 'open' ou 'active' e não atribuídas
        // São conversas que estão abertas e aguardando atribuição a um admin
        open_conversations:
          conversations?.filter(
            (c: any) => (c.status === 'open' || c.status === 'active') && !isAssigned(c.assigned_to)
          ).length || 0,
        // Conversas atribuídas: status 'assigned' ou 'in_progress' e atribuídas
        assigned_conversations:
          conversations?.filter(
            (c: any) => (c.status === 'assigned' || c.status === 'in_progress') && isAssigned(c.assigned_to)
          ).length || 0,
        // Conversas em andamento: atribuídas (assigned_to não é null) e com status 'assigned', 'in_progress' ou 'active'
        // Isso inclui conversas que foram atribuídas a um admin, mesmo que ainda não estejam em 'in_progress'
        in_progress_conversations: conversations?.filter(
          (c: any) => isAssigned(c.assigned_to) && 
                      (c.status === 'assigned' || c.status === 'in_progress' || c.status === 'active')
        ).length || 0,
        // Conversas resolvidas: status 'resolved'
        resolved_conversations: conversations?.filter((c: any) => c.status === 'resolved').length || 0,
        // Admins online: is_online = true
        online_admins: admins?.filter((a: any) => a.is_online === true).length || 0,
        // Total de admins
        total_admins: admins?.length || 0
      };

      // Log para debug
      const inProgressConversations = conversations?.filter(
        (c: any) => isAssigned(c.assigned_to) && 
                    (c.status === 'assigned' || c.status === 'in_progress' || c.status === 'active')
      ) || [];
      
      console.log('📊 Estatísticas do Chat:', {
        total: stats.total_conversations,
        open: stats.open_conversations,
        assigned: stats.assigned_conversations,
        in_progress: stats.in_progress_conversations,
        resolved: stats.resolved_conversations,
        online_admins: stats.online_admins,
        total_admins: stats.total_admins,
        conversations_sample: conversations?.slice(0, 5).map((c: any) => ({
          status: c.status,
          assigned_to: c.assigned_to,
          is_assigned: isAssigned(c.assigned_to),
          would_be_in_progress: isAssigned(c.assigned_to) && 
                                (c.status === 'assigned' || c.status === 'in_progress' || c.status === 'active')
        })),
        in_progress_details: inProgressConversations.map((c: any) => ({
          status: c.status,
          assigned_to: c.assigned_to
        }))
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_conversations: 0,
        open_conversations: 0,
        assigned_conversations: 0,
        in_progress_conversations: 0,
        resolved_conversations: 0,
        online_admins: 0,
        total_admins: 0
      };
    }
  }
}
