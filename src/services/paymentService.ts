import { supabase } from '@/lib/supabaseClient';

export interface PaymentValidation {
  hasActivePlan: boolean;
  planCode: string | null;
  status: string | null;
  daysRemaining: number | null;
  currentPeriodEnd: string | null;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  sessionId: string;
}

export class PaymentService {
  /**
   * Verificar se usuário tem plano ativo
   */
  static async userHasActivePlan(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('user_has_active_plan', { p_user_id: userId });

      if (error) {
        console.error('Erro ao verificar plano ativo:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro ao verificar plano ativo:', error);
      return false;
    }
  }

  /**
   * Obter plano atual do usuário
   */
  static async getUserCurrentPlan(userId: string): Promise<PaymentValidation> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_current_plan', { p_user_id: userId });

      if (error) {
        console.error('Erro ao obter plano atual:', error);
        return {
          hasActivePlan: false,
          planCode: null,
          status: null,
          daysRemaining: null,
          currentPeriodEnd: null
        };
      }

      if (data && data.length > 0) {
        const plan = data[0];
        return {
          hasActivePlan: true,
          planCode: plan.plan_code,
          status: plan.status,
          daysRemaining: plan.days_remaining,
          currentPeriodEnd: plan.current_period_end
        };
      }

      return {
        hasActivePlan: false,
        planCode: null,
        status: null,
        daysRemaining: null,
        currentPeriodEnd: null
      };
    } catch (error) {
      console.error('Erro ao obter plano atual:', error);
      return {
        hasActivePlan: false,
        planCode: null,
        status: null,
        daysRemaining: null,
        currentPeriodEnd: null
      };
    }
  }

  /**
   * Verificar status de pagamento de uma sessão
   */
  static async getCheckoutSessionStatus(sessionId: string): Promise<{
    status: string;
    paymentStatus: string;
    subscriptionId: string | null;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_checkout_sessions')
        .select('payment_status, subscription_id')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Erro ao verificar status da sessão:', error);
        return null;
      }

      return {
        status: 'completed',
        paymentStatus: data.payment_status,
        subscriptionId: data.subscription_id
      };
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
      return null;
    }
  }

  /**
   * Obter histórico de pagamentos do usuário
   */
  static async getUserPaymentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('stripe_checkout_sessions')
        .select('*')
        .eq('user_id', userId.toUpperCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao obter histórico de pagamentos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao obter histórico de pagamentos:', error);
      return [];
    }
  }

  /**
   * Cancelar assinatura
   */
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Atualizar status no banco local
      const { error } = await supabase
        .from('user_subscriptions_active')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

      if (error) {
        console.error('Erro ao cancelar assinatura:', error);
        return false;
      }

      // Aqui você chamaria a API do Stripe para cancelar realmente
      // await fetch('/api/stripe/cancel-subscription', {
      //   method: 'POST',
      //   body: JSON.stringify({ subscriptionId })
      // });

      return true;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return false;
    }
  }

  /**
   * Reativar assinatura cancelada
   */
  static async reactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Atualizar status no banco local
      const { error } = await supabase
        .from('user_subscriptions_active')
        .update({ 
          status: 'active',
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

      if (error) {
        console.error('Erro ao reativar assinatura:', error);
        return false;
      }

      // Aqui você chamaria a API do Stripe para reativar realmente
      // await fetch('/api/stripe/reactivate-subscription', {
      //   method: 'POST',
      //   body: JSON.stringify({ subscriptionId })
      // });

      return true;
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
      return false;
    }
  }

  /**
   * Verificar limites do plano atual
   */
  static async getPlanLimits(userId: string): Promise<{
    petitionsLimit: number;
    petitionsUsed: number;
    apiAccess: boolean;
    supportLevel: string;
  }> {
    try {
      const planInfo = await this.getUserCurrentPlan(userId);
      
      if (!planInfo.hasActivePlan) {
        // Plano gratuito
        return {
          petitionsLimit: 1,
          petitionsUsed: 0, // Seria calculado baseado nas petições do usuário
          apiAccess: false,
          supportLevel: 'basic'
        };
      }

      // Definir limites baseados no plano
      const limits = {
        starter: {
          petitionsLimit: 10,
          apiAccess: false,
          supportLevel: 'basic'
        },
        professional: {
          petitionsLimit: 50,
          apiAccess: true,
          supportLevel: 'priority'
        },
        premium: {
          petitionsLimit: 999999,
          apiAccess: true,
          supportLevel: 'dedicated'
        }
      };

      const planLimits = limits[planInfo.planCode as keyof typeof limits] || limits.starter;

      // Aqui você calcularia as petições usadas
      const petitionsUsed = 0; // Implementar contagem real

      return {
        ...planLimits,
        petitionsUsed
      };
    } catch (error) {
      console.error('Erro ao obter limites do plano:', error);
      return {
        petitionsLimit: 1,
        petitionsUsed: 0,
        apiAccess: false,
        supportLevel: 'basic'
      };
    }
  }
}





















