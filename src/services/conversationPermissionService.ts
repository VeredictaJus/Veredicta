import { supabase } from '@/lib/supabase';

export interface ConversationPermission {
  canCommunicate: boolean;
  reason?: string;
  conversationType?: 'support' | 'petition' | 'general';
}

export class ConversationPermissionService {
  /**
   * Verificar se um usuário pode iniciar conversa com outro
   */
  static async canUserCommunicateWith(
    fromUserId: string,
    toUserId: string,
    fromUserRole: 'client' | 'writer' | 'admin' | 'support'
  ): Promise<ConversationPermission> {
    try {
      console.log('🔍 Verificando permissão de comunicação:', {
        fromUserId,
        toUserId,
        fromUserRole
      });

      // 🚀 REGRA 1: Suporte/Admin pode conversar com qualquer usuário
      if (fromUserRole === 'support' || fromUserRole === 'admin') {
        return {
          canCommunicate: true,
          reason: 'Suporte/Admin pode conversar com qualquer usuário',
          conversationType: 'support'
        };
      }

      // 🚀 REGRA 2: Qualquer usuário pode abrir chamado com suporte/admin
      const { data: supportUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('firebase_uid', toUserId)
        .in('role', ['support', 'admin'])
        .maybeSingle();

      if (supportUser) {
        return {
          canCommunicate: true,
          reason: 'Qualquer usuário pode abrir chamado com suporte/admin',
          conversationType: 'support'
        };
      }

      // 🚀 REGRA 3: Redator pode conversar com cliente/advogado da petição aceita
      if (fromUserRole === 'writer') {
        const canCommunicate = await this.canWriterCommunicateWithClient(fromUserId, toUserId);
        if (canCommunicate.canCommunicate) {
          return {
            canCommunicate: true,
            reason: 'Redator pode conversar com cliente da petição aceita',
            conversationType: 'petition'
          };
        }
      }

      // 🚀 REGRA 4: Cliente/Advogado pode conversar APENAS com redator da petição
      if (fromUserRole === 'client' || fromUserRole === 'lawyer') {
        // Obter perfil do usuário alvo
        const { data: toUserProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', toUserId)
          .maybeSingle();

        if (!toUserProfile) {
          return {
            canCommunicate: false,
            reason: 'Usuário alvo não encontrado'
          };
        }

        // Cliente/Advogado NÃO pode conversar com outro cliente/advogado
        if (toUserProfile.role === 'client' || toUserProfile.role === 'lawyer') {
          return {
            canCommunicate: false,
            reason: 'Cliente/Advogado não pode conversar com outro cliente/advogado'
          };
        }
        
        // Cliente/Advogado pode conversar com redator da petição
        const canCommunicate = await this.canClientCommunicateWithWriter(fromUserId, toUserId);
        if (canCommunicate.canCommunicate) {
          return {
            canCommunicate: true,
            reason: 'Cliente/Advogado pode conversar com redator da petição',
            conversationType: 'petition'
          };
        }
      }

      // ❌ Se chegou até aqui, não pode comunicar
      return {
        canCommunicate: false,
        reason: 'Não há petição ativa entre os usuários'
      };

    } catch (error) {
      console.error('❌ Erro ao verificar permissão de comunicação:', error);
      return {
        canCommunicate: false,
        reason: 'Erro ao verificar permissão'
      };
    }
  }

  /**
   * Verificar se redator pode conversar com cliente/advogado
   */
  private static async canWriterCommunicateWithClient(
    writerId: string,
    clientId: string
  ): Promise<ConversationPermission> {
    try {
      // Buscar petições aceitas onde o redator é responsável e o cliente é o solicitante
      const { data: petitions, error } = await supabase
        .from('petitions')
        .select('id, title, status, writer_id, client_id')
        .eq('writer_id', writerId)
        .eq('client_id', clientId)
        .eq('status', 'accepted')
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar petições:', error);
        return { canCommunicate: false, reason: 'Erro ao buscar petições' };
      }

      if (petitions) {
        return {
          canCommunicate: true,
          reason: 'Petição aceita encontrada'
        };
      }

      return {
        canCommunicate: false,
        reason: 'Nenhuma petição aceita encontrada'
      };

    } catch (error) {
      console.error('❌ Erro ao verificar permissão redator-cliente:', error);
      return { canCommunicate: false, reason: 'Erro na verificação' };
    }
  }

  /**
   * Verificar se cliente/advogado pode conversar com redator
   */
  private static async canClientCommunicateWithWriter(
    clientId: string,
    writerId: string
  ): Promise<ConversationPermission> {
    try {
      // Buscar petições aceitas onde o cliente é solicitante e o redator é responsável
      const { data: petitions, error } = await supabase
        .from('petitions')
        .select('id, title, status, writer_id, client_id')
        .eq('client_id', clientId)
        .eq('writer_id', writerId)
        .eq('status', 'accepted')
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar petições:', error);
        return { canCommunicate: false, reason: 'Erro ao buscar petições' };
      }

      if (petitions) {
        return {
          canCommunicate: true,
          reason: 'Petição aceita encontrada'
        };
      }

      return {
        canCommunicate: false,
        reason: 'Nenhuma petição aceita encontrada'
      };

    } catch (error) {
      console.error('❌ Erro ao verificar permissão cliente-redator:', error);
      return { canCommunicate: false, reason: 'Erro na verificação' };
    }
  }

