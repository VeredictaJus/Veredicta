// src/hooks/usePetitionChat.ts
import { useCallback } from 'react';
import { PetitionChatService } from '@/services/petitionChatService';

/**
 * Hook para gerenciar conversas automáticas de petições
 * Este hook NÃO interfere no sistema de chat existente
 */
export function usePetitionChat() {
  
  /**
   * Criar conversa quando redator aceita petição
   * Deve ser chamado quando status muda para 'in_progress'
   */
  const createConversationForPetition = useCallback(async (petitionId: string) => {
    try {
      console.log('🔄 [usePetitionChat] Criando conversa para petição:', petitionId);
      const conversationId = await PetitionChatService.createConversationOnPetitionAccepted(petitionId);
      
      if (conversationId) {
        console.log('✅ [usePetitionChat] Conversa criada com sucesso:', conversationId);
        return conversationId;
      } else {
        console.log('⚠️ [usePetitionChat] Não foi possível criar conversa');
        return null;
      }
    } catch (error) {
      console.error('❌ [usePetitionChat] Erro ao criar conversa:', error);
      return null;
    }
  }, []);

  /**
   * Fechar conversa quando cliente aprova petição
   * Deve ser chamado quando status muda para 'completed'
   */
  const closeConversationForPetition = useCallback(async (petitionId: string) => {
    try {
      console.log('🔄 [usePetitionChat] Fechando conversa para petição:', petitionId);
      const success = await PetitionChatService.closeConversationOnPetitionCompleted(petitionId);
      
      if (success) {
        console.log('✅ [usePetitionChat] Conversa fechada com sucesso');
        return true;
      } else {
        console.log('⚠️ [usePetitionChat] Não foi possível fechar conversa');
        return false;
      }
    } catch (error) {
      console.error('❌ [usePetitionChat] Erro ao fechar conversa:', error);
      return false;
    }
  }, []);

  /**
   * Processar mudança de status de petição
   * Função principal que gerencia todo o fluxo automático
   */
  const handlePetitionStatusChange = useCallback(async (
    petitionId: string, 
    newStatus: string, 
    oldStatus: string
  ) => {
    try {
      console.log(`🔄 [usePetitionChat] Processando mudança de status: ${oldStatus} → ${newStatus}`);
      
      // Redator aceita petição
      if (oldStatus === 'pending' && newStatus === 'in_progress') {
        await createConversationForPetition(petitionId);
      }

      // Cliente aprova petição
      if ((oldStatus === 'in_progress' || oldStatus === 'revision') && newStatus === 'completed') {
        await closeConversationForPetition(petitionId);
      }

      console.log('✅ [usePetitionChat] Processamento de status concluído');
    } catch (error) {
      console.error('❌ [usePetitionChat] Erro ao processar mudança de status:', error);
    }
  }, [createConversationForPetition, closeConversationForPetition]);

  /**
   * Sincronizar conversas existentes
   * Útil para verificar consistência do sistema
   */
  const syncExistingPetitions = useCallback(async () => {
    try {
      console.log('🔄 [usePetitionChat] Iniciando sincronização...');
      await PetitionChatService.syncExistingPetitions();
      console.log('✅ [usePetitionChat] Sincronização concluída');
    } catch (error) {
      console.error('❌ [usePetitionChat] Erro na sincronização:', error);
    }
  }, []);

  return {
    createConversationForPetition,
    closeConversationForPetition,
    handlePetitionStatusChange,
    syncExistingPetitions
  };
}
