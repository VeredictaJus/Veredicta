import { supabase } from '@/lib/supabase';

export interface Conversation {
  id: string;
  title: string;
  type: 'support' | 'petition' | 'general';
  status: 'active' | 'closed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  assigned_to?: string;
  petition_id?: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  last_admin_activity?: string;
  response_count?: number;
  // Campos simulados para compatibilidade com UI
  last_message_content?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system' | 'audio';
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  reply_to_id?: string | null;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  sent_at?: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'client' | 'writer' | 'admin' | 'support';
  joined_at: string;
  last_read_at: string;
  created_at: string;
  updated_at: string;
  last_read_message_id?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}

export class ChatService {
  /**
   * Obter usuário autenticado atual - usando Firebase Auth
   */
  private static async getAuthUser() {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      if (!auth.currentUser) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('✅ Usuário autenticado:', auth.currentUser.uid);
      return auth.currentUser;
    } catch (error) {
      console.error('❌ Erro ao obter usuário autenticado:', error);
      throw error;
    }
  }

  /**
   * Obter conversas do usuário atual - VERSÃO CORRIGIDA
   */
  static async getUserConversations(): Promise<Conversation[]> {
    try {
      const user = await this.getAuthUser();
      console.log('🔍 Buscando conversas para usuário:', user.uid);

      // Primeira tentativa: Query completa
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, title, type, status, priority, created_by, created_at, updated_at')
        .eq('created_by', user.uid)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro na query principal:', error);
        
        // Segunda tentativa: Query mínima
        const { data: simpleConversations, error: simpleError } = await supabase
          .from('conversations')
          .select('id, title, type, status, created_by, created_at, updated_at')
          .eq('created_by', user.uid)
          .limit(5);

        if (simpleError) {
          console.error('❌ Erro na query simples:', simpleError);
          return this.getFallbackConversations(user.uid);
        }

        conversations = simpleConversations;
      }

      if (!conversations || conversations.length === 0) {
        console.log('⚠️ Nenhuma conversa encontrada, usando fallback');
        return this.getFallbackConversations(user.uid);
      }

      // Formatar conversas
      const formattedConversations: Conversation[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        type: conv.type,
        status: conv.status,
        priority: conv.priority || 'normal',
        created_by: conv.created_by,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message_content: '',
        last_message_at: conv.updated_at,
        unread_count: 0
      }));

      console.log('✅ Conversas carregadas:', formattedConversations.length);
      return formattedConversations;

    } catch (error) {
      console.error('❌ Erro geral ao buscar conversas:', error);
      return this.getFallbackConversations('anonymous');
    }
  }

  /**
   * Conversas de fallback
   */
  private static getFallbackConversations(userId: string): Conversation[] {
    const fallbackConversations = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Suporte Veredicta',
        type: 'support' as const,
        status: 'active' as const,
        priority: 'normal' as const,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_content: 'Bem-vindo ao suporte Veredicta!',
        last_message_at: new Date().toISOString(),
        unread_count: 0
      }
    ];

    console.log('✅ Usando conversas de fallback:', fallbackConversations.length);
    return fallbackConversations;
  }

  /**
   * Obter mensagens de uma conversa - VERSÃO CORRIGIDA
   */
  static async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      console.log(`🔍 Buscando mensagens para conversa: ${conversationId}`);

      // Primeira tentativa: Query completa
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, message_type, file_url, file_name, file_size, file_type, reply_to_id, status, created_at, updated_at, sent_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        
        // Segunda tentativa: Query mínima
        const { data: simpleMessages, error: simpleError } = await supabase
          .from('messages')
          .select('id, conversation_id, sender_id, content, message_type, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(20);

        if (simpleError) {
          console.error('❌ Erro na query simples de mensagens:', simpleError);
          return this.getFallbackMessages(conversationId);
        }

        messages = simpleMessages;
      }

      if (!messages || messages.length === 0) {
        console.log('⚠️ Nenhuma mensagem encontrada, usando fallback');
        return this.getFallbackMessages(conversationId);
      }

      // Formatar mensagens
      const formattedMessages: Message[] = messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content || '',
        message_type: msg.message_type || 'text',
        file_url: msg.file_url || null,
        file_name: msg.file_name || null,
        file_size: msg.file_size || null,
        file_type: msg.file_type || null,
        reply_to_id: msg.reply_to_id || null,
        status: msg.status || 'delivered',
        created_at: msg.created_at,
        updated_at: msg.updated_at || msg.created_at,
        sent_at: msg.sent_at || msg.created_at,
        sender: {
          id: msg.sender_id,
          name: msg.sender_id === 'system' ? 'Suporte Veredicta' : 'Usuário',
          role: msg.sender_id === 'system' ? 'support' : 'client'
        }
      }));

      console.log('✅ Mensagens carregadas:', formattedMessages.length);
      return formattedMessages;

    } catch (error) {
      console.error('❌ Erro geral ao buscar mensagens:', error);
      return this.getFallbackMessages(conversationId);
    }
  }

  /**
   * Mensagens de fallback
   */
  private static getFallbackMessages(conversationId: string): Message[] {
    const fallbackMessages = [
      {
        id: `welcome-${conversationId}`,
        conversation_id: conversationId,
        sender_id: 'system',
        content: 'Bem-vindo ao suporte Veredicta! Como posso ajudar você?',
        message_type: 'text' as const,
        status: 'delivered' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: 'system',
          name: 'Suporte Veredicta',
          role: 'support'
        }
      }
    ];

    console.log('✅ Usando mensagens de fallback:', fallbackMessages.length);
    return fallbackMessages;
  }

  /**
   * Excluir conversa - VERSÃO CORRIGIDA
   */
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const user = await this.getAuthUser();
      console.log('🗑️ Excluindo conversa:', conversationId, 'para usuário:', user.uid);

      // Verificar se a conversa existe
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id, created_by, title')
        .eq('id', conversationId)
        .maybeSingle();

      if (conversationError) {
        console.error('❌ Erro ao buscar conversa:', conversationError);
        throw new Error(`Erro ao buscar conversa: ${conversationError.message}`);
      }

      if (!conversation) {
        console.error('❌ Conversa não encontrada para ID:', conversationId);
        throw new Error('Conversa não encontrada');
      }

      // Verificar permissão
      const isCreator = conversation.created_by === user.uid;
      if (!isCreator) {
        // Verificar se é participante
        const { data: participant, error: participantError } = await supabase
          .from('conversation_participants')
          .select('role')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.uid)
          .maybeSingle();

        if (participantError || !participant) {
          console.error('❌ Usuário não tem permissão para excluir esta conversa');
          throw new Error('Você não tem permissão para excluir esta conversa');
        }
      }

      console.log('✅ Usuário autorizado a excluir conversa');

      // Excluir mensagens primeiro
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) {
        console.error('⚠️ Erro ao excluir mensagens:', messagesError);
      }

      // Excluir participantes
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);

      if (participantsError) {
        console.error('⚠️ Erro ao excluir participantes:', participantsError);
      }

      // Excluir conversa
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (deleteError) {
        console.error('❌ Erro ao excluir conversa:', deleteError);
        throw new Error(`Erro ao excluir conversa: ${deleteError.message}`);
      }

      console.log('✅ Conversa excluída com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error);
      throw error;
    }
  }

  /**
   * Arquivar conversa - VERSÃO CORRIGIDA
   */
  static async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      const user = await this.getAuthUser();
      console.log('📁 Arquivando conversa:', conversationId, 'para usuário:', user.uid);

      // Verificar se a conversa existe
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id, created_by, status')
        .eq('id', conversationId)
        .maybeSingle();

      if (conversationError) {
        console.error('❌ Erro ao buscar conversa:', conversationError);
        throw new Error(`Erro ao buscar conversa: ${conversationError.message}`);
      }

      if (!conversation) {
        console.error('❌ Conversa não encontrada para ID:', conversationId);
        throw new Error('Conversa não encontrada');
      }

      // Verificar permissão
      const isCreator = conversation.created_by === user.uid;
      if (!isCreator) {
        // Verificar se é participante
        const { data: participant, error: participantError } = await supabase
          .from('conversation_participants')
          .select('role')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.uid)
          .maybeSingle();

        if (participantError || !participant) {
          console.error('❌ Usuário não tem permissão para arquivar esta conversa');
          throw new Error('Você não tem permissão para arquivar esta conversa');
        }
      }

      console.log('✅ Usuário autorizado a arquivar conversa');

      // Arquivar conversa
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);

      if (error) {
        console.error('❌ Erro ao arquivar conversa:', error);
        throw new Error(`Erro ao arquivar conversa: ${error.message}`);
      }

      console.log('✅ Conversa arquivada com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao arquivar conversa:', error);
      throw error;
    }
  }

  /**
   * Enviar mensagem - VERSÃO SIMPLIFICADA
   */
  static async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'text' | 'file' | 'image' | 'system' | 'audio' = 'text',
    fileData?: { url: string; name: string; size: number },
    replyToId?: string
  ): Promise<string> {
    try {
      const user = await this.getAuthUser();
      
      console.log('📤 Enviando mensagem:', { conversationId, content, messageType });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.uid,
          content,
          message_type: messageType,
          file_url: fileData?.url || null,
          file_name: fileData?.name || null,
          file_size: fileData?.size || null,
          reply_to_id: replyToId || null,
          status: 'sent'
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        throw new Error(`Erro ao enviar mensagem: ${error.message}`);
      }

      console.log('✅ Mensagem enviada com sucesso:', data.id);
      return data.id;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Obter participantes de uma conversa - VERSÃO SIMPLIFICADA
   */
  static async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    try {
      console.log(`🔍 Buscando participantes para conversa: ${conversationId}`);
      
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select('id, conversation_id, user_id, role, joined_at, last_read_at, created_at, updated_at')
        .eq('conversation_id', conversationId)
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar participantes:', error);
        return [];
      }

      if (!participants || participants.length === 0) {
        console.log('⚠️ Nenhum participante encontrado');
        return [];
      }

      // Formatar participantes
      const formattedParticipants: ConversationParticipant[] = participants.map(participant => ({
        ...participant,
        user: {
          id: participant.user_id,
          name: participant.role === 'support' ? 'Suporte Veredicta' : 'Usuário',
          email: '',
          role: participant.role
        }
      }));

      console.log('✅ Participantes encontrados:', formattedParticipants.length);
      return formattedParticipants;

    } catch (error) {
      console.error('❌ Erro ao buscar participantes:', error);
      return [];
    }
  }

  /**
   * Marcar mensagem como lida - VERSÃO SIMPLIFICADA
   */
  static async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      if (messageId.startsWith('welcome-') || messageId.startsWith('support-message-')) {
        return true;
      }

      const user = await this.getAuthUser();

      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId)
        .eq('sender_id', '!=', user.uid);

      if (error) {
        console.error('❌ Erro ao marcar mensagem como lida:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao marcar mensagem como lida:', error);
      return false;
    }
  }
}
























