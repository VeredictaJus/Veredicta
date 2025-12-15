import { supabase } from '@/lib/supabaseClient';
import { LaborCalculatorData, CalculationResult } from '@/types/calculator';

export interface SavedCalculation {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  calculation_data: LaborCalculatorData;
  calculation_result?: CalculationResult;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  is_favorite: boolean;
  tags: string[];
  petition_id?: string;
}

export class LaborCalculationService {
  /**
   * Salva um novo cálculo
   */
  static async saveCalculation(
    userId: string,
    data: LaborCalculatorData,
    result?: CalculationResult,
    options?: {
      title?: string;
      description?: string;
      tags?: string[];
      petitionId?: string;
    }
  ): Promise<SavedCalculation> {
    console.log('📝 Tentando salvar cálculo...');
    console.log('   User ID:', userId);
    console.log('   Título:', options?.title || `Cálculo - ${data.employeeName}`);

    const insertData = {
      user_id: userId,
      title: options?.title || `Cálculo - ${data.employeeName}`,
      description: options?.description,
      calculation_data: data,
      calculation_result: result,
      tags: options?.tags || [],
      petition_id: options?.petitionId,
      last_accessed_at: new Date().toISOString(),
    };

    console.log('📦 Dados a inserir:', insertData);

    const { data: savedCalc, error } = await supabase
      .from('labor_calculations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar cálculo:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Detalhes:', error.details);
      console.error('❌ Hint:', error.hint);
      
      // Mensagens de erro mais específicas
      if (error.code === '42P01') {
        throw new Error('Tabela labor_calculations não existe. Execute o script SQL no Supabase.');
      } else if (error.code === '42501') {
        throw new Error('Sem permissão para salvar. Verifique as políticas RLS.');
      } else if (error.message.includes('violates foreign key')) {
        throw new Error('Erro de relacionamento. Verifique se a petição existe.');
      } else {
        throw new Error('Erro ao salvar cálculo: ' + error.message);
      }
    }

    console.log('✅ Cálculo salvo com sucesso! ID:', savedCalc.id);
    return savedCalc;
  }

  /**
   * Atualiza um cálculo existente
   */
  static async updateCalculation(
    calculationId: string,
    data: Partial<{
      title: string;
      description: string;
      calculation_data: LaborCalculatorData;
      calculation_result: CalculationResult;
      tags: string[];
      is_favorite: boolean;
    }>
  ): Promise<SavedCalculation> {
    const { data: updated, error } = await supabase
      .from('labor_calculations')
      .update({
        ...data,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', calculationId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cálculo:', error);
      throw new Error('Erro ao atualizar cálculo: ' + error.message);
    }

    console.log('✅ Cálculo atualizado:', calculationId);
    return updated;
  }

  /**
   * Lista todos os cálculos do usuário
   */
  static async listCalculations(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      tags?: string[];
      onlyFavorites?: boolean;
      searchTerm?: string;
    }
  ): Promise<{ calculations: SavedCalculation[]; total: number }> {
    let query = supabase
      .from('labor_calculations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    // Filtros opcionais
    if (options?.onlyFavorites) {
      query = query.eq('is_favorite', true);
    }

    if (options?.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    if (options?.searchTerm) {
      query = query.or(
        `title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Erro ao listar cálculos:', error);
      throw new Error('Erro ao listar cálculos: ' + error.message);
    }

    return {
      calculations: data || [],
      total: count || 0,
    };
  }

  /**
   * Busca um cálculo específico por ID
   */
  static async getCalculation(calculationId: string): Promise<SavedCalculation> {
    const { data, error } = await supabase
      .from('labor_calculations')
      .select('*')
      .eq('id', calculationId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar cálculo:', error);
      throw new Error('Erro ao buscar cálculo: ' + error.message);
    }

    // Atualizar last_accessed_at
    await supabase
      .from('labor_calculations')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', calculationId);

    return data;
  }

  /**
   * Deleta um cálculo
   */
  static async deleteCalculation(calculationId: string): Promise<void> {
    const { error } = await supabase
      .from('labor_calculations')
      .delete()
      .eq('id', calculationId);

    if (error) {
      console.error('❌ Erro ao deletar cálculo:', error);
      throw new Error('Erro ao deletar cálculo: ' + error.message);
    }

    console.log('✅ Cálculo deletado:', calculationId);
  }

  /**
   * Marca/desmarca cálculo como favorito
   */
  static async toggleFavorite(
    calculationId: string,
    isFavorite: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('labor_calculations')
      .update({ is_favorite: isFavorite })
      .eq('id', calculationId);

    if (error) {
      console.error('❌ Erro ao atualizar favorito:', error);
      throw new Error('Erro ao atualizar favorito: ' + error.message);
    }

    console.log('✅ Favorito atualizado:', calculationId);
  }

  /**
   * Duplica um cálculo
   */
  static async duplicateCalculation(
    calculationId: string,
    userId: string
  ): Promise<SavedCalculation> {
    // Buscar cálculo original
    const original = await this.getCalculation(calculationId);

    // Criar cópia
    const { data: duplicate, error } = await supabase
      .from('labor_calculations')
      .insert({
        user_id: userId,
        title: `${original.title} (Cópia)`,
        description: original.description,
        calculation_data: original.calculation_data,
        calculation_result: original.calculation_result,
        tags: original.tags,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao duplicar cálculo:', error);
      throw new Error('Erro ao duplicar cálculo: ' + error.message);
    }

    console.log('✅ Cálculo duplicado:', duplicate.id);
    return duplicate;
  }

  /**
   * Estatísticas dos cálculos do usuário
   */
  static async getStatistics(userId: string): Promise<{
    total: number;
    favorites: number;
    thisMonth: number;
    byTag: { tag: string; count: number }[];
  }> {
    const { data, error } = await supabase
      .from('labor_calculations')
      .select('id, is_favorite, created_at, tags')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas: ' + error.message);
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = data.length;
    const favorites = data.filter((c) => c.is_favorite).length;
    const thisMonth = data.filter(
      (c) => new Date(c.created_at) >= firstDayOfMonth
    ).length;

    // Contar por tag
    const tagCounts: { [key: string]: number } = {};
    data.forEach((calc) => {
      if (calc.tags) {
        calc.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const byTag = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      favorites,
      thisMonth,
      byTag,
    };
  }
}

