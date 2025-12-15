import { supabase } from '@/lib/supabase';

export interface ParticipantInfo {
  user_id: string;
  role: 'client' | 'writer' | 'admin' | 'support';
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export class ParticipantService {
  /**
   * Obter informações dos participantes de uma conversa
   */
  static async getConversationParticipants(conversationId: string): Promise<ParticipantInfo[]> {
    try {
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          role,
          user_profiles!inner(
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Erro ao buscar participantes:', error);
        return [];
      }

      return participants?.map(p => ({
        user_id: p.user_id,
        role: p.role,
        full_name: p.user_profiles?.full_name,
        email: p.user_profiles?.email,
        avatar_url: p.user_profiles?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  }

  /**
   * Obter nome de exibição para uma conversa
   */
  static async getConversationDisplayName(
    conversationId: string, 
    conversationType: string, 
    currentUserId: string
  ): Promise<string> {
    try {
      // Se for conversa de suporte, retornar nome fixo
      if (conversationType === 'support') {
        return 'Suporte Veredicta';
      }

      // Para outras conversas, buscar o outro participante
      const participants = await this.getConversationParticipants(conversationId);
      
      // Encontrar o participante que não é o usuário atual
      const otherParticipant = participants.find(p => p.user_id !== currentUserId);
      
      if (otherParticipant) {
        // Retornar o nome do outro participante
        return otherParticipant.full_name || otherParticipant.email || 'Usuário';
      }

      // Fallback: retornar tipo da conversa
      return conversationType === 'general' ? 'Conversa Geral' : 'Conversa';
    } catch (error) {
      console.error('Erro ao obter nome de exibição:', error);
      return conversationType === 'support' ? 'Suporte Veredicta' : 'Conversa';
    }
  }

  /**
   * Obter informações de um participante específico
   */
  static async getParticipantInfo(userId: string): Promise<ParticipantInfo | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('full_name, email, avatar_url')
        .eq('firebase_uid', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar informações do participante:', error);
        return null;
      }

      return {
        user_id: userId,
        role: 'client', // Role seria determinado pelo contexto
        full_name: profile?.full_name,
        email: profile?.email,
        avatar_url: profile?.avatar_url
      };
    } catch (error) {
      console.error('Erro ao buscar informações do participante:', error);
      return null;
    }
  }

  /**
   * Obter avatar de um participante
   */
  static getParticipantAvatar(participant: ParticipantInfo): string | null {
    return participant.avatar_url || null;
  }

  /**
   * Obter iniciais do nome do participante
   */
  static getParticipantInitials(participant: ParticipantInfo): string {
    if (participant.full_name) {
      const names = participant.full_name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (participant.email) {
      return participant.email[0].toUpperCase();
    }
    
    return 'U';
  }

  /**
   * Verificar se um usuário é o suporte
   */
  static isSupportUser(userId: string): boolean {
    return userId === 'support-admin';
  }

  /**
   * Obter nome de exibição do suporte
   */
  static getSupportDisplayName(): string {
    return 'Suporte Veredicta';
  }
}
