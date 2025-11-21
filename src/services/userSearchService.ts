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
   * Buscar todos os usuários da plataforma (exceto o usuário atual)
   */
  static async getAllUsers(currentUserId?: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 [UserSearch] Buscando todos os usuários...');
      
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
        console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
        return [];
      }

      console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
      return users || [];

    } catch (error) {
      console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
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
        console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
        return [];
      }

      console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
      return users || [];

    } catch (error) {
      console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Buscar usuários por tipo (role)
   */
  static async getUsersByRole(role: 'client' | 'writer' | 'admin', currentUserId?: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 [UserSearch] Buscando usuários do tipo:', role);
      
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
        console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
        return [];
      }

      console.log('✅ [UserSearch] Usuários encontrados:', users?.length || 0);
      return users || [];

    } catch (error) {
      console.error('❌ [UserSearch] Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Verificar se já existe conversa entre admin e usuário
   */
  static async checkExistingConversation(adminId: string, userId: string): Promise<string | null> {
    try {
      console.log('🔍 [UserSearch] Verificando conversa existente entre:', adminId, 'e', userId);
      
      // Buscar conversas onde ambos são participantes
      const { data: adminConversations, error: adminError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', adminId);

      if (adminError) {
        console.error('❌ [UserSearch] Erro ao buscar conversas do admin:', adminError);
        return null;
      }

      const { data: userConversations, error: userError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (userError) {
        console.error('❌ [UserSearch] Erro ao buscar conversas do usuário:', userError);
        return null;
      }

      // Encontrar conversas em comum
      const adminConvIds = adminConversations?.map(c => c.conversation_id) || [];
      const userConvIds = userConversations?.map(c => c.conversation_id) || [];
      const commonConversations = adminConvIds.filter(id => userConvIds.includes(id));

      if (commonConversations.length > 0) {
        // Buscar a conversa mais recente
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .in('id', commonConversations)
          .eq('type', 'support')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (convError) {
          console.log('⚠️ [UserSearch] Nenhuma conversa de suporte encontrada');
          return null;
        }

        console.log('✅ [UserSearch] Conversa existente encontrada:', conversation?.id);
        return conversation?.id || null;
      }

      console.log('⚠️ [UserSearch] Nenhuma conversa existente encontrada');
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

























