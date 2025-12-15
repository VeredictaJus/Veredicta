import { ClientProfile } from '@/types';
import { supabase } from '@/lib/supabase';

interface UserLimits {
  canSubmit: boolean;
  reason?: string;
  redirectTo?: string;
  usage?: number;
  limit?: number;
  remaining?: number;
  planCode?: string;
}

interface PetitionLimitInfo {
  can_submit: boolean;
  reason: string;
  message: string;
  redirect_to?: string;
  usage?: number;
  limit?: number;
  remaining?: number;
  plan_code?: string;
}

interface PetitionStats {
  plan_info: {
    plan_code: string;
    plan_name?: string;
    base_limit: number;
    bonus: number;
    total_limit: number;
    has_active_plan: boolean;
    renewed_this_month?: boolean;
  };
  monthly_usage: number;
  total_usage: number;
  credits_balance: number;
  monthly_remaining: number;
}

export class PetitionLimitService {
  /**
   * Check if the user can submit a petition based on business rules
   * This function now queries Supabase functions for real-time data
   * including plan limits with renewal bonuses
   */
  static async checkUserLimits(
    userId: string,
    clientProfile: ClientProfile | null
  ): Promise<UserLimits> {
    if (!clientProfile) {
      return {
        canSubmit: false,
        reason: 'Perfil de usuário não encontrado',
        redirectTo: '/client'
      };
    }

    try {
      // Call Supabase function to check if user can create petition
      const { data, error } = await supabase.rpc('check_user_can_create_petition', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao verificar limite de petições:', error);
        // Em caso de erro, permitir (fail-safe)
        return { canSubmit: true };
      }

      const limitInfo = data as PetitionLimitInfo;

      if (!limitInfo.can_submit) {
        return {
          canSubmit: false,
          reason: limitInfo.message,
          redirectTo: limitInfo.redirect_to || '/client/plans',
          usage: limitInfo.usage,
          limit: limitInfo.limit,
          planCode: limitInfo.plan_code
        };
      }

      return {
        canSubmit: true,
        usage: limitInfo.usage,
        limit: limitInfo.limit,
        remaining: limitInfo.remaining,
        planCode: limitInfo.plan_code
      };
    } catch (error) {
      console.error('❌ Erro ao verificar limites:', error);
      // Em caso de erro, permitir (fail-safe)
      return { canSubmit: true };
    }
  }

  /**
   * Get detailed petition statistics for a user
   * Includes plan info, usage, credits, and remaining petitions
   */
  static async getUserPetitionStats(userId: string): Promise<PetitionStats | null> {
    try {
      // Tentar função simples primeiro (conta da tabela petitions)
      const { data: simpleData, error: simpleError } = await supabase.rpc('get_user_petition_stats_simple', {
        p_user_id: userId
      });

      if (!simpleError && simpleData) {
        console.log('✅ Usando função simples para stats:', simpleData);
        return simpleData as PetitionStats;
      }

      // Fallback para função original
      const { data, error } = await supabase.rpc('get_user_petition_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao buscar estatísticas de petições:', error);
        return null;
      }

      return data as PetitionStats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return null;
    }
  }

  /**
   * Get the user's petition limit (including renewal bonuses)
   */
  static async getUserPetitionLimit(userId: string): Promise<{
    planCode: string;
    planName?: string;
    baseLimit: number;
    bonus: number;
    totalLimit: number;
    hasActivePlan: boolean;
    renewedThisMonth?: boolean;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_petition_limit', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao buscar limite de petições:', error);
        return null;
      }

      return {
        planCode: data.plan_code,
        planName: data.plan_name,
        baseLimit: data.base_limit,
        bonus: data.bonus,
        totalLimit: data.total_limit,
        hasActivePlan: data.has_active_plan,
        renewedThisMonth: data.renewed_this_month
      };
    } catch (error) {
      console.error('❌ Erro ao buscar limite:', error);
      return null;
    }
  }

  /**
   * Get monthly petitions usage for a user
   */
  static async getMonthlyPetitionsUsage(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_monthly_petitions_usage', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao buscar uso mensal:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('❌ Erro ao buscar uso mensal:', error);
      return 0;
    }
  }

  /**
   * Format error message for display
   */
  static getErrorMessage(reason: string): string {
    return reason;
  }

  /**
   * Check if user is on free plan
   */
  static isFreePlan(planCode?: string): boolean {
    return !planCode || planCode === 'free';
  }

  /**
   * Get user-friendly plan name
   */
  static getPlanDisplayName(planCode?: string): string {
    const planNames: Record<string, string> = {
      'free': 'Gratuito',
      'start': 'Start',
      'pro': 'Pro',
      'elite': 'Elite'
    };
    
    return planNames[planCode || 'free'] || 'Desconhecido';
  }
}