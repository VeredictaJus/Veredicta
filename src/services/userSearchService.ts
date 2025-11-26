// src/services/userSearchService.ts
import { supabase } from '@/lib/supabaseClient';

export interface UserSearchResult {
  id: string;
  firebase_uid: string;
  email: string;
  full_name?: string;
  role: 'client' | 'writer' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Serviço para buscar usuários da plataforma
 * Usado pelo admin para iniciar conversas com qualquer usuário
 */
export class UserSearchService {
  
  /**
   * Função auxiliar para retry com backoff exponencial
   */
  private static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Se não for erro de rede, não tentar novamente
        if (error?.message && !error.message.includes('Failed to fetch') && !error.message.includes('network')) {
          throw error;
        }
        
        // Se não for a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.warn(`⚠️ [UserSearch] Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Buscar todos os usuários da plataforma (exceto o usuário atual)
   */
  static async getAllUsers(currentUserId?: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 [UserSearch] Buscando todos os usuários...');
      
      return await this.retryWithBackoff(async () => {
        let query = supabase
          .from('user_profiles')
          .select('*')
          .eq('is_active', true)
          .order('full_name', { ascending: true });

        // Excluir usuário atual se fornecido
        if (currentUserId) {
          query = query.neq('firebase_uid', currentUserId);
        }

        const { data: users, error } = await query;

        if (error) {
          // Se for erro de rede, lançar para que o retry funcione
          if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
            throw new Error(`Network error: ${error.message}`);
          }
          console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
          return [];
        }

        console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
        return users || [];
      });

    } catch (error: any) {
      console.error('❌ [UserSearch] Erro ao buscar usuários após retries:', {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || error,
        hint: error?.hint || '',
        code: error?.code || ''
      });
      
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  /**
   * Buscar usuários por nome ou email
   */
  static async searchUsers(searchTerm: string, currentUserId?: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 [UserSearch] Buscando usuários com termo:', searchTerm);
      
      if (!searchTerm.trim()) {
        return this.getAllUsers(currentUserId);
      }

      return await this.retryWithBackoff(async () => {
        let query = supabase
          .from('user_profiles')
          .select('*')
          .eq('is_active', true)
          .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .order('full_name', { ascending: true });

        // Excluir usuário atual se fornecido
        if (currentUserId) {
          query = query.neq('firebase_uid', currentUserId);
        }

        const { data: users, error } = await query;

        if (error) {
          // Se for erro de rede, lançar para que o retry funcione
          if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
            throw new Error(`Network error: ${error.message}`);
          }
          console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
          return [];
        }

        console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
        return users || [];
      });

    } catch (error: any) {
      console.error('❌ [UserSearch] Erro ao buscar usuários após retries:', {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || error,
        hint: error?.hint || '',
        code: error?.code || ''
      });
      return [];
    }
  }

  /**
   * Buscar usuários por tipo (role)
   */
  static async getUsersByRole(role: 'client' | 'writer' | 'admin', currentUserId?: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 [UserSearch] Buscando usuários do tipo:', role);
      
      return await this.retryWithBackoff(async () => {
        let query = supabase
          .from('user_profiles')
          .select('*')
          .eq('role', role)
          .eq('is_active', true)
          .order('full_name', { ascending: true });

        // Excluir usuário atual se fornecido
        if (currentUserId) {
          query = query.neq('firebase_uid', currentUserId);
        }

        const { data: users, error } = await query;

        if (error) {
          // Se for erro de rede, lançar para que o retry funcione
          if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
            throw new Error(`Network error: ${error.message}`);
          }
          console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
          return [];
        }

        console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
        return users || [];
      });

    } catch (error: any) {
      console.error('❌ [UserSearch] Erro ao buscar usuários após retries:', {
        message: error?.message || 'Erro desconhecido',
        details: error?.details || error,
        hint: error?.hint || '',
        code: error?.code || ''
      });
      return [];
    }
  }

  /**
   * Verificar se já existe conversa entre admin e usuário
   */
  static async checkExistingConversation(adminId: string, userId: string): Promise<string | null> {
    try {
      // MÉTODO 1: Buscar via conversation_participants (método original)
      const { data: adminConversations, error: adminError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', adminId);

      if (adminError) {
        console.error('❌ [UserSearch] Erro ao buscar conversas do admin:', adminError);
      }

      if (adminConversations && adminConversations.length > 0) {
        const adminConvIds = adminConversations.map(c => c.conversation_id);

        const { data: userConversations, error: userError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId)
          .in('conversation_id', adminConvIds);

        if (userError) {
          console.error('❌ [UserSearch] Erro ao buscar conversas do usuário:', userError);
        }

        if (userConversations && userConversations.length > 0) {
          const userConvIds = userConversations.map(c => c.conversation_id);
          const commonConversations = adminConvIds.filter(id => userConvIds.includes(id));

          if (commonConversations.length > 0) {
            // Buscar conversas ATIVAS primeiro
            const { data: activeConversation, error: activeError } = await supabase
              .from('conversations')
              .select('id, type, status, updated_at')
              .in('id', commonConversations)
              .eq('status', 'active')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!activeError && activeConversation?.id) {
              return activeConversation.id;
            }

            // Se não encontrou ativa, buscar qualquer conversa não arquivada/fechada
            const { data: anyConversation, error: anyError } = await supabase
              .from('conversations')
              .select('id, type, status, updated_at')
              .in('id', commonConversations)
              .neq('status', 'archived')
              .neq('status', 'closed')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!anyError && anyConversation?.id) {
              return anyConversation.id;
            }
          }
        }
      }

      // MÉTODO 2: Buscar diretamente na tabela conversations usando join
      const { data: directConversations, error: directError } = await supabase
        .from('conversations')
        .select(`
          id, type, status, updated_at,
          conversation_participants!inner(user_id)
        `)
        .eq('conversation_participants.user_id', adminId)
        .neq('status', 'archived')
        .neq('status', 'closed')
        .order('updated_at', { ascending: false });

      if (!directError && directConversations && directConversations.length > 0) {
        // Filtrar conversas onde o userId também é participante
        for (const conv of directConversations) {
          const participants = (conv as any).conversation_participants;
          if (Array.isArray(participants)) {
            const participantIds = participants.map((p: any) => p.user_id);
            if (participantIds.includes(adminId) && participantIds.includes(userId)) {
              return conv.id;
            }
          }
        }
      }

      return null;

    } catch (error) {
      console.error('❌ [UserSearch] Erro ao verificar conversa existente:', error);
      return null;
    }
  }

  /**
   * Obter informações de um usuário específico
   */
  static async getUserById(userId: string): Promise<UserSearchResult | null> {
    try {
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', userId)
        .single();

      if (error) {
        console.error('❌ [UserSearch] Erro ao buscar usuário:', error);
        return null;
      }

      return user;

    } catch (error) {
      console.error('❌ [UserSearch] Erro ao buscar usuário:', error);
      return null;
    }
  }
}

























