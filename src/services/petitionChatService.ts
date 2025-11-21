// src/services/petitionChatService.ts
import { supabase } from '@/lib/supabaseClient';
import { ChatService } from '@/services/chatService';

/**
 * Serviço para gerenciar conversas automáticas baseadas no ciclo de vida das petições
 * Este serviço NÃO interfere no sistema de chat existente
 */
export class PetitionChatService {
  
  /**
   * Criar conversa automática quando redator aceita petição
   * Trigger: status muda para 'in_progress'
   */
  static async createConversationOnPetitionAccepted(petitionId: string): Promise<string | null> {
    try {
      console.log('🔄 [PetitionChat] Criando conversa para petição:', petitionId);
      
      // Buscar dados da petição
      const { data: petition, error: petitionError } = await supabase
        .from('petitions')
        .select(`
          id,
          display_id,
          title,
          description,
          client_id,
          assigned_writer_id,
          status
        `)
        .eq('id', petitionId)
        .single();

      if (petitionError || !petition) {
        console.error('❌ [PetitionChat] Erro ao buscar petição:', petitionError);
        return null;
      }

      // Verificar se petição está em progresso
      if (petition.status !== 'in_progress') {
        console.log('⚠️ [PetitionChat] Petição não está em progresso, ignorando');
        return null;
      }

      // Verificar se já existe conversa para esta petição
      const existingConversation = await this.getConversationForPetition(petitionId);
      if (existingConversation) {
        console.log('⚠️ [PetitionChat] Conversa já existe para esta petição');
        return existingConversation.id;
      }

      // Criar conversa entre redator e cliente
      const conversationTitle = `Petição: ${petition.title}`;
      const participants = [
        { userId: petition.client_id, role: 'client' as const },
        { userId: petition.assigned_writer_id, role: 'writer' as const }
      ];
      const metadata = {
        petitionId: petition.id,
        petitionDisplayId: petition.display_id || petition.id,
      };

      const conversationId = await ChatService.createConversation(
        conversationTitle,
        'petition',
        participants,
        metadata
      );

      // Associar conversa com a petição (opcional - para rastreamento)
      await this.associateConversationWithPetition(conversationId, petitionId);

      console.log('✅ [PetitionChat] Conversa criada:', conversationId);
      return conversationId;

    } catch (error) {
      console.error('❌ [PetitionChat] Erro ao criar conversa:', error);
      return null;
    }
  }

  /**
   * Fechar conversa automaticamente quando cliente aprova petição
   * Trigger: status muda para 'completed'
   */
  static async closeConversationOnPetitionCompleted(petitionId: string): Promise<boolean> {
    try {
      console.log('🔄 [PetitionChat] Fechando conversa para petição:', petitionId);
      
      // Buscar conversa associada à petição
      const conversation = await this.getConversationForPetition(petitionId);
      if (!conversation) {
        console.log('⚠️ [PetitionChat] Nenhuma conversa encontrada para esta petição');
        return false;
      }

      // Fechar conversa
      await ChatService.updateConversationStatus(conversation.id, 'closed');
      
      console.log('✅ [PetitionChat] Conversa fechada:', conversation.id);
      return true;

    } catch (error) {
      console.error('❌ [PetitionChat] Erro ao fechar conversa:', error);
      return false;
    }
  }

