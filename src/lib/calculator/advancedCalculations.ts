/**
 * Cálculos Trabalhistas Avançados
 * 
 * Implementa todos os cálculos trabalhistas conforme CLT, TST e CNJ
 * Base legal: CLT + Súmulas TST + Resoluções CNJ
 */

import { LaborCalculatorData } from '@/types/calculator';
import { LABOR_CONSTANTS } from './laborConstants';

export class AdvancedLaborCalculations {
  private data: LaborCalculatorData;
  private calculationMemory: string[] = [];
  private legalBasis: string[] = [];

  constructor(data: LaborCalculatorData) {
    this.data = data;
  }

  /**
   * Calcula Aviso Prévio Proporcional
   * Lei 12.506/2011: 30 dias + 3 dias por ano trabalhado (máx: 90 dias)
   */
  calculateProportionalNotice(yearsWorked: number): {
    days: number;
    amount: number;
    baseLegal: string;
  } {
    const baseDays = 30;
    const additionalDays = Math.min(yearsWorked * 3, 60); // máx 60 dias adicionais
    const totalDays = baseDays + additionalDays;
    
    const dailySalary = this.data.baseSalary / 30;
    const amount = dailySalary * totalDays;
    
    this.calculationMemory.push(
      `=== AVISO PRÉVIO PROPORCIONAL (Lei 12.506/2011) ===`,
      `Base: 30 dias`,
      `Adicional: ${yearsWorked} anos × 3 dias = ${additionalDays} dias`,
      `Total: ${totalDays} dias`,
      `Valor: R$ ${dailySalary.toFixed(2)} × ${totalDays} = R$ ${amount.toFixed(2)}`
    );
    
    return {
      days: totalDays,
      amount,
      baseLegal: 'Lei 12.506/2011 - Aviso Prévio Proporcional'
    };
  }

  /**
   * Calcula Multa Art. 477 CLT
   * 1 salário se atraso > 10 dias
   */
  calculateArt477Fine(delayDays: number): number {
    if (delayDays <= 10) return 0;
    
    const fine = this.data.baseSalary;
    
    this.calculationMemory.push(
      `=== MULTA ART. 477 CLT ===`,
      `Atraso: ${delayDays} dias (limite: 10 dias)`,
      `Multa: 1 salário = R$ ${fine.toFixed(2)}`,
      `Base Legal: Art. 477 §8º CLT`
    );
    
    this.legalBasis.push('Art. 477 §8º CLT - Multa por atraso na rescisão');
    
    return fine;
  }

  /**
   * Calcula Multa Art. 467 CLT
   * 50% sobre verbas incontroversas não pagas
   */
  calculateArt467Fine(undisputedAmount: number): number {
    const fine = undisputedAmount * 0.50;
    
    this.calculationMemory.push(
      `=== MULTA ART. 467 CLT ===`,
      `Verbas incontroversas: R$ ${undisputedAmount.toFixed(2)}`,
      `Multa: 50% = R$ ${fine.toFixed(2)}`,
      `Base Legal: Art. 467 CLT`
    );
    
    this.legalBasis.push('Art. 467 CLT - Multa sobre verbas incontroversas');
    
    return fine;
  }

  /**
   * Calcula Estabilidade da Gestante
   * 5 meses: confirmação + parto + 120 dias pós-parto
   */
  calculatePregnancyStability(
    confirmDate: Date,
    childbirthDate: Date,
    terminationDate: Date
  ): number {
    // Período de estabilidade: até 5 meses após o parto (aproximadamente)
    const stabilityEndDate = new Date(childbirthDate);
    stabilityEndDate.setMonth(stabilityEndDate.getMonth() + 5);
    
    // Se demissão foi antes do fim da estabilidade
    if (terminationDate < stabilityEndDate) {
      // Calcular meses de salário devidos
      const diffTime = stabilityEndDate.getTime() - terminationDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.ceil(diffDays / 30);
      
      const amount = this.data.baseSalary * months;
      
      this.calculationMemory.push(
        `=== ESTABILIDADE DA GESTANTE ===`,
        `Confirmação: ${confirmDate.toLocaleDateString('pt-BR')}`,
        `Parto: ${childbirthDate.toLocaleDateString('pt-BR')}`,
        `Fim estabilidade: ${stabilityEndDate.toLocaleDateString('pt-BR')}`,
        `Demissão: ${terminationDate.toLocaleDateString('pt-BR')}`,
        `Período devido: ${months} meses`,
        `Salários: ${months} × R$ ${this.data.baseSalary.toFixed(2)} = R$ ${amount.toFixed(2)}`,
        `Base Legal: Art. 10, II, 'b' ADCT/CF88`
      );
      
      this.legalBasis.push(
        'Art. 10, II, \'b\' ADCT/CF88 - Estabilidade da Gestante',
        'Súmula 244 TST - Gestante. Estabilidade provisória'
      );
      
      return amount;
    }
    
    return 0;
  }

