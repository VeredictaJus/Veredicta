/**
 * Calculadora de Descontos Trabalhistas
 * 
 * Implementa todos os descontos legais:
 * - INSS (tabela progressiva)
 * - IRRF (tabela progressiva)
 * - Vale-transporte
 * - Vale-refeição
 * - Contribuição sindical
 * - Faltas e atrasos
 */

import { LaborCalculatorData } from '@/types/calculator';
import { 
  calculateINSS, 
  calculateIRRF,
  calculateVTDiscount,
  calculateVRDiscount,
  calculateSindicalContribution,
  calculateAbsenceDiscount,
  calculateDSRLoss
} from './taxTables';

export class DiscountsCalculator {
  private data: LaborCalculatorData;
  private calculationMemory: string[] = [];

  constructor(data: LaborCalculatorData) {
    this.data = data;
  }

  /**
   * Calcula todos os descontos
   */
  public calculateAllDiscounts(grossSalary: number): {
    inss: number;
    irrf: number;
    transportVoucher: number;
    mealVoucher: number;
    sindicalContribution: number;
    absences: number;
    dsrLoss: number;
    delays: number;
    total: number;
    memory: string[];
  } {
    this.calculationMemory = [];
    this.calculationMemory.push('=== CÁLCULO DE DESCONTOS ===');
    this.calculationMemory.push('');

    // === 1. INSS ===
    let inss = 0;
    if (this.data.discounts?.inss?.calculate) {
      inss = calculateINSS(grossSalary);
      this.calculationMemory.push(`1. INSS (Tabela Progressiva 2025):`);
      this.calculationMemory.push(`   Base de cálculo: R$ ${grossSalary.toFixed(2)}`);
      this.calculationMemory.push(`   INSS descontado: R$ ${inss.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 2. IRRF ===
    let irrf = 0;
    if (this.data.discounts?.irrf?.calculate) {
      const dependents = this.data.discounts.irrf.dependents || 0;
      irrf = calculateIRRF(grossSalary, inss, dependents);
      
      this.calculationMemory.push(`2. IRRF (Imposto de Renda 2025):`);
      this.calculationMemory.push(`   Salário bruto: R$ ${grossSalary.toFixed(2)}`);
      this.calculationMemory.push(`   (-) INSS: R$ ${inss.toFixed(2)}`);
      if (dependents > 0) {
        this.calculationMemory.push(`   (-) Dependentes: ${dependents} × R$ 189,59 = R$ ${(dependents * 189.59).toFixed(2)}`);
      }
      const taxableIncome = grossSalary - inss - (dependents * 189.59);
      this.calculationMemory.push(`   Base de cálculo: R$ ${taxableIncome.toFixed(2)}`);
      this.calculationMemory.push(`   IRRF descontado: R$ ${irrf.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 3. VALE-TRANSPORTE ===
    let transportVoucher = 0;
    if (this.data.discounts?.transportVoucher?.hasDiscount) {
      const vtValue = this.data.discounts.transportVoucher.monthlyValue;
      transportVoucher = calculateVTDiscount(grossSalary, vtValue);
      
      this.calculationMemory.push(`3. VALE-TRANSPORTE (máx 6%):`);
      this.calculationMemory.push(`   Valor VT: R$ ${vtValue.toFixed(2)}`);
      this.calculationMemory.push(`   Máximo descontável (6%): R$ ${(grossSalary * 0.06).toFixed(2)}`);
      this.calculationMemory.push(`   Desconto: R$ ${transportVoucher.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 4. VALE-REFEIÇÃO ===
    let mealVoucher = 0;
    if (this.data.discounts?.mealVoucher) {
      const vrValue = this.data.discounts.mealVoucher.monthlyValue;
      const coparticipation = this.data.discounts.mealVoucher.coparticipationRate;
      mealVoucher = calculateVRDiscount(vrValue, coparticipation);
      
      this.calculationMemory.push(`4. VALE-REFEIÇÃO (coparticipação ${(coparticipation * 100).toFixed(0)}%):`);
      this.calculationMemory.push(`   Valor VR: R$ ${vrValue.toFixed(2)}`);
      this.calculationMemory.push(`   Taxa: ${(coparticipation * 100).toFixed(0)}%`);
      this.calculationMemory.push(`   Desconto: R$ ${mealVoucher.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 5. CONTRIBUIÇÃO SINDICAL ===
    let sindicalContribution = 0;
    if (this.data.discounts?.sindicalContribution) {
      sindicalContribution = calculateSindicalContribution(
        grossSalary,
        this.data.discounts.sindicalContribution.isOptional
      );
      
      if (sindicalContribution > 0) {
        this.calculationMemory.push(`5. CONTRIBUIÇÃO SINDICAL (1 dia de salário):`);
        this.calculationMemory.push(`   Base: R$ ${grossSalary.toFixed(2)} ÷ 30 = R$ ${(grossSalary / 30).toFixed(2)}`);
        this.calculationMemory.push(`   Desconto: R$ ${sindicalContribution.toFixed(2)}`);
        this.calculationMemory.push('');
      }
    }

    // === 6. FALTAS ===
    let absences = 0;
    let dsrLoss = 0;
    
    if (this.data.discounts?.absences && this.data.discounts.absences.days > 0) {
      absences = calculateAbsenceDiscount(grossSalary, this.data.discounts.absences.days);
      
      // Se faltas injustificadas, perde também o DSR
      if (!this.data.discounts.absences.justified) {
        dsrLoss = calculateDSRLoss(grossSalary, this.data.discounts.absences.days);
      }
      
      this.calculationMemory.push(`6. FALTAS (${this.data.discounts.absences.days} dias):`);
      this.calculationMemory.push(`   Tipo: ${this.data.discounts.absences.justified ? 'Justificadas' : 'Injustificadas'}`);
      this.calculationMemory.push(`   Desconto faltas: R$ ${absences.toFixed(2)}`);
      if (dsrLoss > 0) {
        this.calculationMemory.push(`   Perda DSR: R$ ${dsrLoss.toFixed(2)}`);
      }
      this.calculationMemory.push(`   Total: R$ ${(absences + dsrLoss).toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 7. ATRASOS ===
    let delays = 0;
    if (this.data.discounts?.delays && this.data.discounts.delays.hours > 0) {
      const hourlyRate = grossSalary / 220;
      delays = hourlyRate * this.data.discounts.delays.hours;
      
      this.calculationMemory.push(`7. ATRASOS (${this.data.discounts.delays.hours} horas):`);
      this.calculationMemory.push(`   Valor hora: R$ ${hourlyRate.toFixed(2)}`);
      this.calculationMemory.push(`   Desconto: R$ ${delays.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    const total = inss + irrf + transportVoucher + mealVoucher + sindicalContribution + 
                  absences + dsrLoss + delays;

    if (total > 0) {
      this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      this.calculationMemory.push(`TOTAL DESCONTOS: R$ ${total.toFixed(2)}`);
      this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      this.calculationMemory.push('');
    }

    return {
      inss,
      irrf,
      transportVoucher,
      mealVoucher,
      sindicalContribution,
      absences,
      dsrLoss,
      delays,
      total,
      memory: this.calculationMemory
    };
  }
}










