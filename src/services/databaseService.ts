import { supabase } from '@/lib/supabaseClient'
import { EmailService } from './emailService';

export interface Petition {
  id: string;
  display_id?: string;
  title: string;
  type: string;
  description: string;
  price: number;
  deadline: string;
  priority: 'normal' | 'urgent' | 'express';
  client_id: string;
  client_name: string;
  client_location: string;
  specialties: string[];
  estimated_hours: number;
  files_count: number;
  status: 'pending' | 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'delivered' | 'rejected' | 'approved' | 'revision' | 'pending_review';
  assigned_writer_id?: string;
  requires_labor_calculation?: boolean;
  calculation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WriterApplication {
  id: string;
  petition_id: string;
  writer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  application_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  petition_id: string;
  writer_id: string;
  client_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  payment_date?: string;
  completion_date?: string;
  payment_method?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPayment {
  id: string;
  writer_id: string;
  reference_year: number;
  reference_month: number;
  petitions_count: number;
  value_per_petition: number;
  total_amount: number;
  status: 'pending' | 'scheduled' | 'paid' | 'cancelled';
  scheduled_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WriterRating {
  id: string;
  writer_id: string;
  client_id: string;
  petition_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface WriterRatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export class DatabaseService {
  // PETITIONS
  static async getAvailablePetitions(
    writerUid?: string, 
    useSpecialtyFilter: boolean = false
  ): Promise<Petition[]> {
    let query = supabase
      .from('petitions')
      .select('*')
      .in('status', ['pending', 'available']) // Aceita tanto 'pending' quanto 'available'
      .is('assigned_writer_id', null); // Só petições sem redator atribuído
    
    // Aplicar filtro de especialidade (OPCIONAL)
    if (writerUid && useSpecialtyFilter) {
      const { data: writerProfile } = await supabase
        .from('profiles_v2')
        .select('specialties')
        .eq('firebase_uid', writerUid)
        .single();
      
      // Se tem especialidades, filtrar por elas
      if (writerProfile?.specialties && 
          Array.isArray(writerProfile.specialties) && 
          writerProfile.specialties.length > 0) {
        query = query.in('area', writerProfile.specialties);
      }
      // Se NÃO tem especialidades, não filtra (mostra tudo)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available petitions:', error);
      return [];
    }
    
    return data || [];
  }

  static async getWriterPetitions(writerId: string): Promise<Petition[]> {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .eq('assigned_writer_id', writerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching writer petitions:', error);
      return [];
    }

    return data || [];
  }

  static async getClientPetitions(clientId: string): Promise<Petition[]> {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (!error) {
      const rows = data || [];
      if (rows.length > 0) return rows;
      // Legacy fallback: try old table name if new table has no rows
      try {
        const { data: legacy, error: legacyErr } = await supabase
          .from('app_2d8133c678_petitions')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
        if (!legacyErr && legacy && legacy.length > 0) return legacy as any;
      } catch {}
      return rows;
    }

    console.error('Error fetching client petitions:', error);
    // Fallback via RPC when RLS blocks
    if ((error as any).code === '42501') {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_client_petitions', {
          p_client_id: clientId
        });
        if (rpcError) {
          console.error('RPC get_client_petitions failed:', rpcError);
          return [];
        }
        const rpcRows = (rpcData as any[]) || [];
        if (rpcRows.length > 0) return rpcRows;
        // Final legacy fallback if RPC returns empty
        try {
          const { data: legacy, error: legacyErr } = await supabase
            .from('app_2d8133c678_petitions')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
          if (!legacyErr && legacy && legacy.length > 0) return legacy as any;
        } catch {}
        return rpcRows;
      } catch (rpcCatch) {
        console.error('RPC get_client_petitions exception:', rpcCatch);
        return [];
      }
    }

    return [];
  }

  static async createPetition(petition: Partial<Petition>): Promise<Petition | null> {
    // Allow only valid columns for 'petitions' table
    const allowed: (keyof Petition)[] = [
      'client_id', 'title', 'description', 'type', 'status', 'priority',
      'price', 'deadline', 'assigned_writer_id'
    ];
    
    // Campos extras que podem existir no banco mas não no tipo Petition
    const extraFields = ['writer_name', 'files', 'correction_count', 'correction_requested_at'];

    const normalized: any = {};
    for (const key of allowed) {
      if (petition[key] !== undefined) normalized[key] = petition[key as keyof Petition];
    }
    
    // Adicionar campos extras se existirem (não fazem parte do tipo Petition mas podem existir no banco)
    for (const key of extraFields) {
      if ((petition as any)[key] !== undefined) {
        normalized[key] = (petition as any)[key];
      }
    }
    
    // LOG PARA DEBUG DO DEADLINE
    console.log('🔍 DatabaseService.createPetition:', {
      originalDeadline: petition.deadline,
      normalizedDeadline: normalized.deadline,
      petitionData: petition
    });

    // Defaults and normalization
    normalized.status = (normalized.status || 'pending').toString().toLowerCase();
    const rawPriority = (normalized.priority || 'normal').toString().toLowerCase();
    const normalizePriority = (p: string) => {
      if (['normal','urgent','express'].includes(p)) return p;
      if (p.includes('alta') || p.includes('high') || p.includes('urgente')) return 'urgent';
      if (p.includes('express')) return 'express';
      if (p.includes('baixa') || p.includes('padr') || p.includes('padrao') || p.includes('média') || p.includes('media') || p.includes('medio') || p.includes('médio')) return 'normal';
      return 'normal';
    };
    normalized.priority = normalizePriority(rawPriority);
    if (normalized.files === undefined) normalized.files = [];

    const { data, error } = await supabase
      .from('petitions')
      .insert(normalized)
      .select()
      .single();

    if (error) {
      console.error('Error creating petition:', error);
      // Fallback via RPC com SECURITY DEFINER (quando RLS bloqueia 42501)
      if ((error as any).code === '42501') {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('create_petition_public', {
            p_client_id: normalized.client_id,
            p_title: normalized.title,
            p_description: normalized.description,
            p_type: normalized.type,
            p_status: normalized.status,
            p_priority: normalized.priority,
            p_price: normalized.price ?? 0,
            p_deadline: normalized.deadline,
            p_assigned_writer_id: normalized.assigned_writer_id ?? null,
            p_files: normalized.files ?? []
          });

          if (rpcError) {
            console.error('RPC create_petition_public failed:', rpcError);
            return null;
          }
          
          // Enviar email de nova petição ao cliente (via RPC)
          if (rpcData) {
            this.sendNewPetitionEmail(rpcData as unknown as Petition, normalized.client_id);
            this.queuePetitionAvailableNotifications(rpcData as unknown as Petition);
          }
          
          return rpcData as unknown as Petition;
        } catch (rpcCatch) {
          console.error('RPC call exception:', rpcCatch);
          return null;
        }
      }
      return null;
    }

    // Enviar email de nova petição ao cliente
    if (data) {
      this.sendNewPetitionEmail(data, normalized.client_id);
      this.queuePetitionAvailableNotifications(data);
      
      // Notificar admins sobre nova petição pendente
      this.notifyAllAdmins({
        title: '📋 Nova Petição Criada',
        message: `Nova petição "${data.title || 'Sem título'}" foi criada e está aguardando atribuição.`,
        type: 'petition',
        priority: 'normal',
        is_read: false,
        related_entity_type: 'petition',
        related_entity_id: data.id,
      }).catch(err => {
        if (import.meta.env.DEV) {
          console.error('Erro ao notificar admins sobre nova petição:', err);
        }
      });
    }

    return data;
  }

