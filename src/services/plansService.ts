import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export interface Plan {
  id: string;
  name: string;
  plan_code?: string; // Código único do plano (ex: 'free', 'start', 'pro', 'elite')
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
   * Obter cliente Supabase com service role para operações admin
   */
  private static getAdminClient() {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (serviceRoleKey && supabaseUrl) {
      return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    
    // Fallback para cliente normal se service role não estiver disponível
    return supabase;
  }

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
      
      // ✅ Ordenar planos na ordem correta: Free, Start, Pro, Elite
      return this.sortPlans(plansWithCalculatedFields);
    } catch (error) {
      console.error('💥 PlansService: Erro inesperado ao buscar planos ativos:', error);
      return [];
    }
  }

  /**
   * Ordenar planos na ordem correta: Free, Start, Pro, Elite
   */
  private static sortPlans(plans: Plan[]): Plan[] {
    const orderMap: { [key: string]: number } = {
      'free': 1,
      'start': 2,
      'pro': 3,
      'elite': 4
    };

    return plans.sort((a, b) => {
      const aCode = (a.plan_code || a.name.toLowerCase()).toLowerCase();
      const bCode = (b.plan_code || b.name.toLowerCase()).toLowerCase();
      const aOrder = orderMap[aCode] || 99;
      const bOrder = orderMap[bCode] || 99;
      return aOrder - bOrder;
    });
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

      // ✅ Ordenar planos na ordem correta: Free, Start, Pro, Elite
      return this.sortPlans(plansWithCalculatedFields);
    } catch (error) {
      console.error('Unexpected error fetching all plans:', error);
      return [];
    }
  }

  /**
   * Gerar plan_code a partir do nome do plano
   */
  private static generatePlanCode(name: string): string {
    // Converter nome para lowercase e remover caracteres especiais
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais por underscore
      .replace(/_+/g, '_') // Remove underscores duplicados
      .replace(/^_|_$/g, ''); // Remove underscores no início/fim
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

      // Gerar plan_code automaticamente se não fornecido
      const plan_code = planData.plan_code || this.generatePlanCode(name);

      // Gerar features automaticamente baseado nos dados
      const autoFeatures = [
        `${petitions_included} petições por mês`,
        'Revisão pelo corretor antes do envio',
        ...(planData.priority_support ? ['Suporte prioritário'] : ['Suporte por email']),
        ...(planData.custom_branding ? ['Marca personalizada'] : [])
      ];

      const planToInsert = {
        ...planData,
        plan_code, // ✅ CORREÇÃO: Adicionar plan_code obrigatório
        features: planData.features.length > 0 ? planData.features : autoFeatures,
        subscribers: planData.subscribers || 0
      };

      // ✅ CORREÇÃO: Usar service role key para bypass RLS
      const adminClient = this.getAdminClient();
      const { data, error } = await adminClient
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
      // ✅ CORREÇÃO: Usar service role key para bypass RLS
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
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
      // ✅ CORREÇÃO: Usar service role key para bypass RLS
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
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
      // ✅ CORREÇÃO: Usar service role key para bypass RLS
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
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
   * Restaurar plano Elite (caso tenha sido deletado)
   */
  static async restoreElitePlan(): Promise<{ success: boolean; plan?: Plan; error?: string }> {
    try {
      // Verificar se o plano Elite já existe
      const adminClient = this.getAdminClient();
      const { data: existingPlan } = await adminClient
        .from(this.TABLE_NAME)
        .select('id')
        .eq('plan_code', 'elite')
        .maybeSingle();

      if (existingPlan) {
        return { success: false, error: 'O plano Elite já existe' };
      }

      // Dados do plano Elite
      const elitePlanData = {
        plan_code: 'elite',
        name: 'Elite',
        price: 700000, // R$ 7.000,00 em centavos
        petitions_included: 70,
        features: [
          '70 petições incluídas',
          'Entrega em até 1 dia útil (prioridade máxima)',
          '1 revisão gratuita por petição',
          'Revisão extra por advogado sênior (opcional)',
          'Consulta direta com redator via plataforma',
          '+3 petições bônus na renovação',
          'Acesso antecipado a novos recursos',
          'Validade: 90 dias',
          'Confidencialidade garantida (NDA)',
          'Valor por petição: R$ 100,00'
        ],
        description: 'Plano premium para grandes escritórios e departamentos jurídicos',
        priority_support: true,
        custom_branding: true,
        is_active: true,
        subscribers: 0
      };

      const { data, error } = await adminClient
        .from(this.TABLE_NAME)
        .insert([elitePlanData])
        .select()
        .single();

      if (error) {
        console.error('Error restoring Elite plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, plan: data };
    } catch (error) {
      console.error('Unexpected error restoring Elite plan:', error);
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
      // ✅ CORREÇÃO: Usar service role key para bypass RLS
      const adminClient = this.getAdminClient();
      
      // Primeiro buscar o plano atual
      const { data: currentPlan, error: fetchError } = await adminClient
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

      const { error } = await adminClient
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
