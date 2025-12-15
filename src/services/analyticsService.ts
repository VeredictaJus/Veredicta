
import { DateRange, AnalyticsDashboard, ChartDataPoint } from '../types/analytics';
import { supabase } from '../lib/supabase'; // Ajuste conforme seu projeto
import type { PostgrestError } from '@supabase/supabase-js';

export class AnalyticsService {
  static async getDashboardData(dateRange?: DateRange): Promise<AnalyticsDashboard> {
    // Exemplo: consulta uma view ou tabela agregada no Supabase
    const { data, error } = await supabase
      .from<AnalyticsDashboard>('analytics_dashboard_view')
      .select('*')
      .gte('date', dateRange?.start.toISOString()!)
      .lte('date', dateRange?.end.toISOString()!);
      
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nenhum dado encontrado para o período selecionado');
    }
    return data[0];
  }

  static async getMetricData(metricId: string, dateRange: DateRange): Promise<ChartDataPoint[]> {
    const { data, error } = await supabase
      .from<ChartDataPoint>('analytics_metrics')
      .select('date, value')
      .eq('metric_id', metricId)
      .gte('date', dateRange.start.toISOString())
      .lte('date', dateRange.end.toISOString())
      .order('date');
      
    if (error) throw error;
    return data || [];
  }

  static async exportData(
    format: 'pdf' | 'excel' | 'csv',
    payload: { dateRange: DateRange; data?: AnalyticsDashboard }
  ): Promise<Blob> {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, payload })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao exportar o relatório');
    }

    return await response.blob();
  }

  static getDateRangePresets(): Array<{ key: string; label: string; range: DateRange }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        key: 'today',
        label: 'Hoje',
        range: {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          preset: 'today'
        }
      },
      {
        key: 'yesterday',
        label: 'Ontem',
        range: {
          start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() - 1),
          preset: 'yesterday'
        }
      },
      {
        key: 'last7days',
        label: 'Últimos 7 dias',
        range: {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: today,
          preset: 'last7days'
        }
      },
      {
        key: 'last30days',
        label: 'Últimos 30 dias',
        range: {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: today,
          preset: 'last30days'
        }
      },
      {
        key: 'thisMonth',
        label: 'Este mês',
        range: {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          preset: 'thisMonth'
        }
      },
      {
        key: 'lastMonth',
        label: 'Mês passado',
        range: {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0),
          preset: 'lastMonth'
        }
      }
    ];
  }

  static formatNumber(value: number, unit: string = ''): string {
    if (value >= 1000000) {
      return `${unit}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${unit}${(value / 1000).toFixed(1)}K`;
    } else {
      return `${unit}${value.toFixed(0)}`;
    }
  }

  static formatPercent(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}