  // Função auxiliar para enviar email de nova petição
  private static async sendNewPetitionEmail(petition: Petition, clientId: string): Promise<void> {
    try {
      // Buscar dados do cliente
      const { data: clientProfile } = await supabase
        .from('user_profiles')
        .select('email, full_name, company_name')
        .eq('firebase_uid', clientId)
        .single();
      
      if (clientProfile?.email) {
        const clientName = clientProfile.full_name || clientProfile.company_name || clientProfile.email.split('@')[0];
        const petitionId = petition.display_id || petition.id;
        const deadline = petition.deadline
          ? new Date(petition.deadline).toLocaleDateString('pt-BR')
          : undefined;
        
        await EmailService.sendNewPetitionEmail(
          clientProfile.email,
          clientName,
          petition.title,
          petitionId,
          deadline
        );
        console.log('📧 Email de nova petição enviado para:', clientProfile.email);
      }
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email de nova petição:', emailError);
      // Não falhar a criação da petição se o email falhar
    }
  }

  static async acceptPetition(petitionId: string, writerId: string): Promise<boolean> {
    const writerName = await (async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('firebase_uid', writerId)
          .single();

        return data?.full_name || data?.email?.split('@')[0] || 'Redator';
      } catch (err) {
        console.warn('⚠️ Não foi possível carregar nome do redator:', err);
        return 'Redator';
      }
    })();

    const { error } = await supabase
      .from('petitions')
      .update({ 
        assigned_writer_id: writerId, 
        writer_name: writerName,
        status: 'in_progress' // Redator aceita = em desenvolvimento
      })
      .eq('id', petitionId)
      .in('status', ['pending', 'available']);

    if (error) {
      console.error('Error accepting petition:', error);
      return false;
    }

    // 🚀 FASE 3: Criar conversa automática entre cliente e redator
    try {
      await this.createConversationForAcceptedPetition(petitionId, writerId);
    } catch (conversationError) {
      console.error('Erro ao criar conversa automática:', conversationError);
      // Não falha a aceitação da petição se a conversa falhar
    }

    // Enviar emails de aceite de petição
    try {
      await this.sendPetitionAcceptedEmails(petitionId, writerId);
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar emails de aceite:', emailError);
      // Não falhar a aceitação se o email falhar
    }

    return true;
  }

  // Função auxiliar para enviar emails quando petição é aceita
  static async sendPetitionAcceptedEmails(petitionId: string, writerId: string): Promise<void> {
    try {
      // Buscar dados da petição, cliente e redator
      const { data: petition } = await supabase
        .from('petitions')
        .select('*, client_id, title, deadline, price, display_id')
        .eq('id', petitionId)
        .single();
      
      if (!petition) return;
      
      const { data: clientProfile } = await supabase
        .from('user_profiles')
        .select('email, full_name, company_name')
        .eq('firebase_uid', petition.client_id)
        .single();
      
      const { data: writerProfile } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('firebase_uid', writerId)
        .single();
      
      const petitionDisplayId = petition.display_id || petition.id;
      const deadline = petition.deadline
        ? new Date(petition.deadline).toLocaleDateString('pt-BR')
        : 'Prazo a definir';
      
      // 1. Notificar CLIENTE que redator aceitou a petição
      if (clientProfile?.email) {
        const clientName = clientProfile.full_name || clientProfile.company_name || clientProfile.email.split('@')[0];
        const writerName = writerProfile?.full_name || 'Redator';
        
        await EmailService.sendClientPetitionAcceptedEmail(
          clientProfile.email,
          clientName,
          petitionDisplayId,
          petition.title,
          writerName,
          deadline
        );
        console.log('📧 Email de aceite enviado ao cliente:', clientProfile.email);
      }
      
      // 2. Enviar CONFIRMAÇÃO ao REDATOR que aceitou
      if (writerProfile?.email) {
        const writerName = writerProfile.full_name || writerProfile.email.split('@')[0];
        
        const petitionValueFormatter = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        const petitionValue = (() => {
          if (typeof petition.price === 'number') {
            return petitionValueFormatter.format(petition.price);
          }
          if (typeof petition.price === 'string') {
            const cleaned = petition.price.replace(/[^\d,.-]/g, '').replace(',', '.');
            const numeric = Number(cleaned);
            return Number.isFinite(numeric)
              ? petitionValueFormatter.format(numeric)
              : petition.price;
          }
          return petitionValueFormatter.format(0);
        })();

        await EmailService.sendWriterAcceptedPetitionEmail(
          writerProfile.email,
          writerName,
          petitionDisplayId,
          petition.title,
          petitionValue,
          deadline,
          clientProfile?.full_name || clientProfile?.company_name || clientProfile?.email?.split('@')[0]
        );
        console.log('📧 Email de confirmação enviado ao redator:', writerProfile.email);
      }

      await this.queuePetitionAssignmentNotification(petition, writerId);
    } catch (error) {
      console.error('⚠️ Erro ao enviar emails de aceite:', error);
      throw error;
    }
  }

  static async resendPetitionAcceptedEmails(petitionId: string): Promise<boolean> {
    try {
      const { data: petition, error } = await supabase
        .from('petitions')
        .select('assigned_writer_id')
        .eq('id', petitionId)
        .single();

      if (error) {
        console.error('⚠️ Erro ao buscar petição para reenviar emails de aceite:', error);
        return false;
      }

      if (!petition?.assigned_writer_id) {
        console.warn('⚠️ Petição sem redator atribuído, não é possível reenviar emails de aceite.');
        return false;
      }

      await this.sendPetitionAcceptedEmails(petitionId, petition.assigned_writer_id);
      return true;
    } catch (error) {
      console.error('⚠️ Erro inesperado ao reenviar emails de aceite:', error);
      return false;
    }
  }
  private static async queuePetitionAvailableNotifications(petition: Petition): Promise<void> {
    try {
      const { data: writers } = await supabase
        .from('user_profiles')
        .select('firebase_uid, full_name, email')
        .eq('role', 'writer')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('🛰️ queuePetitionAvailableNotifications -> writers encontrados:', writers?.length ?? 0);

      if (!writers || writers.length === 0) {
        return;
      }

      const notifications = [];
      const emailPromises: Promise<boolean>[] = [];
      for (const writer of writers) {
        if (!writer?.firebase_uid) continue;

        const { data: existing } = await supabase
          .from('app_2d8133c678_notifications')
          .select('id')
          .eq('user_id', writer.firebase_uid)
          .eq('type', 'petition_available')
          .eq('related_entity_id', petition.id)
          .maybeSingle();

        if (existing) {
          continue;
        }

        notifications.push({
          user_id: writer.firebase_uid,
          type: 'petition_available',
          title: 'Nova petição disponível',
          body: `A petição "${petition.title || 'Sem título'}" está aguardando um redator.`, // Banco usa 'body'
          priority: 'normal' as const,
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: petition.id,
        });

        if (writer.email) {
          console.log('📧 Disparando email de petição disponível para:', writer.email);
          const writerName = writer.full_name || writer.email.split('@')[0];
          emailPromises.push(
            EmailService.sendAvailablePetitionsEmail(writer.email, writerName, 1).catch(err => {
              console.error('⚠️ Erro ao enviar email de petição disponível:', err);
              return false;
            })
          );
        }
      }

      if (notifications.length > 0) {
        await supabase
          .from('app_2d8133c678_notifications')
          .insert(notifications);
      }

      if (emailPromises.length > 0) {
        await Promise.all(emailPromises);
      }
    } catch (error) {
      console.error('⚠️ Erro ao gerar notificações de petições disponíveis:', error);
    }
  }

  private static async queuePetitionAssignmentNotification(petition: Petition, writerId: string): Promise<void> {
    try {
      if (!writerId) return;

      const { data: existing } = await supabase
        .from('app_2d8133c678_notifications')
        .select('id')
        .eq('user_id', writerId)
        .eq('type', 'petition')
        .eq('related_entity_id', petition.id)
        .maybeSingle();

      if (existing) {
        return;
      }

      await supabase
        .from('app_2d8133c678_notifications')
        .insert({
          user_id: writerId,
          type: 'petition',
          title: 'Nova petição atribuída',
          body: `Você foi designado para a petição "${petition.title || 'Sem título'}".`, // Banco usa 'body'
          priority: 'normal',
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: petition.id,
          meta: {
            petitionId: petition.id,
            deadline: petition.deadline || null
          }
        });
    } catch (error) {
      console.error('⚠️ Erro ao registrar notificação de petição atribuída:', error);
    }
  }


  // 🚀 FASE 3: Criação automática de conversas para petições aceitas
  static async createConversationForAcceptedPetition(petitionId: string, writerId: string): Promise<void> {
    try {
      console.log('🔍 Criando conversa automática para petição aceita:', { petitionId, writerId });

      // 1. Buscar dados da petição
      const { data: petition, error: petitionError } = await supabase
        .from('petitions')
        .select('id, display_id, title, client_id, client_name, assigned_writer_id')
        .eq('id', petitionId)
        .single();

      if (petitionError || !petition) {
        throw new Error(`Petição não encontrada: ${petitionError?.message}`);
      }

      const clientId = petition.client_id;
      const title = petition.client_name || 'Cliente';

      console.log('📋 Dados da petição:', { clientId, writerId, title });

      // 2. Verificar se já existe conversa entre cliente e redator
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select(`
          id, title, metadata,
          conversation_participants!inner(user_id, role)
        `)
        .eq('type', 'petition')
        .neq('status', 'archived')
        .neq('status', 'closed');

      // Filtrar conversas onde ambos os usuários são participantes
      const existingConversation = existingConversations?.find(conv => {
        const participants = conv.conversation_participants;
        const userIds = participants.map((p: any) => p.user_id);
        return userIds.includes(clientId) && userIds.includes(writerId);
      });

      if (existingConversation) {
        console.log('✅ Conversa já existe:', existingConversation.id);
        // Garantir que metadata possui display_id
        await supabase
          .from('conversations')
          .update({
            metadata: {
              ...(existingConversation.metadata || {}),
              petitionId: petition.id,
              petitionDisplayId: petition.display_id || petition.id
            }
          })
          .eq('id', existingConversation.id);
        return;
      }

      // 3. Criar nova conversa
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          title,
          type: 'petition',
          status: 'active',
          priority: 'normal',
          created_by: writerId,
          metadata: {
            petitionId: petition.id,
            petitionDisplayId: petition.display_id || petition.id
          }
        })
        .select('id')
        .single();

      if (conversationError || !conversation) {
        throw new Error(`Erro ao criar conversa: ${conversationError?.message}`);
      }

      console.log('✅ Conversa criada:', conversation.id);

      // 4. Adicionar participantes
      const participants = [
        { conversation_id: conversation.id, user_id: clientId, role: 'client' },
        { conversation_id: conversation.id, user_id: writerId, role: 'writer' }
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) {
        throw new Error(`Erro ao adicionar participantes: ${participantsError.message}`);
      }

      console.log('✅ Participantes adicionados');

      // 5. Enviar mensagem inicial automática
      const welcomeMessage = `Olá! Sua petição "${petition.title}" foi aceita e estou aqui para ajudá-lo. Vamos trabalhar juntos para criar o melhor documento jurídico possível!`;
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: writerId,
          content: welcomeMessage,
          message_type: 'text'
        });

      if (messageError) {
        console.warn('⚠️ Erro ao enviar mensagem inicial:', messageError);
        // Não falha a criação da conversa se a mensagem falhar
      } else {
        console.log('✅ Mensagem inicial enviada');
      }

      console.log('🎉 Conversa automática criada com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao criar conversa automática:', error);
      throw error;
    }
  }

  // WRITER APPLICATIONS
  static async applyToPetition(petitionId: string, writerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('app_2d8133c678_writer_applications')
      .insert({
        petition_id: petitionId,
        writer_id: writerId,
        status: 'pending'
      });

    if (error) {
      console.error('Error applying to petition:', error);
      return false;
    }

    return true;
  }

  static async getWriterApplications(writerId: string): Promise<WriterApplication[]> {
    const { data, error } = await supabase
      .from('app_2d8133c678_writer_applications')
      .select('*')
      .eq('writer_id', writerId)
      .order('application_date', { ascending: false });

    if (error) {
      console.error('Error fetching writer applications:', error);
      return [];
    }

    return data || [];
  }

  // NOTIFICATIONS
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('app_2d8133c678_notifications')
      .select('id, user_id, title, body, type, priority, is_read, related_entity_type, related_entity_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100); // Limitar a 100 notificações mais recentes para performance

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    // Mapear 'body' do banco para 'message' da interface
    return (data || []).map((n: any) => ({
      ...n,
      message: n.body || n.message || '', // Suporta ambos os campos
    }));
  }

  /**
   * Notificar todos os administradores sobre um evento importante
   */
  static async notifyAllAdmins(notification: Omit<Notification, 'id' | 'created_at' | 'user_id'>): Promise<boolean> {
    try {
      // Buscar todos os admins ativos
      const { data: admins, error: adminsError } = await supabase
        .from('user_profiles')
        .select('firebase_uid')
        .eq('role', 'admin')
        .eq('is_active', true)
        .limit(50); // Limitar para performance

      if (adminsError) {
        console.error('Error fetching admins for notification:', adminsError);
        return false;
      }

      if (!admins || admins.length === 0) {
        if (import.meta.env.DEV) {
          console.warn('No active admins found to notify');
        }
        return true; // Não é erro se não houver admins
      }

      // Criar notificação para cada admin (mapear 'message' para 'body' no banco)
      const notifications = admins.map(admin => ({
        user_id: admin.firebase_uid,
        title: notification.title,
        body: notification.message, // Banco usa 'body', interface usa 'message'
        type: notification.type,
        priority: notification.priority,
        is_read: notification.is_read,
        related_entity_type: notification.related_entity_type,
        related_entity_id: notification.related_entity_id,
      }));

      // Inserir todas as notificações de uma vez (mais eficiente)
      const { error: insertError } = await supabase
        .from('app_2d8133c678_notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating admin notifications:', insertError);
        return false;
      }

      if (import.meta.env.DEV) {
        console.log(`✅ Notificações criadas para ${admins.length} admin(s):`, notification.title);
      }

      return true;
    } catch (error) {
      console.error('Error in notifyAllAdmins:', error);
      return false;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('app_2d8133c678_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('app_2d8133c678_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('app_2d8133c678_notifications')
      .insert(notification);

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  }

  // PAYMENTS
  static async getWriterPayments(writerId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('app_2d8133c678_payments')
        .select(`
          *,
          petition:petitions(title, client_name)
        `)
        .eq('writer_id', writerId)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe, retornar array vazio com mensagem clara
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('⚠️ Tabela app_2d8133c678_payments não existe no banco. Execute o script SQL para criá-la.');
          return [];
        }
        console.error('❌ Error fetching writer payments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Exception in getWriterPayments:', error);
      return [];
    }
  }

  static async getWriterMonthlyPayments(writerId: string): Promise<MonthlyPayment[]> {
    try {
      const { data, error } = await supabase
        .from('writer_monthly_payments')
        .select('*')
        .eq('writer_id', writerId)
        .order('reference_year', { ascending: false })
        .order('reference_month', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('⚠️ Tabela writer_monthly_payments não existe no banco. Execute o script SQL para criá-la.');
          return [];
        }
        console.error('❌ Error fetching monthly payments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Exception in getWriterMonthlyPayments:', error);
      return [];
    }
  }

  static async getClientPayments(clientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('app_2d8133c678_payments')
      .select(`
        *,
        petition:petitions(title)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client payments:', error);
      return [];
    }

    return (data || []) as Payment[];
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('app_2d8133c678_payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    return data;
  }

  // REAL-TIME SUBSCRIPTIONS
  static subscribeToAvailablePetitions(
    callback: (petitions: Petition[]) => void,
    writerUid?: string,
    useSpecialtyFilter: boolean = false
  ) {
    const subscription = supabase
      .channel('available-petitions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'petitions'
          // Removido filtro de status - pega todas as mudanças e filtra no código
        },
        () => {
          // Refresh data when changes occur
          this.getAvailablePetitions(writerUid, useSpecialtyFilter).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  static subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const subscription = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_2d8133c678_notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh notifications when changes occur
          this.getUserNotifications(userId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  static subscribeToWriterPetitions(writerId: string, callback: (petitions: Petition[]) => void) {
    const subscription = supabase
      .channel(`writer-petitions-${writerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'petitions',
          filter: `assigned_writer_id=eq.${writerId}`
        },
        () => {
          // Refresh writer petitions when changes occur
          this.getWriterPetitions(writerId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  // WRITER RATINGS
  static async getWriterRatingStats(writerId: string): Promise<WriterRatingStats> {
    // 🔄 BUSCAR MÉDIA JÁ CALCULADA DE profiles_v2 (mais eficiente e consistente)
    const { data: profile, error: profileError } = await supabase
      .from('profiles_v2')
      .select('id, average_rating, total_ratings, firebase_uid')
      .eq('firebase_uid', writerId)
      .single();

    if (profileError) {
      console.error('Error fetching writer profile ratings:', profileError);
    }

    // Se temos dados em profiles_v2, usar eles (fonte de verdade)
    if (profile && profile.average_rating !== null) {
      // ✅ CORREÇÃO: writer_id na tabela pode ser UUID ou firebase_uid (TEXT)
      // Vamos tentar com firebase_uid primeiro (padrão mais comum)
      
      let ratingsData: any[] = [];
      let ratingsError: any = null;
      
      // Tentar buscar com firebase_uid (TEXT)
      const responseFbUid = await supabase
        .from('app_2d8133c678_writer_ratings')
        .select('rating')
        .eq('writer_id', writerId);
      
      if (responseFbUid.data && responseFbUid.data.length > 0) {
        ratingsData = responseFbUid.data;
      } else {
        // Fallback: Tentar com profile.id (UUID)
        const responseProfileId = await supabase
          .from('app_2d8133c678_writer_ratings')
          .select('rating')
          .eq('writer_id', profile.id);
        
        ratingsData = responseProfileId.data || [];
        ratingsError = responseProfileId.error;
      }

      if (ratingsError) {
        console.error('❌ Error fetching ratings distribution:', ratingsError);
      }

      const ratingDistribution: { [key: number]: number } = {};
      (ratingsData || []).forEach(r => {
        ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
      });

      console.log('📊 Rating distribution for', writerId);
      console.log('   - Firebase UID:', writerId);
      console.log('   - Profile ID (UUID):', profile.id);
      console.log('   - Distribution:', ratingDistribution);
      console.log('   - Ratings found:', ratingsData?.length || 0);
      
      if ((ratingsData?.length || 0) === 0 && profile.total_ratings > 0) {
        console.warn('⚠️ ATENÇÃO: profiles_v2 diz que há', profile.total_ratings, 'ratings, mas a query retornou 0!');
        console.warn('   Verifique se RLS está desabilitado na tabela app_2d8133c678_writer_ratings');
      }

      return {
        average_rating: Number(profile.average_rating),
        total_ratings: profile.total_ratings || 0,
        rating_distribution: ratingDistribution
      };
    }

    // Fallback: Calcular manualmente se não tiver em profiles_v2
    const { data, error } = await supabase
      .from('app_2d8133c678_writer_ratings')
      .select('rating')
      .eq('writer_id', writerId);

    if (error) {
      console.error('Error fetching writer ratings:', error);
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {}
      };
    }

    const ratings = data || [];
    const totalRatings = ratings.length;
    
    if (totalRatings === 0) {
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {}
      };
    }

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    const ratingDistribution: { [key: number]: number } = {};
    ratings.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    return {
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      total_ratings: totalRatings,
      rating_distribution: ratingDistribution
    };
  }

  static async getWriterRatings(writerId: string): Promise<WriterRating[]> {
    const { data, error } = await supabase
      .from('app_2d8133c678_writer_ratings')
      .select(`
        *,
        petition:petitions(title)
      `)
      .eq('writer_id', writerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching writer ratings:', error);
      return [];
    }

    return (data || []) as WriterRating[];
  }

  static async createWriterRating(rating: Omit<WriterRating, 'id' | 'created_at' | 'updated_at'>): Promise<WriterRating | null> {
    const { data, error } = await supabase
      .from('app_2d8133c678_writer_ratings')
      .insert(rating)
      .select()
      .single();

    if (error) {
      console.error('Error creating writer rating:', error);
      return null;
    }

    return data;
  }

  static async hasClientRatedPetition(clientId: string, petitionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('app_2d8133c678_writer_ratings')
      .select('id')
      .eq('client_id', clientId)
      .eq('petition_id', petitionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing rating:', error);
      return false;
    }

    return !!data;
  }

  static async getCompletedPetitionsForRating(clientId: string): Promise<Petition[]> {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed petitions:', error);
      return [];
    }

    // Filter out petitions already rated
    const petitionsToRate = [];
    for (const petition of data || []) {
      const hasRated = await this.hasClientRatedPetition(clientId, petition.id);
      if (!hasRated) {
        petitionsToRate.push(petition);
      }
    }

    return petitionsToRate;
  }

  static subscribeToWriterRatings(writerId: string, callback: (stats: WriterRatingStats) => void) {
    const subscription = supabase
      .channel(`writer-ratings-${writerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_2d8133c678_writer_ratings',
          filter: `writer_id=eq.${writerId}`
        },
        () => {
          // Refresh writer ratings when changes occur
          this.getWriterRatingStats(writerId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }
}