  /**
   * Buscar conversa associada a uma petição
   */
  private static async getConversationForPetition(petitionId: string) {
    try {
      // Primeira tentativa: buscar por coluna petition_id
      const { data: conversationsByColumn, error: columnError } = await supabase
        .from('conversations')
        .select('*')
        .eq('petition_id', petitionId)
        .limit(1);

      if (columnError) {
        console.error('❌ [PetitionChat] Erro ao buscar conversa por coluna petition_id:', columnError);
      }

      if (conversationsByColumn && conversationsByColumn.length > 0) {
        return conversationsByColumn[0];
      }

      // Segunda tentativa: buscar por metadata->petitionId
      const { data: conversationsByMetadata, error: metadataError } = await supabase
        .from('conversations')
        .select('*')
        .contains('metadata', { petitionId })
        .limit(1);

      if (metadataError) {
        console.error('❌ [PetitionChat] Erro ao buscar conversa por metadata:', metadataError);
      }

      if (conversationsByMetadata && conversationsByMetadata.length > 0) {
        return conversationsByMetadata[0];
      }

      // Fallback: buscar conversa pelo título que contém o ID da petição
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .ilike('title', `%${petitionId}%`)
        .eq('status', 'active')
        .limit(1);

      if (error) {
        console.error('❌ [PetitionChat] Erro ao buscar conversa:', error);
        return null;
      }

      return conversations?.[0] || null;
    } catch (error) {
      console.error('❌ [PetitionChat] Erro ao buscar conversa:', error);
      return null;
    }
  }

  /**
   * Associar conversa com petição (opcional - para melhor rastreamento)
   */
  private static async associateConversationWithPetition(conversationId: string, petitionId: string) {
    try {
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('metadata, petition_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ [PetitionChat] Erro ao carregar metadata da conversa:', fetchError);
      }

      const existingMetadata = (conversation?.metadata || {}) as Record<string, any>;
      const petitionDisplayId =
        existingMetadata.petitionDisplayId ||
        existingMetadata.petition_display_id ||
        existingMetadata.display_id ||
        conversation?.petition_id ||
        petitionId;

      // Atualizar título da conversa para incluir ID da petição
      await supabase
        .from('conversations')
        .update({ 
          title: `Petição: ${petitionId}`,
          description: `Conversa automática para petição ${petitionId}`,
          petition_id: petitionId,
          metadata: {
            ...existingMetadata,
            petitionId,
            petitionDisplayId,
          }
        })
        .eq('id', conversationId);

      console.log('✅ [PetitionChat] Conversa associada à petição');
    } catch (error) {
      console.error('❌ [PetitionChat] Erro ao associar conversa:', error);
    }
  }

  /**
   * Monitorar mudanças de status das petições
   * Esta função pode ser chamada quando o status de uma petição muda
   */
  static async handlePetitionStatusChange(petitionId: string, newStatus: string, oldStatus: string) {
    try {
      console.log(`🔄 [PetitionChat] Status da petição ${petitionId} mudou de ${oldStatus} para ${newStatus}`);

      // Redator aceita petição
      if (oldStatus === 'pending' && newStatus === 'in_progress') {
        await this.createConversationOnPetitionAccepted(petitionId);
      }

      // Cliente aprova petição
      if ((oldStatus === 'in_progress' || oldStatus === 'revision') && newStatus === 'completed') {
        await this.closeConversationOnPetitionCompleted(petitionId);
      }

    } catch (error) {
      console.error('❌ [PetitionChat] Erro ao processar mudança de status:', error);
    }
  }

  /**
   * Sincronizar conversas existentes com petições
   * Função utilitária para verificar consistência
   */
  static async syncExistingPetitions() {
    try {
      console.log('🔄 [PetitionChat] Sincronizando petições existentes...');
      
      // Buscar petições em progresso sem conversa
      const { data: petitions, error } = await supabase
        .from('petitions')
        .select('id, title, client_id, assigned_writer_id')
        .eq('status', 'in_progress');

      if (error) {
        console.error('❌ [PetitionChat] Erro ao buscar petições:', error);
        return;
      }

      for (const petition of petitions || []) {
        const existingConversation = await this.getConversationForPetition(petition.id);
        if (!existingConversation) {
          console.log(`⚠️ [PetitionChat] Petição ${petition.id} em progresso sem conversa, criando...`);
          await this.createConversationOnPetitionAccepted(petition.id);
        }
      }

      console.log('✅ [PetitionChat] Sincronização concluída');
    } catch (error) {
      console.error('❌ [PetitionChat] Erro na sincronização:', error);
    }
  }
}
