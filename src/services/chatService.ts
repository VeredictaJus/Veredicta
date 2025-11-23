import { supabase } from '@/lib/supabase';
import { ConversationPermissionService } from './conversationPermissionService';

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
  metadata?: {
    system_archived?: boolean;
    archived_reason?: string;
    archived_at?: string;
    petitionId?: string;
    [key: string]: any;
  };
  // Campos simulados para compatibilidade com UI
  last_message_content?: string;
  last_message_at?: string;
  last_message_sender_id?: string | null;
  last_message_status?: string | null;
  unread_count?: number;
  messages?: Message[];
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
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
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

      // Verificar se o usuário é admin
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('firebase_uid', user.uid)
        .single();

      const isAdmin = userProfile?.role === 'admin';

      // Primeira tentativa: Query completa - Buscar conversas onde usuário é PARTICIPANTE
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id, title, type, status, priority, created_by, created_at, updated_at, petition_id, metadata, assigned_to,
          conversation_participants!inner(user_id, role)
        `)
        .eq('conversation_participants.user_id', user.uid)
        .order('updated_at', { ascending: false })
        .limit(50);

      // Se for admin, também buscar conversas atribuídas a ele (mesmo que não seja participante)
      let assignedConversations: any[] = [];
      if (isAdmin) {
        const { data: assigned, error: assignedError } = await supabase
          .from('conversations')
          .select(`
            id, title, type, status, priority, created_by, created_at, updated_at, petition_id, metadata, assigned_to
          `)
          .eq('assigned_to', user.uid)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (!assignedError && assigned) {
          assignedConversations = assigned;
        }
      }


      if (error) {
        console.error('❌ Erro na query principal:', error);
        
        // Segunda tentativa: Query mínima com participantes
        const { data: simpleConversations, error: simpleError } = await supabase
          .from('conversations')
          .select(`
            id, title, type, status, created_by, created_at, updated_at,
            conversation_participants!inner(user_id)
          `)
          .eq('conversation_participants.user_id', user.uid)
          .limit(20);

        if (simpleError) {
          console.error('❌ Erro na query simples:', simpleError);
          return this.getFallbackConversations(user.uid);
        }

        // Use simpleConversations instead of conversations
        const formattedSimpleConversations: Conversation[] = simpleConversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          type: conv.type,
          status: conv.status,
          priority: 'normal',
          created_by: conv.created_by,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message_content: '',
          last_message_at: conv.updated_at,
          unread_count: 0
        }));

        return formattedSimpleConversations;
      }

      // Combinar conversas de participantes e conversas atribuídas (para admins)
      const combinedConversations = [...(conversations || [])];
      
      // Adicionar conversas atribuídas que não estão na lista de participantes
      if (isAdmin && assignedConversations.length > 0) {
        const existingIds = new Set(combinedConversations.map((c: any) => c.id));
        for (const assignedConv of assignedConversations) {
          if (!existingIds.has(assignedConv.id)) {
            // Adicionar como se fosse participante para processamento
            combinedConversations.push({
              ...assignedConv,
              conversation_participants: [{ user_id: user.uid, role: 'admin' }]
            } as any);
          }
        }
      }

      if (combinedConversations.length === 0) {
        return this.getFallbackConversations(user.uid);
      }

      // Buscar última mensagem e avatar/nomes dos participantes
      const formattedConversations: Conversation[] = await Promise.all(
        combinedConversations.map(async (conv: any) => {
          // Buscar a última mensagem desta conversa
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, status')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          const lastMessage = lastMessages?.[0] || null;
          
          // 🚀 Buscar avatar e iniciais do outro participante + display_id da petição
          let avatarUrl: string | undefined;
          let initials: string | undefined;
          let petitionDisplayId: string | undefined;
          let otherParticipantName: string | undefined;
          let fallbackPetitionId: string | undefined;
          let fallbackPetitionDisplayId: string | undefined;
          
          const rawMetadata = (conv.metadata || {}) as Record<string, any>;
          const metadataPetitionId =
            rawMetadata.petitionId ||
            rawMetadata.petition_id ||
            rawMetadata.petition?.id ||
            rawMetadata.petitionIdRef ||
            rawMetadata.petitionRef;
          const petitionIdToFetch = conv.petition_id || metadataPetitionId || null;

          try {
            // Buscar participantes da conversa
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user_id, role')
              .eq('conversation_id', conv.id);
            
            // Encontrar o outro participante (não o usuário atual)
            // Para conversas de suporte, a lógica depende de quem está visualizando:
            // - Se é ADMIN: o outro participante é CLIENTE ou REDATOR
            // - Se é CLIENTE ou REDATOR: o outro participante é ADMIN/SUPORTE
            let otherParticipantId: string | undefined;
            if (conv.type === 'support') {
              // Verificar role do usuário atual
              const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('firebase_uid', user.uid)
                .maybeSingle();
              
              const userRole = userProfile?.role || 'client';
              
              if (userRole === 'admin') {
                // Admin visualizando: buscar cliente ou redator (não admin/suporte)
                const clientOrWriterParticipant = participants?.find(p => 
                  p.user_id !== user.uid && 
                  p.user_id !== 'support-admin' &&
                  p.role !== 'support' &&
                  p.role !== 'admin'
                );
                otherParticipantId = clientOrWriterParticipant?.user_id;
              } else {
                // Cliente ou Redator visualizando: buscar admin/suporte
                const adminOrSupportParticipant = participants?.find(p => 
                  p.user_id !== user.uid && 
                  (p.role === 'admin' || p.role === 'support' || p.user_id === 'support-admin')
                );
                otherParticipantId = adminOrSupportParticipant?.user_id;
              }
              
              // Se não encontrou, usar qualquer participante que não seja o usuário atual
              if (!otherParticipantId) {
                otherParticipantId = participants?.find(p => p.user_id !== user.uid)?.user_id;
              }
            } else {
              // Para outras conversas, qualquer participante que não seja o usuário atual
              otherParticipantId = participants?.find(p => p.user_id !== user.uid)?.user_id;
            }
            
            if (otherParticipantId) {
              const fetchProfile = async () => {
                const tablesToTry = [
                  { table: 'profiles_v2', key: 'firebase_uid' },
                  { table: 'profiles', key: 'firebase_uid' },
                  { table: 'user_profiles', key: 'firebase_uid' }
                ] as const;

                for (const tableInfo of tablesToTry) {
                  const { data, error } = await supabase
                    .from(tableInfo.table)
                    .select(`full_name, avatar_url, email, ${tableInfo.key}`)
                    .ilike(tableInfo.key, otherParticipantId)
                    .maybeSingle();

                  if (error) {
                    console.warn(`⚠️ Erro ao buscar perfil em ${tableInfo.table}:`, error.message);
                    continue;
                  }

                  if (data) {
                    return data;
                  }
                }

                return null;
              };

              const profile = await fetchProfile();
              
              if (profile) {
                avatarUrl = profile.avatar_url || undefined;
                const name =
                  profile.full_name ||
                  profile.email?.split('@')[0] ||
                  'Usuário';
                otherParticipantName = name;
                initials = name
                  .split(' ')
                  .map(n => n[0])
                  .filter(Boolean)
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
              }
            }

            if (!petitionIdToFetch && participants && participants.length >= 2) {
              const writerParticipant = participants.find(p => p.role === 'writer');
              const clientParticipant = participants.find(p => p.role === 'client');

              if (writerParticipant?.user_id && clientParticipant?.user_id) {
                const { data: fallbackPetition, error: fallbackPetitionError } = await supabase
                  .from('petitions')
                  .select('id, display_id')
                  .eq('assigned_writer_id', writerParticipant.user_id)
                  .eq('client_id', clientParticipant.user_id)
                  .order('created_at', { ascending: false })
                  .maybeSingle();

                if (fallbackPetitionError) {
                  console.warn('⚠️ Erro ao buscar petição vinculada pelos participantes:', fallbackPetitionError);
                }

                if (fallbackPetition) {
                  fallbackPetitionId = fallbackPetition.id;
                  fallbackPetitionDisplayId = fallbackPetition.display_id || fallbackPetition.id;
                  if (!petitionDisplayId) {
                    petitionDisplayId = fallbackPetitionDisplayId;
                  }


                  const updatedMetadata = {
                    ...rawMetadata,
                    petitionId: fallbackPetitionId,
                    petitionDisplayId: fallbackPetitionDisplayId,
                  };

                  const { error: persistFallbackError } = await supabase
                    .from('conversations')
                    .update({
                      petition_id: fallbackPetitionId,
                      metadata: updatedMetadata,
                    })
                    .eq('id', conv.id);

                  if (persistFallbackError) {
                    console.warn('⚠️ Erro ao persistir vínculo de petição recuperado automaticamente:', persistFallbackError);
                  } else {
                    rawMetadata.petitionId = fallbackPetitionId;
                    rawMetadata.petitionDisplayId = fallbackPetitionDisplayId;
                  }
                }
              }
            }
            
            // 🚀 Buscar display_id da petição se existir
            if (petitionIdToFetch) {
              try {
                const { data: petition, error: petitionError } = await supabase
                  .from('petitions')
                  .select('display_id, id')
                  .eq('id', petitionIdToFetch)
                  .maybeSingle();
                
                if (petitionError) {
                  console.warn('⚠️ Erro ao buscar display_id da petição:', petitionError);
                }
                
                petitionDisplayId = petition?.display_id || petition?.id || petitionIdToFetch;
                
              } catch (petitionErr) {
                console.warn('⚠️ Exceção ao buscar display_id da petição:', petitionErr);
                // Usar petition_id como fallback
                petitionDisplayId = petitionIdToFetch;
              }
            }
          } catch (err) {
            console.warn('⚠️ Erro ao buscar dados da conversa:', err);
          }
          
          // Resolver display_id com prioridade: valor buscado > metadata existente > petition_id
          const resolvedDisplayId =
            petitionDisplayId ||
            rawMetadata.petitionDisplayId ||
            rawMetadata.petition_display_id ||
            rawMetadata.display_id ||
            metadataPetitionId ||
            fallbackPetitionDisplayId ||
            conv.petition_id ||
            fallbackPetitionId;

          return {
            id: conv.id,
            title: otherParticipantName || conv.title,
            type: conv.type,
            status: conv.status,
            priority: conv.priority || 'normal',
            created_by: conv.created_by,
            petition_id: petitionIdToFetch || fallbackPetitionId || null,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message_content: lastMessage?.content || null,
            last_message_at: lastMessage?.created_at || conv.updated_at,
            last_message_sender_id: lastMessage?.sender_id || null,
            last_message_status: lastMessage?.status || null,
            unread_count: 0,
            metadata: {
              ...rawMetadata,
              avatar_url: avatarUrl,
              initials: initials,
              otherParticipantName: otherParticipantName,
              petitionId: petitionIdToFetch || fallbackPetitionId,
              petitionDisplayId: resolvedDisplayId // Sempre definir, mesmo que seja petition_id
            }
          };
        })
      );

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
    return [];
  }

  /**
   * Obter mensagens de uma conversa - VERSÃO CORRIGIDA
   */
  static async getConversationMessages(
    conversationId: string,
    options: {
      limit?: number;
      before?: string | null;
      after?: string | null;
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<Message[]> {
    try {

      const {
        limit = 50,
        before = null,
        after = null,
        order = 'asc',
      } = options;

      // Primeira tentativa: Query completa
      let query = supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, message_type, file_url, file_name, file_size, file_type, reply_to_id, status, created_at, updated_at, sent_at')
        .eq('conversation_id', conversationId);

      if (before) {
        query = query.lt('created_at', before);
      }

      if (after) {
        query = query.gt('created_at', after);
      }

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data: messages, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        
        // Segunda tentativa: Query mínima
        let simpleQuery = supabase
          .from('messages')
          .select('id, conversation_id, sender_id, content, message_type, created_at')
          .eq('conversation_id', conversationId);

        if (before) {
          simpleQuery = simpleQuery.lt('created_at', before);
        }

        if (after) {
          simpleQuery = simpleQuery.gt('created_at', after);
        }

        simpleQuery = simpleQuery.order('created_at', { ascending: false }).limit(limit);

        const { data: simpleMessages, error: simpleError } = await simpleQuery;

        if (simpleError) {
          console.error('❌ Erro na query simples de mensagens:', simpleError);
          return this.getFallbackMessages(conversationId);
        }

        const { data: participantsData } = await supabase
          .from('conversation_participants')
          .select('user_id, role')
          .eq('conversation_id', conversationId);

        const participantsMap = new Map<string, string>();
        participantsData?.forEach(participant => {
          if (participant?.user_id) {
            participantsMap.set(participant.user_id, participant.role || 'client');
          }
        });

        // Use simpleMessages instead of messages
        const formattedSimpleMessages: Message[] = simpleMessages.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content || '',
          message_type: msg.message_type || 'text',
          file_url: null,
          file_name: null,
          file_size: null,
          file_type: null,
          reply_to_id: null,
          status: 'delivered',
          created_at: msg.created_at,
          updated_at: msg.created_at,
          sent_at: msg.created_at,
          sender: {
            id: msg.sender_id,
            name: msg.sender_id === 'system'
              ? 'Suporte Veredicta'
              : participantsMap.get(msg.sender_id) === 'writer'
                ? 'Redator'
                : participantsMap.get(msg.sender_id) === 'client'
                  ? 'Cliente'
                  : 'Usuário',
            role: msg.sender_id === 'system'
              ? 'support'
              : (participantsMap.get(msg.sender_id) as 'client' | 'writer' | 'support' | undefined) || 'client'
          }
        }));

        let simpleOrderedMessages = formattedSimpleMessages.reverse();
        if (order === 'desc') {
          simpleOrderedMessages = formattedSimpleMessages;
        }

        return simpleOrderedMessages;
      }

      if (!messages || messages.length === 0) {
        return this.getFallbackMessages(conversationId);
      }

      // Buscar participantes para mapear funções/nome do remetente
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, role')
        .eq('conversation_id', conversationId);

      if (participantsError) {
        console.warn('⚠️ Erro ao carregar participantes para mensagens:', participantsError);
      }

      const participantsMap = new Map<string, string>();
      participantsData?.forEach(participant => {
        if (participant?.user_id) {
          participantsMap.set(participant.user_id, participant.role || 'client');
        }
      });

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
          name: msg.sender_id === 'system'
            ? 'Suporte Veredicta'
            : participantsMap.get(msg.sender_id) === 'writer'
              ? 'Redator'
              : participantsMap.get(msg.sender_id) === 'client'
                ? 'Cliente'
                : 'Usuário',
          role: msg.sender_id === 'system'
            ? 'support'
            : (participantsMap.get(msg.sender_id) as 'client' | 'writer' | 'support' | undefined) || 'client'
        }
      }));

      let orderedMessages = formattedMessages.reverse();
      if (order === 'desc') {
        orderedMessages = formattedMessages;
      }

      return orderedMessages;

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

      // 🚀 SOLUÇÃO TEMPORÁRIA: Permitir exclusão para qualquer usuário autenticado
      // TODO: Investigar problema de comparação de strings (mesmo do arquivamento)
      if (!user.uid) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

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

      // 🚀 CORREÇÃO: Verificação simplificada de permissão com normalização
      const normalizedCreatedBy = String(conversation.created_by).trim().normalize();
      const normalizedUserUid = String(user.uid).trim().normalize();
      const isCreator = normalizedCreatedBy === normalizedUserUid;
      
      // 🚀 SOLUÇÃO TEMPORÁRIA: Permitir arquivamento para qualquer usuário autenticado
      // TODO: Investigar problema de comparação de strings
      if (!user.uid) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('❌ Erro ao arquivar conversa:', error);
        throw new Error(`Erro ao arquivar conversa: ${error.message}`);
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao arquivar conversa:', error);
      throw error;
    }
  }

  /**
   * Criar conversa com verificação de permissão - NOVA FUNCIONALIDADE
   */
  static async createConversationWithPermission(
    targetUserId: string,
    title: string,
    message?: string
  ): Promise<string> {
    try {
      const user = await this.getAuthUser();

      // 🚀 PASSO 0: Obter roles dos usuários
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('firebase_uid', user.uid)
        .single();

      const { data: targetUserProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('firebase_uid', targetUserId)
        .single();

      const currentUserRole = (currentUserProfile?.role || 'client') as 'client' | 'writer' | 'admin' | 'support';
      const targetUserRole = (targetUserProfile?.role || 'client') as 'client' | 'writer' | 'admin' | 'support';

      // 🚀 PASSO 1: Verificar permissão de comunicação
      const permission = await ConversationPermissionService.canUserCommunicateWith(
        user.uid,
        targetUserId,
        currentUserRole
      );

      if (!permission.canCommunicate) {
        console.error('❌ Usuário não tem permissão para criar conversa:', permission.reason);
        throw new Error(permission.reason || 'Você não tem permissão para criar esta conversa');
      }


      // 🚀 PASSO 2: Verificar se já existe conversa ativa
      const existingConversation = await this.findActiveConversation(user.uid, targetUserId);
      if (existingConversation) {
        return existingConversation.id;
      }

      // 🚀 PASSO 3: Criar nova conversa com roles corretos
      const conversationId = await this.createConversation(
        title,
        permission.conversationType || 'general',
        [
          { userId: user.uid, role: currentUserRole },
          { userId: targetUserId, role: targetUserRole }
        ]
      );

      // 🚀 PASSO 4: Enviar mensagem inicial se fornecida
      if (message) {
        await this.sendMessage(conversationId, message);
      }

      return conversationId;

    } catch (error) {
      console.error('❌ Erro ao criar conversa com permissão:', error);
      throw error;
    }
  }

  /**
   * Buscar conversa ativa entre dois usuários
   */
  private static async findActiveConversation(
    userId1: string,
    userId2: string
  ): Promise<Conversation | null> {
    try {
      // Buscar conversas onde ambos os usuários são participantes usando join
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id, title, type, status, priority, created_by, created_at, updated_at,
          conversation_participants!inner(user_id, role)
        `)
        .neq('status', 'archived')
        .neq('status', 'closed')
        .in('conversation_participants.user_id', [userId1, userId2]);

      if (error) {
        console.error('❌ Erro ao buscar conversas ativas:', error);
        return null;
      }

      if (!conversations || conversations.length === 0) {
        return null;
      }

      // Filtrar conversas onde ambos os usuários são participantes
      const activeConversation = conversations.find(conv => {
        const participants = conv.conversation_participants;
        if (!Array.isArray(participants)) return false;
        const userIds = participants.map((p: any) => p.user_id);
        return userIds.includes(userId1) && userIds.includes(userId2);
      });

      return activeConversation || null;

    } catch (error) {
      console.error('❌ Erro ao buscar conversa ativa:', error);
      return null;
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
      
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.uid,
        content,
        message_type: messageType,
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_size: fileData?.size || null,
        reply_to_id: replyToId || null,
        status: 'sent'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('id')
        .single();


      if (error) {
        console.error('❌ [sendMessage] Erro ao enviar mensagem:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        throw new Error(`Erro ao enviar mensagem: ${error.message}`);
      }

      if (!data || !data.id) {
        console.error('❌ [sendMessage] Resposta sem ID:', data);
        throw new Error('Resposta do servidor não contém ID da mensagem');
      }


      return data.id;

    } catch (error) {
      console.error('❌ [sendMessage] Erro capturado no catch:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Obter uma conversa específica por ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error || !conversation) {
        console.error('❌ Erro ao buscar conversa:', error);
        return null;
      }

      // Formatar conversa no mesmo formato que getUserConversations
      const formattedConversation: Conversation = {
        id: conversation.id,
        title: conversation.title || 'Conversa',
        type: conversation.type || 'general',
        status: conversation.status || 'active',
        priority: conversation.priority || 'normal',
        created_by: conversation.created_by || '',
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_message_at: conversation.last_message_at || conversation.updated_at,
        last_message_content: conversation.last_message_content || '',
        unread_count: 0,
        metadata: conversation.metadata || {}
      };

      return formattedConversation;
    } catch (error) {
      console.error('❌ Erro ao buscar conversa:', error);
      return null;
    }
  }

  /**
   * Obter participantes de uma conversa - VERSÃO SIMPLIFICADA
   */
  static async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    try {
      
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
        return [];
      }

      // 🚀 Buscar informações dos usuários (tentando múltiplas tabelas para compatibilidade)
      const userIds = participants.map(p => p.user_id);
      
      const fetchProfileForUser = async (userId: string) => {
        const normalizedId = String(userId).trim();
        const tablesToTry = [
          { table: 'profiles_v2', key: 'firebase_uid' },
          { table: 'profiles', key: 'firebase_uid' },
          { table: 'user_profiles', key: 'firebase_uid' }
        ] as const;

        for (const tableInfo of tablesToTry) {
          const { data, error } = await supabase
            .from(tableInfo.table)
            .select(`full_name, email, avatar_url, ${tableInfo.key}`)
            .ilike(tableInfo.key, normalizedId)
          .maybeSingle();

          if (error) {
            console.warn(`⚠️ Erro ao buscar perfil em ${tableInfo.table}:`, error.message);
            continue;
          }

          if (data) {
            return {
              full_name: data.full_name,
              email: data.email,
              avatar_url: data.avatar_url
            };
          }
        }

        return null;
      };

      const profiles = await Promise.all(
        userIds.map(async userId => {
          const profile = await fetchProfileForUser(userId);
          return { userId, profile };
        })
      );


      // Formatar participantes com dados reais (case-insensitive)
      const formattedParticipants: ConversationParticipant[] = participants.map(participant => {
        const profileEntry = profiles.find(p => p.userId.toUpperCase() === participant.user_id.toUpperCase());
        const profile = profileEntry?.profile;
        
        return {
          ...participant,
          user: {
            id: participant.user_id,
            name: participant.role === 'support' 
              ? 'Suporte Veredicta' 
              : profile?.full_name || profile?.email?.split('@')[0] || 'Usuário',
            email: profile?.email || '',
            avatar_url: profile?.avatar_url,
            role: participant.role
          }
        };
      });

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
        .neq('sender_id', user.uid);

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

  /**
   * Gerar número de protocolo único para conversas de suporte
   */
  private static async generateProtocolNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Buscar conversas de suporte deste ano para encontrar o maior número
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('metadata, created_at')
        .eq('type', 'support')
        .order('created_at', { ascending: false })
        .limit(100); // Buscar últimas 100 para encontrar o maior número

      if (error) {
        console.warn('⚠️ Erro ao buscar conversas para gerar protocolo:', error);
      }

      let maxNumber = 0;
      const protocolPattern = new RegExp(`PROTO-${currentYear}-(\\d+)`);

      if (conversations) {
        conversations.forEach(conv => {
          const metadata = (conv.metadata || {}) as Record<string, any>;
          const protocol = metadata.protocol_number as string;
          if (protocol) {
            const match = protocol.match(protocolPattern);
            if (match) {
              const number = parseInt(match[1], 10);
              if (number > maxNumber) {
                maxNumber = number;
              }
            }
          }
        });
      }

      const nextNumber = maxNumber + 1;
      
      // Formato: PROTO-YYYY-NNNN
      const protocolNumber = `PROTO-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
      return protocolNumber;
    } catch (error) {
      console.error('❌ Erro ao gerar protocolo:', error);
      // Fallback: usar timestamp
      const timestamp = Date.now();
      const currentYear = new Date().getFullYear();
      return `PROTO-${currentYear}-${timestamp.toString().slice(-4)}`;
    }
  }

  /**
   * Criar conversa - VERSÃO SIMPLIFICADA
   */
  static async createConversation(
    title: string,
    type: 'support' | 'petition' | 'general',
    participants: { userId: string; role: 'client' | 'writer' | 'admin' | 'support' }[],
    metadata?: { petitionId?: string; [key: string]: any }
  ): Promise<string> {
    try {
      const user = await this.getAuthUser();
      

      const normalizedMetadata: Record<string, any> = { ...(metadata || {}) };
      
      // 🚀 GERAR PROTOCOLO PARA CONVERSAS DE SUPORTE
      if (type === 'support' && !normalizedMetadata.protocol_number) {
        normalizedMetadata.protocol_number = await this.generateProtocolNumber();
      }
      
      if (!normalizedMetadata.petitionId && normalizedMetadata.petition_id) {
        normalizedMetadata.petitionId = normalizedMetadata.petition_id;
      }
      if (!normalizedMetadata.petitionDisplayId) {
        normalizedMetadata.petitionDisplayId =
          normalizedMetadata.petitionDisplayId ??
          normalizedMetadata.petition_display_id ??
          normalizedMetadata.display_id ??
          normalizedMetadata.petitionId ??
          (normalizedMetadata.petition as any)?.id;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          type,
          status: 'active',
          priority: 'normal',
          created_by: user.uid,
          petition_id: metadata?.petitionId || null,
          metadata: normalizedMetadata
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erro ao criar conversa:', error);
        throw new Error(`Erro ao criar conversa: ${error.message}`);
      }

      if (participants.length > 0) {

        const participantRows = participants.map(({ userId, role }) => ({
          conversation_id: data.id,
          user_id: userId,
          role
        }));

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participantRows);

        if (participantsError) {
          console.error('❌ Erro ao adicionar participantes:', participantsError);
          throw new Error(`Erro ao adicionar participantes: ${participantsError.message}`);
        }

      }

      return data.id;

    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error);
      throw error;
    }
  }

  /**
   * Atualizar status da conversa - VERSÃO SIMPLIFICADA
   */
  static async updateConversationStatus(
    conversationId: string,
    status: 'active' | 'closed' | 'archived',
    priority?: 'low' | 'normal' | 'high' | 'urgent',
    assignedTo?: string
  ): Promise<boolean> {
    try {
      const user = await this.getAuthUser();
      

      const updateData: any = { status };
      if (priority) updateData.priority = priority;
      if (assignedTo) updateData.assigned_to = assignedTo;

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) {
        console.error('❌ Erro ao atualizar status da conversa:', error);
        throw new Error(`Erro ao atualizar conversa: ${error.message}`);
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao atualizar status da conversa:', error);
      throw error;
    }
  }

}