  /**
   * Calcula Estabilidade Acidentária
   * 12 meses após alta do INSS (B91)
   */
  calculateAccidentStability(
    inssReleaseDate: Date,
    terminationDate: Date
  ): number {
    const stabilityEndDate = new Date(inssReleaseDate);
    stabilityEndDate.setMonth(stabilityEndDate.getMonth() + 12);
    
    if (terminationDate < stabilityEndDate) {
      const diffTime = stabilityEndDate.getTime() - terminationDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.ceil(diffDays / 30);
      
      const amount = this.data.baseSalary * months;
      
      this.calculationMemory.push(
        `=== ESTABILIDADE ACIDENTÁRIA ===`,
        `Alta INSS: ${inssReleaseDate.toLocaleDateString('pt-BR')}`,
        `Fim estabilidade: ${stabilityEndDate.toLocaleDateString('pt-BR')}`,
        `Demissão: ${terminationDate.toLocaleDateString('pt-BR')}`,
        `Período devido: ${months} meses`,
        `Salários: ${months} × R$ ${this.data.baseSalary.toFixed(2)} = R$ ${amount.toFixed(2)}`,
        `Base Legal: Art. 118 Lei 8.213/91`
      );
      
      this.legalBasis.push(
        'Art. 118 Lei 8.213/91 - Estabilidade acidentária',
        'Súmula 378 TST - Estabilidade provisória. Acidente de trabalho'
      );
      
      return amount;
    }
    
    return 0;
  }

  /**
   * Calcula Equiparação Salarial
   * Art. 461 CLT + Súmula 6 TST
   */
  calculateSalaryEqualization(
    paradigmSalary: number,
    periodMonths: number
  ): {
    difference: number;
    reflections: number;
    total: number;
  } {
    const monthlyDifference = paradigmSalary - this.data.baseSalary;
    const totalDifference = monthlyDifference * periodMonths;
    
    // Reflexos em férias (1/3), 13º, FGTS
    const vacationReflection = (totalDifference / 12) * (periodMonths / 12) * (1 + 1/3);
    const thirteenthReflection = (totalDifference / 12) * (periodMonths / 12);
    const fgtsReflection = totalDifference * 0.08;
    
    const reflections = vacationReflection + thirteenthReflection + fgtsReflection;
    const total = totalDifference + reflections;
    
    this.calculationMemory.push(
      `=== EQUIPARAÇÃO SALARIAL (Art. 461 CLT) ===`,
      `Salário paradigma: R$ ${paradigmSalary.toFixed(2)}`,
      `Salário recebido: R$ ${this.data.baseSalary.toFixed(2)}`,
      `Diferença mensal: R$ ${monthlyDifference.toFixed(2)}`,
      `Período: ${periodMonths} meses`,
      `Diferença total: R$ ${totalDifference.toFixed(2)}`,
      `Reflexos:`,
      `  - Férias + 1/3: R$ ${vacationReflection.toFixed(2)}`,
      `  - 13º salário: R$ ${thirteenthReflection.toFixed(2)}`,
      `  - FGTS 8%: R$ ${fgtsReflection.toFixed(2)}`,
      `Total com reflexos: R$ ${total.toFixed(2)}`
    );
    
    this.legalBasis.push(
      'Art. 461 CLT - Equiparação salarial',
      'Súmula 6 TST - Equiparação salarial'
    );
    
    return {
      difference: totalDifference,
      reflections,
      total
    };
  }

  /**
   * Calcula DSR (Descanso Semanal Remunerado) sobre horas extras
   * Súmula 172 TST
   */
  calculateDSROverOvertime(overtimeAmount: number, workedDays: number): number {
    // DSR = (HE / dias trabalhados) × domingos/feriados
    const workingDaysPerMonth = 25; // aprox
    const restDaysPerMonth = 5; // aprox (4 domingos + feriados)
    
    const dsrAmount = (overtimeAmount / workedDays) * restDaysPerMonth;
    
    this.calculationMemory.push(
      `=== DSR SOBRE HORAS EXTRAS (Súmula 172 TST) ===`,
      `Horas extras: R$ ${overtimeAmount.toFixed(2)}`,
      `Dias trabalhados: ${workedDays}`,
      `Domingos/Feriados: ${restDaysPerMonth}`,
      `DSR: (${overtimeAmount.toFixed(2)} / ${workedDays}) × ${restDaysPerMonth} = R$ ${dsrAmount.toFixed(2)}`
    );
    
    this.legalBasis.push(
      'Súmula 172 TST - Repouso remunerado. Horas extras',
      'Lei 605/49 - Repouso semanal remunerado'
    );
    
    return dsrAmount;
  }

