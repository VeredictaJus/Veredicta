import { supabase } from '@/lib/supabaseClient';
import { EmailService } from './emailService';

// Cliente Supabase com service role para operações que precisam bypass RLS
const createServiceRoleClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;
  
  if (!serviceRoleKey) {
    console.warn('⚠️ Service role key não encontrada, usando cliente normal');
    return supabase;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export interface UserSettings {
  // Perfil
  full_name?: string;
  email: string;
  phone?: string;
  company?: string;
  document?: string;
  avatar_url?: string;
  
  // Notificações
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  
  // Segurança
  two_factor_enabled?: boolean;
  login_alerts?: boolean;
  last_password_change?: string;
  
  // Endereço de cobrança
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip_code?: string;
  billing_country?: string;
}

export interface PaymentCard {
  id: string;
  last_four: string;
  brand: string;
  expiry_month: number;
  expiry_year: number;
  holder_name: string;
  is_default: boolean;
  created_at: string;
}

export interface UserPlan {
  id: string;
  plan_code: string;
  name: string;
  price: number;
  features: string[];
  petitions_limit: number;
  api_access: boolean;
  support_level: string;
  next_billing_date?: string;
  status: 'active' | 'cancelled' | 'expired';
}

export class UserSettingsService {
  /**
   * Buscar configurações do usuário atual
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // Buscar dados básicos do perfil
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return null;
      }

      // Buscar configurações específicas (se existir tabela separada)
      console.log('🔍 getUserSettings: Buscando configurações para usuário:', userId);
      console.log('🔍 getUserSettings: UserId original:', userId);
      console.log('🔍 getUserSettings: UserId maiúsculo:', userId.toUpperCase());
      
      // Usar ID maiúsculo pois é o que existe no banco
      const userIdUpper = userId.toUpperCase();
      console.log('🔍 getUserSettings: Usando ID maiúsculo:', userIdUpper);
      
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userIdUpper)
        .single();

      console.log('🔍 getUserSettings: Resultado da busca de configurações:', {
        settings: settings,
        error: settingsError?.message || 'Nenhum erro'
      });

      // Se não existir configurações específicas, criar automaticamente
      if (settingsError && settingsError.code === 'PGRST116') {
        console.log('🔍 getUserSettings: Configurações não encontradas, criando...');
        
        // Criar automaticamente
        const created = await this.ensureUserSettingsExists(userId);
        if (created) {
          // Buscar novamente após criar
          const { data: newSettings, error: newError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userIdUpper)
            .single();

          if (!newError && newSettings) {
            console.log('✅ Configurações criadas e carregadas com sucesso');
            // Usar as configurações recém-criadas
            return newSettings;
          }
        }
      } else if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao buscar configurações do usuário:', settingsError);
      }

      const result = {
        full_name: settings?.full_name || profile?.full_name || '',
        email: profile?.email || '',
        phone: settings?.phone || profile?.phone || '',
        company: settings?.company || '',
        document: settings?.document || '',
        avatar_url: settings?.avatar_url || profile?.avatar_url || '',
        
        // Configurações padrão se não existirem
        email_notifications: settings?.email_notifications ?? true,
        push_notifications: settings?.push_notifications ?? false,
        sms_notifications: settings?.sms_notifications ?? true,
        
        two_factor_enabled: settings?.two_factor_enabled ?? false,
        login_alerts: settings?.login_alerts ?? true,
        last_password_change: settings?.last_password_change || null,
        
        billing_street: settings?.billing_street || '',
        billing_city: settings?.billing_city || '',
        billing_state: settings?.billing_state || '',
        billing_zip_code: settings?.billing_zip_code || '',
        billing_country: settings?.billing_country || 'Brasil'
      };

      console.log('🔍 getUserSettings: Dados de billing retornados:', {
        billing_street: result.billing_street,
        billing_city: result.billing_city,
        billing_state: result.billing_state,
        billing_zip_code: result.billing_zip_code,
        billing_country: result.billing_country
      });
      
      // Log adicional para debug
      console.log('🔍 getUserSettings: Dados brutos do settings:', settings);
      console.log('🔍 getUserSettings: UserId usado na busca:', userIdUpper);

      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações do usuário:', error);
      return null;
    }
  }

  /**
   * Garantir que user_settings existe para o usuário
   */
  static async ensureUserSettingsExists(userId: string): Promise<boolean> {
    try {
      const userIdUpper = userId.toUpperCase();
      console.log('🔍 ensureUserSettingsExists: Garantindo existência para:', userIdUpper);

      // Estratégia mais robusta: upsert para garantir que o registro existe
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { 
            user_id: userIdUpper,
            full_name: '',
            phone: '',
            company: '',
            document: '',
            avatar_url: '',
            email_notifications: true,
            push_notifications: false,
            sms_notifications: true,
            two_factor_enabled: false,
            login_alerts: true,
            billing_street: null,
            billing_city: null,
            billing_state: null,
            billing_zip_code: null,
            billing_country: 'Brasil'
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        // Tratar conflitos como sucesso (já existe)
        const isConflict = error.code === '23505' ||
                           /duplicate key value/i.test(error.message || '');
        if (isConflict) {
          console.log('✅ user_settings já existia (conflito tratado como sucesso)');
          return true;
        }
        console.error('❌ Erro ao garantir user_settings:', error);
        return false;
      }

      console.log('✅ user_settings verificado/criado com sucesso (sem conflito)');
      return true;
    } catch (error) {
      console.error('❌ Erro em ensureUserSettingsExists:', error);
      return false;
    }
  }

  /**
   * Atualizar configurações do usuário
   */
  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      console.log('🔍 UserSettingsService.updateUserSettings:', { userId, settings });
      
      // Garantir que user_settings existe
      const settingsExists = await this.ensureUserSettingsExists(userId);
      if (!settingsExists) {
        console.error('❌ Não foi possível criar/verificar user_settings');
        return false;
      }
      
      // Separar dados do perfil (user_profiles) e configurações (user_settings)
      const profileData = {
        full_name: settings.full_name,
        email: settings.email,
        phone: settings.phone,
        avatar_url: settings.avatar_url
      };

      // Usar ID maiúsculo para consistência com o banco
      const userIdUpper = userId.toUpperCase();
      console.log('🔍 updateUserSettings: Usando ID maiúsculo:', userIdUpper);
      
      const settingsData = {
        user_id: userIdUpper,
        full_name: settings.full_name,
        phone: settings.phone,
        company: settings.company,
        document: settings.document,
        avatar_url: settings.avatar_url,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        sms_notifications: settings.sms_notifications,
        two_factor_enabled: settings.two_factor_enabled,
        login_alerts: settings.login_alerts,
        last_password_change: settings.last_password_change,
        billing_street: settings.billing_street,
        billing_city: settings.billing_city,
        billing_state: settings.billing_state,
        billing_zip_code: settings.billing_zip_code,
        billing_country: settings.billing_country
      };

      // Atualizar perfil (apenas campos que existem em user_profiles)
      console.log('🔍 Atualizando perfil com dados:', profileData);
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('firebase_uid', userId);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        return false;
      }
      console.log('✅ Perfil atualizado com sucesso');

      // Verificar se a tabela user_settings existe primeiro
      const { error: checkError } = await supabase
        .from('user_settings')
        .select('user_id')
        .limit(1);

      if (checkError) {
        console.error('❌ Erro ao verificar tabela user_settings:', checkError);
        console.error('❌ Detalhes do erro:', {
          code: checkError.code,
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint
        });
        
        if (checkError.code === '42P01' || 
            checkError.message.includes('does not exist') || 
            checkError.code === 'PGRST116' ||
            checkError.code === 'PGRST301' ||
            checkError.status === 400) {
          console.log('❌ Tabela user_settings não existe ou não está acessível');
          console.log('⚠️ Por favor, execute o script fix_user_settings_permissions.sql no Supabase SQL Editor');
          return false; // Retornar false para indicar que não foi possível salvar
        }
        
        // Para outros erros, tentar continuar
        console.log('⚠️ Erro desconhecido, tentando continuar...');
      }

      // Atualizar ou criar configurações específicas (todos os dados em user_settings)
      console.log('🔍 Atualizando configurações com dados:', settingsData);
      console.log('🔍 Dados de billing sendo salvos:', {
        billing_street: settingsData.billing_street,
        billing_city: settingsData.billing_city,
        billing_state: settingsData.billing_state,
        billing_zip_code: settingsData.billing_zip_code,
        billing_country: settingsData.billing_country
      });
      
      const { data: upsertResult, error: settingsError } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select();

      if (settingsError) {
        console.error('❌ Erro ao atualizar configurações:', settingsError);
        console.error('❌ Detalhes do erro:', {
          code: settingsError.code,
          message: settingsError.message,
          details: settingsError.details,
          hint: settingsError.hint
        });
        return false;
      }
      
      console.log('✅ Configurações atualizadas com sucesso');
      console.log('✅ Resultado do upsert:', upsertResult);
      
      // Verificar se os dados foram realmente salvos
      const { data: verificationData, error: verificationError } = await supabase
        .from('user_settings')
        .select('billing_street, billing_city, billing_state, billing_zip_code, billing_country')
        .eq('user_id', userIdUpper)
        .single();
        
      if (verificationError) {
        console.error('❌ Erro ao verificar dados salvos:', verificationError);
      } else {
        console.log('✅ Verificação dos dados salvos:', verificationData);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações do usuário:', error);
      return false;
    }
  }

  /**
   * Atualizar apenas o avatar do usuário
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      console.log('💾 [AVATAR SAVE] Atualizando avatar para usuário:', userId);
      console.log('📸 [AVATAR SAVE] Avatar URL:', avatarUrl);
      
      // Salvar em AMBAS as tabelas
      // 1. Salvar em profiles_v2 (tabela principal usada pelo chat)
      // Usar .eq() ao invés de .ilike() para evitar erro 406
      const { data: data1, error: error1 } = await supabase
        .from('profiles_v2')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('firebase_uid', userId)
        .select();

      console.log('📊 [AVATAR SAVE] Resultado profiles_v2:', {
        success: !error1,
        rowsAffected: data1?.length || 0,
        error: error1?.message
      });

      // 2. Salvar em user_profiles (tabela secundária)
      // Buscar email do usuário para incluir no upsert
      // Usar .eq() ao invés de .ilike() para evitar erro 406
      const { data: profileData } = await supabase
        .from('profiles_v2')
        .select('email')
        .eq('firebase_uid', userId)
        .maybeSingle();
      
      const { data: data2, error: error2 } = await supabase
        .from('user_profiles')
        .upsert({ 
          firebase_uid: userId,
          email: profileData?.email || '',
          avatar_url: avatarUrl 
        }, { 
          onConflict: 'firebase_uid' 
        })
        .select();

      console.log('📊 [AVATAR SAVE] Resultado user_profiles:', {
        success: !error2,
        rowsAffected: data2?.length || 0,
        error: error2?.message
      });

      // Se AMBOS falharem, retornar erro
      if (error1 && error2) {
        console.error('❌ [AVATAR SAVE] Ambos falharam:', { error1, error2 });
        return false;
      }

      console.log('✅ [AVATAR SAVE] Avatar atualizado com sucesso:', {
        profiles_v2: !error1 ? '✅' : '❌',
        user_profiles: !error2 ? '✅' : '❌'
      });
      
      return true;
    } catch (error) {
      console.error('❌ [AVATAR SAVE] Erro inesperado:', error);
      return false;
    }
  }

  /**
   * Buscar dados de uso do usuário (petições, etc.)
   */
  static async getUserUsage(userId: string): Promise<{
    petitions: number;
    petitions_limit: number;
    api_calls: number;
    storage_used: string;
  }> {
    try {
      console.log('🔍 Buscando uso do usuário:', userId);

      // Limpar o userId para remover caracteres NULL/control
      const cleanUserId = userId.trim().replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
      console.log('🔍 UserId limpo:', cleanUserId);

      // Verificar se é redator ou admin (não precisam de plano)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email, role')
        .eq('firebase_uid', userId)
        .single();

      const isWriterOrAdmin = userProfile?.email?.includes('@veredictajus.com') || 
                             userProfile?.role === 'admin' || 
                             userId === 'support-admin';

      if (isWriterOrAdmin) {
        // Para redatores/admins, contar todas as petições (sem filtro de data)
        const { count: allPetitionsCount } = await supabase
          .from('petitions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', cleanUserId);
        
        console.log('👨‍💼 Usuário é redator/admin - sem limite de petições');
        return {
          petitions: allPetitionsCount || 0,
          petitions_limit: 999999, // Ilimitado para redatores/admins
          api_calls: 0,
          storage_used: '0 MB'
        };
      }

      // Buscar plano atual para obter o limite correto (apenas clientes)
      const currentPlan = await this.getUserCurrentPlan(userId);
      console.log('📋 Plano atual:', currentPlan);

      // Se não tiver plano ativo, usar o plano FREE como padrão
      let petitionsLimit = 1; // FREE = 1 petição
      let planStartDate: Date | null = null;
      
      if (currentPlan) {
        petitionsLimit = currentPlan.petitions_limit;
        console.log('✅ Limite do plano:', petitionsLimit);
        
        // Buscar data de início do plano atual
        const { data: subscription } = await supabase
          .rpc('get_user_subscription', { p_user_id: userId })
          .maybeSingle();
        
        if (subscription?.created_at || subscription?.updated_at) {
          const subDate = subscription.updated_at || subscription.created_at;
          if (subDate) {
            planStartDate = new Date(subDate);
            console.log('📅 Data de início do plano:', planStartDate.toISOString());
          }
        }
      } else {
        console.log('⚠️ Cliente sem plano ativo, usando FREE (1 petição)');
      }

      // Buscar contagem de petições criadas APÓS o início do plano atual
      let query = supabase
        .from('petitions')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', cleanUserId);
      
      // Se tem data de início do plano, filtrar apenas petições criadas após essa data
      if (planStartDate) {
        query = query.gte('created_at', planStartDate.toISOString());
        console.log('📊 Filtrando petições criadas após:', planStartDate.toISOString());
      }
      
      const { count: petitionsCount, error: petitionsError } = await query;

      if (petitionsError) {
        console.error('Erro ao buscar petições do usuário:', petitionsError);
      }

      console.log('📊 Petições encontradas (após início do plano):', petitionsCount || 0);

      const result = {
        petitions: petitionsCount || 0,
        petitions_limit: petitionsLimit,
        api_calls: 0, // Será implementado quando houver API
        storage_used: '0 MB' // Será implementado quando houver upload de arquivos
      };

      console.log('📈 Resultado final:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar uso do usuário:', error);
      return {
        petitions: 0,
        petitions_limit: 1, // FREE como fallback
        api_calls: 0,
        storage_used: '0 MB'
      };
    }
  }

  /**
   * Exportar dados do usuário
   */
  static async exportUserData(userId: string): Promise<any> {
    try {
      // Buscar dados do perfil
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', userId)
        .single();

      // Buscar petições do usuário
      const { data: petitions } = await supabase
        .from('petitions')
        .select('*')
        .eq('client_id', userId);

      // Buscar conversas do usuário
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id)
        `)
        .eq('conversation_participants.user_id', userId);

      return {
        profile,
        petitions: petitions || [],
        conversations: conversations || [],
        exported_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao exportar dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Buscar cartões de pagamento do usuário
   */
  static async getUserPaymentCards(userId: string): Promise<PaymentCard[]> {
    try {
      const { data, error } = await supabase
        .from('user_payment_cards')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existir, retornar array vazio silenciosamente
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Tabela de cartões não configurada ainda, retornando lista vazia');
          return [];
        }
        console.error('Erro ao buscar cartões do usuário:', error);
        return [];
      }

      return (data || []).map(card => ({
        id: card.id,
        last_four: card.last_four,
        brand: card.brand,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
        holder_name: card.holder_name,
        is_default: card.is_default,
        created_at: card.created_at
      }));
    } catch (error) {
      console.error('Erro ao buscar cartões do usuário:', error);
      return [];
    }
  }

  /**
   * Adicionar novo cartão de pagamento
   */
  static async addPaymentCard(userId: string, cardData: {
    last_four: string;
    brand: string;
    expiry_month: number;
    expiry_year: number;
    holder_name: string;
  }): Promise<boolean> {
    try {
      console.log('🔍 Debug addPaymentCard:');
      console.log('- userId:', userId);
      console.log('- cardData:', cardData);
      
      // Validar userId (vem do Firebase Auth)
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }
      
      console.log('✅ Usando userId do Firebase Auth:', userId);

      // Se for o primeiro cartão, marcar como padrão
      const existingCards = await this.getUserPaymentCards(userId);
      const isDefault = existingCards.length === 0;
      console.log('- existingCards count:', existingCards.length);
      console.log('- isDefault:', isDefault);

      const insertData = {
        user_id: userId,
        last_four: cardData.last_four,
        brand: cardData.brand,
        expiry_month: cardData.expiry_month,
        expiry_year: cardData.expiry_year,
        holder_name: cardData.holder_name,
        is_default: isDefault
      };
      
      console.log('- insertData:', insertData);

      // Tentar inserção normal primeiro
      console.log('🔧 Tentando inserção com cliente normal');
      
      const { data, error } = await supabase
        .from('user_payment_cards')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Erro ao adicionar cartão:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('✅ Cartão inserido com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      return false;
    }
  }

  /**
   * Definir cartão como padrão
   */
  static async setDefaultCard(userId: string, cardId: string): Promise<boolean> {
    try {
      // Primeiro, remover padrão de todos os cartões
      await supabase
        .from('user_payment_cards')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Depois, definir o novo padrão
      const { error } = await supabase
        .from('user_payment_cards')
        .update({ is_default: true })
        .eq('id', cardId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao definir cartão padrão:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao definir cartão padrão:', error);
      return false;
    }
  }

  /**
   * Remover cartão de pagamento
   */
  static async removePaymentCard(userId: string, cardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_payment_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao remover cartão:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      return false;
    }
  }

  /**
   * Buscar plano atual do usuário
   */
  static async getUserCurrentPlan(userId: string): Promise<UserPlan | null> {
    try {
      console.log('🔍 getUserCurrentPlan: Buscando plano para userId:', userId);
      
      // Usar função RPC que bypassa RLS (similar à função de atualização)
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('get_user_subscription', {
          p_user_id: userId
        });
      
      let subscription = null;
      let subscriptionError = rpcError;
      
      if (rpcResult && rpcResult.length > 0) {
        subscription = rpcResult[0];
      } else if (!rpcError) {
        // Se a função RPC não existir ainda, tentar query direta como fallback
        console.log('⚠️ getUserCurrentPlan: Função RPC não disponível, usando query direta...');
        const { data: directResult, error: directError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();
        
        subscription = directResult;
        subscriptionError = directError;
      }
      
      console.log('🔍 getUserCurrentPlan: Resultado da busca:', {
        hasSubscription: !!subscription,
        subscription: subscription,
        error: subscriptionError?.message,
        rpcUsed: !rpcError && rpcResult !== undefined
      });

      if (subscriptionError) {
        if (subscriptionError.code === 'PGRST116' || 
            subscriptionError.message.includes('relation') ||
            subscriptionError.message.includes('does not exist') ||
            subscriptionError.code === '42P01') {
          console.log('Tabela de assinaturas não configurada ainda');
          // Retornar plano gratuito como fallback
          return {
            id: 'free',
            name: 'Gratuito',
            description: 'Plano gratuito com limitações',
            price: 0,
            features: ['1 petição por mês', 'Suporte por email'],
            max_petitions: 1,
            max_storage: 100,
            is_active: true
          };
        }
        console.error('Erro ao buscar assinatura do usuário:', subscriptionError);
        return null;
      }

      if (!subscription) {
        console.log('⚠️ getUserCurrentPlan: Nenhuma assinatura ativa encontrada, retornando null');
        return null;
      }

      console.log('✅ getUserCurrentPlan: Assinatura encontrada:', {
        plan_code: subscription.plan_code,
        status: subscription.status
      });

      // Buscar dados do plano
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('plan_code', subscription.plan_code)
        .maybeSingle();
      
      console.log('🔍 getUserCurrentPlan: Dados do plano:', {
        hasPlan: !!plan,
        plan: plan,
        error: planError?.message
      });

      if (planError) {
        console.error('Erro ao buscar dados do plano:', planError);
        return null;
      }

      if (!plan) {
        const planCode = String(subscription.plan_code || '').toLowerCase();

        // Plano interno concierge pode não existir na tabela plans (fallback seguro)
        if (planCode === 'concierge') {
          return {
            id: subscription.id,
            plan_code: 'concierge',
            name: 'Concierge',
            price: 0,
            features: [],
            petitions_limit: 1,
            api_access: false,
            support_level: 'basic',
            next_billing_date: subscription.next_billing_date,
            status: subscription.status,
          };
        }

        return null;
      }

      return {
        id: subscription.id,
        plan_code: plan.plan_code,
        name: plan.name,
        price: plan.price,
        features: plan.features || [],
        petitions_limit: plan.petitions_limit || 50,
        api_access: plan.api_access || false,
        support_level: plan.support_level || 'basic',
        next_billing_date: subscription.next_billing_date,
        status: subscription.status
      };
    } catch (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      return null;
    }
  }

  /**
   * Buscar todos os planos disponíveis
   */
  static async getAvailablePlans(): Promise<UserPlan[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        // Se a tabela não existir, retornar planos padrão
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Tabela de planos não configurada ainda, usando planos padrão');
          return [
            {
              id: 'starter-uuid',
              plan_code: 'starter',
              name: 'STARTER',
              price: 2000,
              features: ['Até 10 petições/mês', 'Suporte básico', 'Templates padrão'],
              petitions_limit: 10,
              api_access: false,
              support_level: 'basic',
              status: 'active'
            },
            {
              id: 'professional-uuid',
              plan_code: 'professional',
              name: 'PROFISSIONAL',
              price: 5000,
              features: ['Até 50 petições/mês', 'Suporte prioritário', 'API Access', 'Templates premium'],
              petitions_limit: 50,
              api_access: true,
              support_level: 'priority',
              status: 'active'
            },
            {
              id: 'premium-uuid',
              plan_code: 'premium',
              name: 'PREMIUM',
              price: 10000,
              features: ['Petições ilimitadas', 'Suporte dedicado', 'API completa', 'Customização'],
              petitions_limit: 999999,
              api_access: true,
              support_level: 'dedicated',
              status: 'active'
            }
          ];
        }
        console.error('Erro ao buscar planos:', error);
        return [];
      }

      return (data || []).map(plan => ({
        id: plan.id,
        plan_code: plan.plan_code,
        name: plan.name,
        price: plan.price,
        features: plan.features || [],
        petitions_limit: plan.petitions_limit || 50,
        api_access: plan.api_access || false,
        support_level: plan.support_level || 'basic',
        status: 'active'
      }));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  }

  /**
   * Alterar plano do usuário
   */
  static async changeUserPlan(userId: string, planId: string): Promise<boolean> {
    try {
      // Verificar se a tabela user_subscriptions existe
      const { error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .limit(1);

      if (checkError && (checkError.code === '42P01' || checkError.message.includes('does not exist'))) {
        console.log('Tabela de assinaturas não configurada ainda - simulando alteração de plano');
        // Simular sucesso para não quebrar a interface
        return true;
      }

      const { data: currentSubscription } = await supabase
        .from('user_subscriptions')
        .select('plan_code, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan_id: planId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Erro ao alterar plano:', error);
        return false;
      }

      try {
        const planNameMap: Record<string, 'Free' | 'Start' | 'Pro' | 'Elite'> = {
          free: 'Free',
          gratuito: 'Free',
          start: 'Start',
          starter: 'Start',
          pro: 'Pro',
          professional: 'Pro',
          elite: 'Elite'
        };

        const { data: newPlan } = await supabase
          .from('plans')
          .select('id, plan_code, name, petitions_limit, features')
          .eq('id', planId)
          .maybeSingle();

        if (!newPlan) {
          console.warn('⚠️ Plano não encontrado após alteração:', planId);
          return true;
        }

        const newPlanCode = (newPlan.plan_code || '').toLowerCase();
        const newPlanName = planNameMap[newPlanCode as keyof typeof planNameMap];

        if (!newPlanName) {
          console.warn('⚠️ Plano sem mapeamento de email:', newPlanCode);
          return true;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email, full_name, company_name')
          .eq('firebase_uid', userId)
          .maybeSingle();

        if (!profile?.email) {
          console.warn('⚠️ Usuário sem e-mail; email de mudança de plano não enviado.');
          return true;
        }

        const clientName =
          profile.full_name ||
          profile.company_name ||
          profile.email.split('@')[0];

        const planDetails = {
          petitionsLimit: newPlan.petitions_limit ?? 0,
          features: Array.isArray(newPlan.features) ? newPlan.features as string[] : []
        };

        const oldPlanCode = (currentSubscription?.plan_code || '').toLowerCase();
        const oldPlanName = planNameMap[oldPlanCode as keyof typeof planNameMap];

        await EmailService.sendPlanRenewalOrChangeEmail(
          profile.email,
          clientName,
          newPlanName,
          planDetails,
          oldPlanName
        );
        console.log('📧 Email de alteração/renovação de plano enviado:', profile.email);
      } catch (emailError) {
        console.error('⚠️ Falha ao enviar email de alteração de plano:', emailError);
      }

      return true;
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      return false;
    }
  }

  /**
   * Cancelar plano com período de carência
   * O usuário continua tendo acesso ao plano até o fim do período pago
   */
  static async cancelPlanWithGracePeriod(userId: string, planCode: string): Promise<{
    success: boolean;
    message: string;
    expires_at?: string;
    days_remaining?: number;
  }> {
    try {
      console.log('🔄 Cancelando plano com período de carência:', { userId, planCode });
      
      // Chamar a função SQL que implementa a lógica de cancelamento
      const { data, error } = await supabase.rpc('cancel_subscription_with_grace_period', {
        p_user_id: userId,
        p_plan_code: planCode
      });

      if (error) {
        console.error('❌ Erro ao cancelar plano:', error);
        return {
          success: false,
          message: 'Erro ao cancelar plano. Tente novamente.'
        };
      }

      console.log('✅ Resultado do cancelamento:', data);

      // Enviar email ao cliente confirmando o cancelamento
      try {
        const planNameMap: Record<string, 'Start' | 'Pro' | 'Elite'> = {
          start: 'Start',
          pro: 'Pro',
          elite: 'Elite'
        };

        const { data: profileV2 } = await supabase
          .from('user_profiles')
          .select('email, full_name, company_name')
          .eq('firebase_uid', userId)
          .maybeSingle();

        const profile =
          profileV2 ||
          (await supabase
            .from('profiles_v2')
            .select('email, full_name, company_name')
            .eq('firebase_uid', userId)
            .maybeSingle()).data;

        const email = profile?.email;

        if (email) {
          const clientName =
            profile?.full_name ||
            profile?.company_name ||
            email.split('@')[0];

          const cancelledPlanName = planNameMap[planCode as keyof typeof planNameMap];

          if (cancelledPlanName) {
            const remainingPetitions =
              (data?.remaining_petitions as number | undefined) ??
              (data?.petitions_remaining as number | undefined) ??
              0;

            const cancellationDate = data?.expires_at
              ? new Date(data.expires_at).toLocaleDateString('pt-BR')
              : new Date().toLocaleDateString('pt-BR');

            await EmailService.sendPlanCancellationEmail(
              email,
              clientName,
              cancelledPlanName,
              remainingPetitions,
              cancellationDate
            );
            console.log('📧 Email de cancelamento de plano enviado:', email);
          } else {
            console.warn('⚠️ Plano cancelado sem template de email mapeado:', planCode);
          }
        } else {
          console.warn('⚠️ Usuário sem e-mail; email de cancelamento não enviado.');
        }
      } catch (emailError) {
        console.error('⚠️ Falha ao enviar email de cancelamento de plano:', emailError);
      }
      
      return {
        success: data.success,
        message: data.message,
        expires_at: data.expires_at,
        days_remaining: Math.floor(data.days_remaining)
      };
    } catch (error) {
      console.error('❌ Erro ao cancelar plano:', error);
      return {
        success: false,
        message: 'Erro inesperado ao cancelar plano.'
      };
    }
  }

  /**
   * Reativar plano cancelado (antes de expirar)
   */
  static async reactivateCancelledPlan(userId: string, planCode: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Reativando plano cancelado:', { userId, planCode });
      
      // Chamar a função SQL que implementa a lógica de reativação
      const { data, error } = await supabase.rpc('reactivate_cancelled_subscription', {
        p_user_id: userId,
        p_plan_code: planCode
      });

      if (error) {
        console.error('❌ Erro ao reativar plano:', error);
        return {
          success: false,
          message: 'Erro ao reativar plano. Tente novamente.'
        };
      }

      console.log('✅ Resultado da reativação:', data);
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erro ao reativar plano:', error);
      return {
        success: false,
        message: 'Erro inesperado ao reativar plano.'
      };
    }
  }

  /**
   * Verificar se usuário pode usar plano Free (apenas uma vez por CPF/CNPJ)
   */
  static async checkFreePlanUsage(userId: string): Promise<{
    can_use_free: boolean;
    reason: string;
    message?: string;
  }> {
    try {
      console.log('🔍 Verificando se usuário pode usar plano Free:', userId);
      
      // Chamar a função SQL que verifica uso do plano Free
      const { data, error } = await supabase.rpc('check_free_plan_usage', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao verificar uso do plano Free:', error);
        return {
          can_use_free: false,
          reason: 'error',
          message: 'Erro ao verificar elegibilidade para plano gratuito.'
        };
      }

      console.log('✅ Resultado da verificação Free:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar uso do plano Free:', error);
      return {
        can_use_free: false,
        reason: 'error',
        message: 'Erro inesperado ao verificar elegibilidade.'
      };
    }
  }

  /**
   * Obter status detalhado da assinatura (incluindo cancelamento pendente)
   */
  static async getSubscriptionStatus(userId: string): Promise<{
    has_subscription: boolean;
    plan_code?: string;
    status?: string;
    is_cancelled?: boolean;
    cancelled_at?: string;
    expires_at?: string;
    days_remaining?: number;
    can_reactivate?: boolean;
  }> {
    try {
      console.log('🔍 Buscando status detalhado da assinatura:', userId);
      
      // Chamar a função SQL que retorna o status detalhado
      const { data, error } = await supabase.rpc('get_subscription_status', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao buscar status da assinatura:', error);
        return {
          has_subscription: false,
          plan_code: 'free'
        };
      }

      console.log('✅ Status da assinatura:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar status da assinatura:', error);
      return {
        has_subscription: false,
        plan_code: 'free'
      };
    }
  }

  /**
   * Alterar senha do usuário (via Firebase Auth)
   */
  static async changePassword(newPassword: string, currentPassword?: string): Promise<boolean> {
    try {
      // ✅ CORREÇÃO: Usar auth exportado ao invés de getAuth() para evitar múltiplas inicializações
      const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Se a senha atual foi fornecida, fazer reautenticação
      if (currentPassword && auth.currentUser.email) {
        console.log('🔐 Fazendo reautenticação antes de alterar senha...');
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        console.log('✅ Reautenticação bem-sucedida');
      }

      console.log('🔑 Alterando senha...');
      await updatePassword(auth.currentUser, newPassword);
      
      // Atualizar data da última alteração de senha
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase
        .from('user_settings')
        .upsert({
          user_id: auth.currentUser.uid,
          last_password_change: new Date().toISOString()
        }, { onConflict: 'user_id' });

      return true;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return false;
    }
  }
}
