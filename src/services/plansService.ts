import { supabase } from '@/lib/supabaseClient';

export interface Plan {
  id: string;
  name: string;
  price: number;
  petitions_included: number;
  features: string[];
  description?: string;
  priority_support?: boolean;
  custom_branding?: boolean;
  is_active: boolean;
  subscribers?: number;
  created_at?: string;
  // Campos calculados/derivados
  additional_credit_price?: number;
  recommended?: boolean;
}

export interface PlanStats {
  totalRevenue: number;
  totalSubscribers: number;
  averagePrice: number;
  activePlans: number;
}

export class PlansService {
  private static readonly TABLE_NAME = 'plans';

  /**
   * Calcular preço do crédito adicional baseado no plano
   */
  private static calculateAdditionalCreditPrice(price: number, petitionsIncluded: number): number {
    // Lógica baseada nos planos corretos
    if (petitionsIncluded <= 1) return 150; // Free - preço mais alto para incentivar upgrade
    if (petitionsIncluded <= 4) return 130; // Start
    if (petitionsIncluded <= 14) return 120; // Pro
    if (petitionsIncluded <= 70) return 100; // Elite
    return 100; // Default
  }

  /**
   * Testar conectividade com a tabela plans
   */
  static async testConnection(): Promise<{ success: boolean; error?: string; tableExists?: boolean }> {
    try {
      console.log('🧪 PlansService: Testando conectividade...');
      
      // Tentar fazer uma query simples para verificar se a tabela existe
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ PlansService: Erro na conectividade:', error);
        return { 
          success: false, 
          error: error.message,
          tableExists: false
        };
      }

      console.log('✅ PlansService: Conectividade OK');
      return { 
        success: true, 
        tableExists: true
      };
    } catch (error) {
      console.error('💥 PlansService: Erro inesperado na conectividade:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        tableExists: false
      };
    }
  }

  /**
   * Testar query sem filtros para debug
   */
  static async debugQuery(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('🔍 PlansService: Executando query de debug...');
      
      // Query sem filtros para ver todos os dados
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (error) {
        console.error('❌ PlansService: Erro na query de debug:', error);
        return { 
          success: false, 
          error: error.message
        };
      }

      console.log('✅ PlansService: Query de debug OK, dados:', data);
      return { 
        success: true, 
        data: data || []
      };
    } catch (error) {
      console.error('💥 PlansService: Erro inesperado na query de debug:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Buscar planos usando conexão pública (sem autenticação)
   */
  static async getActivePlansPublic(): Promise<Plan[]> {
    try {
      console.log('🌐 PlansService: Buscando planos com acesso público...');
      
      // Criar uma nova instância do Supabase sem autenticação
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ PlansService: Variáveis de ambiente do Supabase não encontradas');
        return [];
      }
      
      const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await publicSupabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('❌ PlansService: Erro na busca pública:', error);
        return [];
      }

      console.log('✅ PlansService: Busca pública OK, dados:', data);
      
      // Adicionar campos calculados
      const plansWithCalculatedFields = (data || []).map(plan => ({
        ...plan,
        additional_credit_price: this.calculateAdditionalCreditPrice(plan.price, plan.petitions_included),
        recommended: plan.name === 'Pro'
      }));
      
      return plansWithCalculatedFields;
    } catch (error) {
      console.error('💥 PlansService: Erro inesperado na busca pública:', error);
      return [];
    }
  }

  /**
   * Buscar todos os planos ativos para exibição pública
   */
  static async getActivePlans(): Promise<Plan[]> {
    try {
      console.log('🔍 PlansService: Buscando planos ativos...');
      console.log('🔍 PlansService: Nome da tabela:', this.TABLE_NAME);
      
      // Verificar autenticação atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 PlansService: Usuário autenticado:', user ? 'Sim' : 'Não');
      console.log('🔐 PlansService: Detalhes do usuário:', user);
      
      if (authError) {
        console.warn('⚠️ PlansService: Usuário não autenticado, tentando acesso público:', authError.message);
      }
      
      // Tentar múltiplas estratégias de busca
      let plans: any[] = [];
      
      // Estratégia 1: Buscar com filtro is_active = true
      console.log('🎯 Estratégia 1: Buscando com filtro is_active = true');
      const { data: activeData, error: activeError } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (!activeError && activeData) {
        console.log('✅ Estratégia 1: Sucesso!', activeData.length, 'planos encontrados');
        plans = activeData;
      } else {
        console.warn('⚠️ Estratégia 1: Falhou:', activeError?.message);
        
        // Estratégia 2: Buscar todos os planos e filtrar no código
        console.log('🎯 Estratégia 2: Buscando todos os planos');
        const { data: allData, error: allError } = await supabase
          .from(this.TABLE_NAME)
          .select('*')
          .order('price', { ascending: true });

        if (!allError && allData) {
          console.log('✅ Estratégia 2: Sucesso!', allData.length, 'planos encontrados');
          plans = allData.filter(plan => plan.is_active === true);
        } else {
          console.error('❌ Estratégia 2: Falhou:', allError?.message);
          
          // Estratégia 3: Usar conexão pública (sem autenticação)
          console.log('🎯 Estratégia 3: Tentando com acesso público');
          const publicPlans = await this.getActivePlansPublic();
          
          if (publicPlans.length > 0) {
            console.log('✅ Estratégia 3: Sucesso!', publicPlans.length, 'planos encontrados');
            plans = publicPlans;
          } else {
            console.error('❌ Estratégia 3: Falhou - nenhum plano encontrado');
          }
        }
      }

      console.log('📊 PlansService: Total de planos ativos encontrados:', plans.length);
      console.log('📋 PlansService: Dados dos planos:', plans);
      
      // Adicionar campos calculados baseados na estrutura da tabela
      const plansWithCalculatedFields = plans.map(plan => ({
        ...plan,
        additional_credit_price: this.calculateAdditionalCreditPrice(plan.price, plan.petitions_included),
        recommended: plan.name === 'Pro' // Marcar Pro como recomendado
      }));
      
      return plansWithCalculatedFields;
    } catch (error) {
      console.error('💥 PlansService: Erro inesperado ao buscar planos ativos:', error);
      return [];
    }
  }

  /**
   * Buscar todos os planos (incluindo inativos) para administração
   */
  static async getAllPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching all plans:', error);
        return [];
      }

      // Adicionar campos calculados
      const plansWithCalculatedFields = (data || []).map(plan => ({
        ...plan,
        additional_credit_price: this.calculateAdditionalCreditPrice(plan.price, plan.petitions_included),
        recommended: plan.name === 'Pro'
      }));

      return plansWithCalculatedFields;
    } catch (error) {
      console.error('Unexpected error fetching all plans:', error);
      return [];
    }
  }

  /**
   * Criar novo plano
   */
  static async createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; plan?: Plan; error?: string }> {
    try {
      const { name, price, petitions_included } = planData;
      
      if (!name || !price || !petitions_included) {
        return { success: false, error: 'Preencha todos os campos obrigatórios' };
      }

      // Gerar features automaticamente baseado nos dados
      const autoFeatures = [
        `${petitions_included} petições por mês`,
        'Revisão pelo corretor antes do envio',
        ...(planData.priority_support ? ['Suporte prioritário'] : ['Suporte por email']),
        ...(planData.custom_branding ? ['Marca personalizada'] : [])
      ];

      const planToInsert = {
        ...planData,
        features: planData.features.length > 0 ? planData.features : autoFeatures,
        subscribers: planData.subscribers || 0
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([planToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, plan: data };
    } catch (error) {
      console.error('Unexpected error creating plan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }

  /**
   * Atualizar plano existente
   */
  static async updatePlan(planId: string, updates: Partial<Plan>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) {
        console.error('Error updating plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating plan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }

  /**
   * Deletar plano
   */
  static async deletePlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error deleting plan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }

  /**
   * Ativar/desativar plano
   */
  static async togglePlanStatus(planId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) {
        console.error('Error toggling plan status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error toggling plan status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }

  /**
   * Calcular estatísticas dos planos
   */
  static calculateStats(plans: Plan[]): PlanStats {
    return {
      totalRevenue: plans.reduce((sum, plan) => sum + (plan.price * (plan.subscribers || 0)), 0),
      totalSubscribers: plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0),
      averagePrice: plans.length > 0 ? plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length : 0,
      activePlans: plans.filter(plan => plan.is_active).length
    };
  }

  /**
   * Formatar preço para exibição
   */
  static formatPrice(price: number): string {
    return `R$ ${price.toLocaleString()}`;
  }

  /**
   * Obter plano por ID
   */
  static async getPlanById(planId: string): Promise<{ success: boolean; plan?: Plan; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error('Error fetching plan by ID:', error);
        return { success: false, error: error.message };
      }

      return { success: true, plan: data };
    } catch (error) {
      console.error('Unexpected error fetching plan by ID:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }

  /**
   * Atualizar contador de assinantes
   */
  static async updateSubscriberCount(planId: string, increment: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      // Primeiro buscar o plano atual
      const { data: currentPlan, error: fetchError } = await supabase
        .from(this.TABLE_NAME)
        .select('subscribers')
        .eq('id', planId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const newCount = increment 
        ? (currentPlan.subscribers || 0) + 1 
        : Math.max((currentPlan.subscribers || 0) - 1, 0);

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          subscribers: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) {
        console.error('Error updating subscriber count:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating subscriber count:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro inesperado' 
      };
    }
  }
}
