import { supabase } from '@/lib/supabase';
import { DatabaseService } from './databaseService';
import { EmailService } from './emailService';

interface PlanInfo {
  plan_code: string;
  plan_name: string;
  petitions_limit: number;
  next_billing_date: string | null;
  status: string;
}

interface UsageInfo {
  current: number;
  limit: number;
  percentage: number;
}

export class PlanNotificationService {
  /**
   * Verificar e criar notificação de limite próximo (80%)
   */
  static async checkAndNotifyNearLimit(userId: string): Promise<void> {
    try {
      const usage = await this.getUserUsage(userId);
      
      if (!usage) return;

      // Se atingiu 80% do limite, notificar
      if (usage.percentage >= 80 && usage.percentage < 100) {
        const existingNotification = await this.hasRecentNotification(
          userId,
          'limit_near'
        );

        if (!existingNotification) {
          // Buscar informações do plano do usuário
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('plan_code')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          if (subscription) {
            const { data: plan } = await supabase
              .from('plans')
              .select('name, price')
              .eq('plan_code', subscription.plan_code)
              .single();

            const planName = plan?.name || subscription.plan_code.toUpperCase();
            const percentage = Math.round(usage.percentage);

            await DatabaseService.createNotification({
              user_id: userId,
              title: '⚠️ Você Está Próximo do Limite',
              message: `Você usou ${usage.current} de ${usage.limit} petições do seu plano ${planName} (${percentage}%). Considere fazer upgrade para o plano Pro.`,
              type: 'limit_near',
              priority: 'high',
              is_read: false,
              related_entity_type: 'plan',
              related_entity_id: 'plan_limit'
            });
            console.log('✅ Notificação de limite próximo criada');
            
            // Se restar apenas 1 petição, enviar email de aviso
            const remainingPetitions = usage.limit - usage.current;
            if (remainingPetitions === 1) {
              try {
                const { data: userProfile } = await supabase
                  .from('user_profiles')
                  .select('email, full_name, company_name')
                  .eq('firebase_uid', userId)
                  .single();
                
                if (userProfile?.email && subscription.plan_code !== 'free') {
                  const clientName = userProfile.full_name || userProfile.company_name || userProfile.email.split('@')[0];
                  const planMap: { [key: string]: 'Start' | 'Pro' | 'Elite' } = {
                    'start': 'Start',
                    'pro': 'Pro',
                    'elite': 'Elite'
                  };
                  const currentPlanName = planMap[subscription.plan_code] || 'Start';
                  
                  await EmailService.sendPlanLimitWarningEmail(
                    userProfile.email,
                    clientName,
                    currentPlanName,
                    remainingPetitions,
                    usage.limit
                  );
                  console.log('📧 Email de aviso de limite enviado:', userProfile.email);
                }
              } catch (emailError) {
                console.error('⚠️ Erro ao enviar email de aviso de limite:', emailError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar limite próximo:', error);
    }
  }

  /**
   * Criar notificação de limite atingido (100%)
   */
  static async notifyLimitReached(userId: string, planCode: string, limit: number): Promise<void> {
    try {
      const existingNotification = await this.hasRecentNotification(
        userId,
        'limit_reached'
      );

      if (existingNotification) return;

      const { data: plan } = await supabase
        .from('plans')
        .select('name, price')
        .eq('plan_code', planCode)
        .single();

      const planName = plan?.name || planCode.toUpperCase();
      const priceText = plan?.price && plan.price > 0 ? ` (R$ ${plan.price.toFixed(2)}/mês)` : '';

      await DatabaseService.createNotification({
        user_id: userId,
        title: '⚠️ Limite de Petições Atingido',
        message: `Você atingiu o limite de ${limit} ${limit === 1 ? 'petição' : 'petições'} do plano ${planName}${priceText}. Assine um plano para continuar criando petições.`,
        type: 'limit_reached',
        priority: 'urgent',
        is_read: false,
        related_entity_type: 'plan',
        related_entity_id: 'plan_limit'
      });

      console.log('✅ Notificação de limite atingido criada');
    } catch (error) {
      console.error('Erro ao criar notificação de limite atingido:', error);
    }
  }

  /**
   * Verificar e notificar planos próximos de vencer
   */
  static async checkAndNotifyExpiringPlans(): Promise<void> {
    try {
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

      // Buscar assinaturas ativas com vencimento próximo
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
          user_id,
          plan_code,
          next_billing_date,
          status
        `)
        .eq('status', 'active')
        .not('next_billing_date', 'is', null)
        .lte('next_billing_date', in7Days.toISOString());

      if (error || !subscriptions) {
        console.error('Erro ao buscar assinaturas:', error);
        return;
      }

      for (const sub of subscriptions) {
        const expiryDate = new Date(sub.next_billing_date!);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Obter nome do plano
        const { data: plan } = await supabase
          .from('plans')
          .select('name')
          .eq('plan_code', sub.plan_code)
          .single();

        const planName = plan?.name || sub.plan_code.toUpperCase();

        // Notificar baseado em dias restantes
        if (daysUntilExpiry === 7) {
          await this.notifyExpiringPlan(sub.user_id, planName, 7, 'high', expiryDate);
        } else if (daysUntilExpiry === 3) {
          await this.notifyExpiringPlan(sub.user_id, planName, 3, 'urgent', expiryDate);
        } else if (daysUntilExpiry === 1) {
          await this.notifyExpiringPlan(sub.user_id, planName, 1, 'urgent', expiryDate);
        }
      }

      console.log(`✅ Verificação de vencimentos concluída: ${subscriptions.length} assinaturas verificadas`);
    } catch (error) {
      console.error('Erro ao verificar planos expirando:', error);
    }
  }

  /**
   * Notificar plano expirando em X dias
   */
  private static async notifyExpiringPlan(
    userId: string,
    planName: string,
    daysLeft: number,
    priority: 'normal' | 'high' | 'urgent',
    expiryDate: Date
  ): Promise<void> {
    try {
      const notificationType = `plan_expiring_${daysLeft}d`;
      const existingNotification = await this.hasRecentNotification(
        userId,
        notificationType,
        1 // 1 dia de janela para não duplicar
      );

      if (existingNotification) return;

      const formattedDate = expiryDate.toLocaleDateString('pt-BR');

      await DatabaseService.createNotification({
        user_id: userId,
        title: `⏰ Plano Expira em ${daysLeft} ${daysLeft === 1 ? 'Dia' : 'Dias'}`,
        message: `Seu plano ${planName} expira em ${formattedDate}. Renove agora para não perder o acesso aos seus benefícios.`,
        type: 'plan_expiring_soon',
        priority: priority,
        is_read: false,
        related_entity_type: 'plan',
        related_entity_id: 'plan_expiry',
        action_url: '/client/plans'
      });

      console.log(`✅ Notificação de expiração (${daysLeft} dias) criada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao criar notificação de expiração:', error);
    }
  }

  /**
   * Verificar e notificar planos expirados
   */
  static async checkAndNotifyExpiredPlans(): Promise<void> {
    try {
      const now = new Date();

      // Buscar assinaturas que venceram (status ainda 'active' mas data passou)
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
          user_id,
          plan_code,
          next_billing_date,
          status
        `)
        .eq('status', 'active')
        .not('next_billing_date', 'is', null)
        .lt('next_billing_date', now.toISOString());

      if (error || !subscriptions) {
        console.error('Erro ao buscar assinaturas expiradas:', error);
        return;
      }

      for (const sub of subscriptions) {
        // Obter nome do plano
        const { data: plan } = await supabase
          .from('plans')
          .select('name')
          .eq('plan_code', sub.plan_code)
          .single();

        const planName = plan?.name || sub.plan_code.toUpperCase();

        await this.notifyExpiredPlan(sub.user_id, planName);

        // Atualizar status da assinatura para 'expired'
        await supabase
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', sub.user_id)
          .eq('status', 'active');
      }

      console.log(`✅ Verificação de planos expirados concluída: ${subscriptions.length} planos expirados`);
    } catch (error) {
      console.error('Erro ao verificar planos expirados:', error);
    }
  }

  /**
   * Notificar plano expirado
   */
  private static async notifyExpiredPlan(userId: string, planName: string): Promise<void> {
    try {
      const existingNotification = await this.hasRecentNotification(
        userId,
        'plan_expired',
        3 // 3 dias de janela
      );

      if (existingNotification) return;

      await DatabaseService.createNotification({
        user_id: userId,
        title: '❌ Plano Expirado',
        message: `Seu plano ${planName} expirou. Renove agora para continuar usando a plataforma e criando petições.`,
        type: 'plan_expired',
        priority: 'urgent',
        is_read: false,
        related_entity_type: 'plan',
        related_entity_id: 'plan_expired',
        action_url: '/client/plans'
      });

      console.log(`✅ Notificação de plano expirado criada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao criar notificação de plano expirado:', error);
    }
  }

  /**
   * Notificar renovação de plano com sucesso
   */
  static async notifyPlanRenewed(userId: string, planCode: string, nextBillingDate: Date): Promise<void> {
    try {
      const { data: plan } = await supabase
        .from('plans')
        .select('name')
        .eq('plan_code', planCode)
        .single();

      const planName = plan?.name || planCode.toUpperCase();
      const formattedDate = nextBillingDate.toLocaleDateString('pt-BR');

      await DatabaseService.createNotification({
        user_id: userId,
        title: '✅ Plano Renovado com Sucesso',
        message: `Seu plano ${planName} foi renovado com sucesso! Válido até ${formattedDate}.`,
        type: 'plan_renewed',
        priority: 'normal',
        is_read: false,
        related_entity_type: 'plan',
        related_entity_id: 'plan_renewed'
      });

      console.log(`✅ Notificação de renovação criada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao criar notificação de renovação:', error);
    }
  }

  /**
   * Obter uso atual do usuário
   */
  private static async getUserUsage(userId: string): Promise<UsageInfo | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_petition_stats', {
        p_user_id: userId
      });

      if (error || !data) {
        console.error('Erro ao obter estatísticas de uso:', error);
        return null;
      }

      const current = data.monthly_usage || 0;
      const limit = data.total_limit || 1;
      const percentage = (current / limit) * 100;

      return {
        current,
        limit,
        percentage
      };
    } catch (error) {
      console.error('Erro ao obter uso do usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se já existe notificação recente do tipo
   */
  private static async hasRecentNotification(
    userId: string,
    notificationType: string,
    daysWindow: number = 1
  ): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

      const { data, error } = await supabase
        .from('app_2d8133c678_notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', notificationType)
        .gte('created_at', cutoffDate.toISOString())
        .limit(1);

      if (error) {
        console.error('Erro ao verificar notificações existentes:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
      return false;
    }
  }

  /**
   * Executar todas as verificações de plano
   * Pode ser chamado ao fazer login ou periodicamente
   */
  static async runAllChecks(userId?: string): Promise<void> {
    try {
      console.log('🔍 Iniciando verificações de planos...');

      if (userId) {
        // Verificações específicas do usuário
        await this.checkAndNotifyNearLimit(userId);
      }

      // Verificações globais (para todos os usuários)
      await this.checkAndNotifyExpiringPlans();
      await this.checkAndNotifyExpiredPlans();

      console.log('✅ Todas as verificações de planos concluídas');
    } catch (error) {
      console.error('Erro ao executar verificações de planos:', error);
    }
  }
}

