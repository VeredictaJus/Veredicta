/**
 * Tabelas de Impostos e Contribuições - 2025
 * 
 * Contém as tabelas oficiais para cálculos de:
 * - INSS (Tabela Progressiva)
 * - IRRF (Imposto de Renda Retido na Fonte)
 * - Outros descontos legais
 */

// ===== TABELA INSS 2025 =====
export const INSS_TABLE_2025 = [
  { limit: 1412.00, rate: 0.075 },   // Até 1 SM: 7,5%
  { limit: 2666.68, rate: 0.09 },    // Até R$ 2.666,68: 9%
  { limit: 4000.03, rate: 0.12 },    // Até R$ 4.000,03: 12%
  { limit: 7786.02, rate: 0.14 },    // Até teto: 14%
];

export const INSS_MAX_2025 = 7786.02; // Teto do INSS 2025

/**
 * Calcula INSS com tabela progressiva
 */
export function calculateINSS(salary: number): number {
  if (salary <= 0) return 0;
  
  let inss = 0;
  let previousLimit = 0;
  
  for (const bracket of INSS_TABLE_2025) {
    if (salary > previousLimit) {
      const taxableAmount = Math.min(salary, bracket.limit) - previousLimit;
      inss += taxableAmount * bracket.rate;
      previousLimit = bracket.limit;
    }
  }
  
  return inss;
}

// ===== TABELA IRRF 2025 =====
export const IRRF_TABLE_2025 = [
  { limit: 2259.20, rate: 0.00, deduction: 0 },         // Isento
  { limit: 2826.65, rate: 0.075, deduction: 169.44 },   // 7,5%
  { limit: 3751.05, rate: 0.15, deduction: 381.44 },    // 15%
  { limit: 4664.68, rate: 0.225, deduction: 662.77 },   // 22,5%
  { limit: Infinity, rate: 0.275, deduction: 896.00 },  // 27,5%
];

export const IRRF_DEPENDENT_DEDUCTION_2025 = 189.59; // Por dependente

/**
 * Calcula IRRF com tabela progressiva
 */
export function calculateIRRF(
  salary: number,
  inssDiscount: number,
  dependents: number = 0
): number {
  // Base de cálculo = Salário - INSS - (Dependentes × R$ 189,59)
  const dependentDeduction = dependents * IRRF_DEPENDENT_DEDUCTION_2025;
  const taxableIncome = salary - inssDiscount - dependentDeduction;
  
  if (taxableIncome <= 0) return 0;
  
  // Encontrar faixa
  let bracket = IRRF_TABLE_2025[0];
  for (const b of IRRF_TABLE_2025) {
    if (taxableIncome <= b.limit) {
      bracket = b;
      break;
    }
  }
  
  // Calcular IRRF
  const irrf = (taxableIncome * bracket.rate) - bracket.deduction;
  
  return Math.max(irrf, 0);
}

// ===== VALE-TRANSPORTE =====
export const VT_MAX_DISCOUNT_RATE = 0.06; // Máximo 6% do salário

export function calculateVTDiscount(salary: number, vtValue: number): number {
  const maxDiscount = salary * VT_MAX_DISCOUNT_RATE;
  return Math.min(vtValue, maxDiscount);
}

// ===== VALE-REFEIÇÃO =====
export const VR_DEFAULT_COPARTICIPATION = 0.20; // 20% padrão (pode variar)

export function calculateVRDiscount(vrValue: number, coparticipationRate: number = VR_DEFAULT_COPARTICIPATION): number {
  return vrValue * coparticipationRate;
}

// ===== CONTRIBUIÇÃO SINDICAL =====
export const SINDICAL_RATE = 0.01; // 1 dia de salário (1/30)

export function calculateSindicalContribution(salary: number, isOptional: boolean): number {
  if (isOptional) return 0;
  return salary / 30; // 1 dia de trabalho
}

// ===== FALTAS E ATRASOS =====
export function calculateAbsenceDiscount(salary: number, absentDays: number): number {
  const dailySalary = salary / 30;
  return dailySalary * absentDays;
}

export function calculateDSRLoss(salary: number, absentDays: number): number {
  // Perde DSR se faltar injustificadamente
  const workingDaysPerMonth = 25;
  const restDaysPerMonth = 5;
  const dailySalary = salary / 30;
  
  return (dailySalary * absentDays / workingDaysPerMonth) * restDaysPerMonth;
}










