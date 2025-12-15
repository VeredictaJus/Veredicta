/**
 * Conversor de Jornadas de Trabalho
 * 
 * Converte entre diferentes formatos de jornada:
 * - 220 horas/mês (44h/semana - padrão CLT)
 * - 180 horas/mês (36h/semana - bancários, telefonistas)
 * - 200 horas/mês (40h/semana - comum)
 * - Custom (jornada especial)
 */

export type WorkdayType = '220h' | '180h' | '200h' | '160h' | 'custom';

export interface WorkdayInfo {
  monthlyHours: number;
  weeklyHours: number;
  dailyHours: number;
  description: string;
  legalBasis: string;
}

export const WORKDAY_TYPES: Record<WorkdayType, WorkdayInfo> = {
  '220h': {
    monthlyHours: 220,
    weeklyHours: 44,
    dailyHours: 8.8,
    description: 'Jornada Padrão CLT',
    legalBasis: 'Art. 58 CLT - 44 horas semanais'
  },
  '200h': {
    monthlyHours: 200,
    weeklyHours: 40,
    dailyHours: 8,
    description: 'Jornada 40h semanais',
    legalBasis: '40 horas semanais (comum)'
  },
  '180h': {
    monthlyHours: 180,
    weeklyHours: 36,
    dailyHours: 7.2,
    description: 'Jornada Reduzida',
    legalBasis: 'Categorias especiais (bancários, telefonistas)'
  },
  '160h': {
    monthlyHours: 160,
    weeklyHours: 32,
    dailyHours: 6.4,
    description: 'Jornada 32h semanais',
    legalBasis: 'Meio período ou categorias especiais'
  },
  'custom': {
    monthlyHours: 0,
    weeklyHours: 0,
    dailyHours: 0,
    description: 'Jornada Personalizada',
    legalBasis: 'Conforme contrato ou convenção coletiva'
  }
};

export class WorkdayConverter {
  /**
   * Calcula o valor da hora com base no salário e jornada
   */
  static calculateHourlyRate(salary: number, workdayType: WorkdayType, customHours?: number): number {
    const monthlyHours = customHours || WORKDAY_TYPES[workdayType].monthlyHours;
    
    if (monthlyHours === 0) {
      throw new Error('Jornada mensal não pode ser zero');
    }
    
    return salary / monthlyHours;
  }

  /**
   * Converte horas semanais para mensais
   */
  static weeklyToMonthly(weeklyHours: number): number {
    return (weeklyHours * 52) / 12; // 52 semanas/ano ÷ 12 meses
  }

  /**
   * Converte horas diárias para mensais (considerando 6 dias/semana)
   */
  static dailyToMonthly(dailyHours: number, workDaysPerWeek: number = 6): number {
    const weeklyHours = dailyHours * workDaysPerWeek;
    return this.weeklyToMonthly(weeklyHours);
  }

  /**
   * Detecta o tipo de jornada com base nas horas semanais
   */
  static detectWorkdayType(weeklyHours: number): WorkdayType {
    if (weeklyHours === 44) return '220h';
    if (weeklyHours === 40) return '200h';
    if (weeklyHours === 36) return '180h';
    if (weeklyHours === 32) return '160h';
    return 'custom';
  }

  /**
   * Verifica se há horas extras conforme a jornada
   */
  static checkOvertime(workedHours: number, contractedHours: number): {
    hasOvertime: boolean;
    overtimeHours: number;
  } {
    const hasOvertime = workedHours > contractedHours;
    const overtimeHours = hasOvertime ? workedHours - contractedHours : 0;
    
    return {
      hasOvertime,
      overtimeHours
    };
  }

  /**
   * Calcula divisor para cálculos rescisórios conforme jornada
   */
  static getRescissionDivisor(workdayType: WorkdayType): number {
    switch (workdayType) {
      case '220h': return 220;
      case '200h': return 200;
      case '180h': return 180;
      case '160h': return 160;
      default: return 220;
    }
  }
}