  /**
   * Obter lista de usuários que o usuário atual pode conversar
   */
  static async getAvailableUsersForCommunication(
    currentUserId: string,
    currentUserRole: 'client' | 'writer' | 'admin' | 'support'
  ): Promise<Array<{
    userId: string;
    userName: string;
    userRole: string;
    conversationType: 'support' | 'petition' | 'general';
    reason: string;
  }>> {
    try {
      console.log('🔍 Buscando usuários disponíveis para comunicação:', {
        currentUserId,
        currentUserRole
      });

      const availableUsers = [];

      // 🚀 REGRA 1: Suporte pode conversar com todos
      if (currentUserRole === 'support') {
        const { data: allUsers, error } = await supabase
          .from('profiles')
          .select('firebase_uid, full_name, role')
          .neq('firebase_uid', currentUserId);

        if (!error && allUsers) {
          allUsers.forEach(user => {
            availableUsers.push({
              userId: user.firebase_uid,
              userName: user.full_name || 'Usuário',
              userRole: user.role,
              conversationType: 'support' as const,
              reason: 'Suporte pode conversar com qualquer usuário'
            });
          });
        }
      }

      // 🚀 REGRA 2: Qualquer usuário pode conversar com suporte
      if (currentUserRole !== 'support') {
        const { data: supportUsers, error } = await supabase
          .from('profiles')
          .select('firebase_uid, full_name, role')
          .eq('role', 'support');

        if (!error && supportUsers) {
          supportUsers.forEach(user => {
            availableUsers.push({
              userId: user.firebase_uid,
              userName: user.full_name || 'Suporte',
              userRole: user.role,
              conversationType: 'support' as const,
              reason: 'Chamado com suporte'
            });
          });
        }
      }

      // 🚀 REGRA 3: Redator pode conversar com clientes das petições aceitas
      if (currentUserRole === 'writer') {
        const { data: petitions, error } = await supabase
          .from('petitions')
          .select('id, title, status, writer_id, client_id, profiles!petitions_client_id_fkey(firebase_uid, full_name, role)')
          .eq('writer_id', currentUserId)
          .eq('status', 'accepted');

        if (!error && petitions) {
          petitions.forEach(petition => {
            if (petition.profiles) {
              availableUsers.push({
                userId: petition.profiles.firebase_uid,
                userName: petition.profiles.full_name || 'Cliente',
                userRole: petition.profiles.role,
                conversationType: 'petition' as const,
                reason: `Petição: ${petition.title}`
              });
            }
          });
        }
      }

      // 🚀 REGRA 4: Cliente pode conversar com redator da petição aceita
      if (currentUserRole === 'client') {
        const { data: petitions, error } = await supabase
          .from('petitions')
          .select('id, title, status, writer_id, client_id, profiles!petitions_writer_id_fkey(firebase_uid, full_name, role)')
          .eq('client_id', currentUserId)
          .eq('status', 'accepted');

        if (!error && petitions) {
          petitions.forEach(petition => {
            if (petition.profiles) {
              availableUsers.push({
                userId: petition.profiles.firebase_uid,
                userName: petition.profiles.full_name || 'Redator',
                userRole: petition.profiles.role,
                conversationType: 'petition' as const,
                reason: `Petição: ${petition.title}`
              });
            }
          });
        }
      }

      console.log('✅ Usuários disponíveis encontrados:', availableUsers.length);
      return availableUsers;

    } catch (error) {
      console.error('❌ Erro ao buscar usuários disponíveis:', error);
      return [];
    }
  }
}
