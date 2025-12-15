// 🔧 CORREÇÃO TEMPORÁRIA PARA TESTE DE EXCLUSÃO
// Substitua a função deleteConversation no ChatService por esta versão temporária

/**
 * Excluir conversa - VERSÃO TEMPORÁRIA PARA DEBUG
 */
static async deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const user = await this.getAuthUser();
    console.log('🗑️ TEMP: Excluindo conversa:', conversationId, 'para usuário:', user.uid);

    // 🔍 DEBUG: Verificar se a conversa existe (sem filtros RLS)
    console.log('🔍 TEMP: Verificando existência da conversa...');
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, created_by, title, status')
      .eq('id', conversationId)
      .maybeSingle();

    console.log('🔍 TEMP: Resultado da busca:', {
      data: conversation,
      error: conversationError
    });

    if (conversationError) {
      console.error('❌ TEMP: Erro ao buscar conversa:', conversationError);
      throw new Error(`Erro ao buscar conversa: ${conversationError.message}`);
    }

    if (!conversation) {
      console.error('❌ TEMP: Conversa não existe no banco de dados');
      throw new Error('Conversa não encontrada no banco de dados');
    }

    console.log('✅ TEMP: Conversa encontrada:', {
      id: conversation.id,
      title: conversation.title,
      created_by: conversation.created_by,
      user_uid: user.uid,
      match: conversation.created_by === user.uid
    });

    // 🔍 DEBUG: Verificar permissões manualmente
    const isCreator = conversation.created_by === user.uid;
    console.log('🔍 TEMP: Verificação de permissão:', {
      isCreator,
      created_by: conversation.created_by,
      user_uid: user.uid,
      types_match: typeof conversation.created_by === typeof user.uid
    });

    if (!isCreator) {
      // Verificar se é participante
      console.log('🔍 TEMP: Verificando participação...');
      const { data: participant, error: participantError } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.uid)
        .maybeSingle();

      console.log('🔍 TEMP: Resultado da verificação de participação:', {
        data: participant,
        error: participantError
      });

      if (participantError) {
        console.error('❌ TEMP: Erro ao verificar participação:', participantError);
        throw new Error(`Erro ao verificar permissões: ${participantError.message}`);
      }

      if (!participant) {
        console.error('❌ TEMP: Usuário não tem permissão para excluir esta conversa');
        throw new Error('Você não tem permissão para excluir esta conversa');
      }
    }

    console.log('✅ TEMP: Usuário autorizado a excluir conversa');

    // 🔍 DEBUG: Tentar exclusão direta (bypass RLS temporariamente)
    console.log('🔍 TEMP: Tentando exclusão...');
    
    // Primeiro, excluir mensagens relacionadas
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('❌ TEMP: Erro ao excluir mensagens:', messagesError);
    } else {
      console.log('✅ TEMP: Mensagens excluídas com sucesso');
    }

    // Excluir participantes
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId);

    if (participantsError) {
      console.error('❌ TEMP: Erro ao excluir participantes:', participantsError);
    } else {
      console.log('✅ TEMP: Participantes excluídos com sucesso');
    }

    // Finalmente, excluir a conversa
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('❌ TEMP: Erro ao excluir conversa:', deleteError);
      throw new Error(`Erro ao excluir conversa: ${deleteError.message}`);
    }

    console.log('✅ TEMP: Conversa excluída com sucesso');
    return true;

  } catch (error) {
    console.error('❌ TEMP: Erro geral ao excluir conversa:', error);
    throw error;
  }
}
