  /**
   * Calcula Supressão de Horas Extras Habituais
   * Súmula 291 TST: 1 mês para cada ano ou fração de 6 meses
   */
  calculateSuppressionHE(habitualHours: number, years: number): number {
    const hourValue = (this.data.baseSalary / 220) * 1.5; // HE 50%
    const monthlyHE = habitualHours * hourValue;
    
    // 1 mês para cada ano (ou fração >= 6 meses)
    const indemnityMonths = Math.ceil(years);
    const amount = monthlyHE * indemnityMonths;
    
    this.calculationMemory.push(
      `=== SUPRESSÃO DE HORAS EXTRAS (Súmula 291 TST) ===`,
      `Horas extras habituais: ${habitualHours}h/mês`,
      `Valor hora extra: R$ ${hourValue.toFixed(2)}`,
      `Valor mensal HE: R$ ${monthlyHE.toFixed(2)}`,
      `Período: ${years} anos`,
      `Indenização: ${indemnityMonths} meses`,
      `Total: R$ ${amount.toFixed(2)}`
    );
    
    this.legalBasis.push(
      'Súmula 291 TST - Horas extras. Supressão'
    );
    
    return amount;
  }

  /**
   * Calcula Dano Moral
   * Base: CLT Art. 223-A a 223-G (Reforma 2017) + jurisprudência
   */
  calculateMoralDamage(
    type: string,
    severity: 'LIGHT' | 'MEDIUM' | 'SERIOUS' | 'VERY_SERIOUS'
  ): number {
    // Sugestões baseadas em jurisprudência TST
    const multipliers = {
      LIGHT: { min: 1, max: 3 },
      MEDIUM: { min: 3, max: 5 },
      SERIOUS: { min: 5, max: 20 },
      VERY_SERIOUS: { min: 20, max: 50 }
    };
    
    const mult = multipliers[severity];
    const suggestedAmount = this.data.baseSalary * ((mult.min + mult.max) / 2);
    
    this.calculationMemory.push(
      `=== DANO MORAL (Art. 223-A a 223-G CLT) ===`,
      `Tipo: ${type}`,
      `Gravidade: ${severity}`,
      `Salário base: R$ ${this.data.baseSalary.toFixed(2)}`,
      `Multiplicador sugerido: ${mult.min}x a ${mult.max}x`,
      `Valor sugerido: R$ ${suggestedAmount.toFixed(2)}`,
      `⚠️ Valor definitivo será arbitrado pelo juiz`
    );
    
    this.legalBasis.push(
      'Art. 223-A a 223-G CLT - Dano extrapatrimonial',
      'Art. 186 e 927 CC - Responsabilidade civil'
    );
    
    return suggestedAmount;
  }

  /**
   * Calcula Honor

ários Advocatícios Trabalhistas
   * CLT Art. 791-A (Lei 13.467/2017)
   */
  calculateHonorarios(
    condemnationAmount: number,
    percentage: number = 10,
    freeJustice: boolean = false
  ): {
    amount: number;
    percentage: number;
    baseLegal: string;
    status: 'PAID' | 'SUSPENDED';
  } {
    // Validar percentual (5% a 15%)
    if (percentage < 5 || percentage > 15) {
      percentage = 10; // Padrão
    }
    
    const amount = condemnationAmount * (percentage / 100);
    const status = freeJustice ? 'SUSPENDED' : 'PAID';
    
    this.calculationMemory.push(
      `=== HONORÁRIOS ADVOCATÍCIOS (Art. 791-A CLT) ===`,
      `Valor da condenação: R$ ${condemnationAmount.toFixed(2)}`,
      `Percentual: ${percentage}% (entre 5% e 15%)`,
      `Honorários: R$ ${amount.toFixed(2)}`,
      freeJustice 
        ? `⚠️ SUSPENSOS por 2 anos (Justiça Gratuita - §4º)`
        : `✅ Devidos pela parte sucumbente`
    );
    
    this.legalBasis.push(
      'Art. 791-A CLT - Honorários de sucumbência (Lei 13.467/2017)',
      freeJustice ? 'Art. 791-A §4º CLT - Suspensão condicional' : ''
    );
    
    return {
      amount,
      percentage,
      baseLegal: 'CLT Art. 791-A (Lei 13.467/2017)',
      status
    };
  }

  getCalculationMemory(): string[] {
    return this.calculationMemory;
  }

  getLegalBasis(): string[] {
    return this.legalBasis.filter(b => b !== '');
  }
}










