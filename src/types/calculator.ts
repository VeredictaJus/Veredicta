export interface LaborCalculatorData {
  // === DADOS PESSOAIS ===
  employeeName: string;
  cpf: string;
  admissionDate: string;
  terminationDate?: string;
  terminationType: 'DISMISSAL_WITHOUT_CAUSE' | 'DISMISSAL_WITH_CAUSE' | 'RESIGNATION' | 'MUTUAL_AGREEMENT' | 'INDIRECT_TERMINATION';
  
  // === DADOS SALARIAIS ===
  baseSalary: number;
  additionalSalary?: number;
  
  // === ADICIONAIS ===
  additionals: {
    insalubrity?: { percentage: 10 | 20 | 40; basis: 'MINIMUM_WAGE' | 'BASE_SALARY' };
    dangerousness?: { percentage: 30; basis: 'BASE_SALARY' };
    nightShift?: { percentage: 20; hours: number };
    overtime?: { weekdayHours: number; weekendHours: number; };
    transferBonus?: { percentage: 25; months: number }; // 🆕 Adicional de transferência
    breakageFee?: { percentage: 10 }; // 🆕 Quebra de caixa
    timeServiceBonus?: { percentagePerYear: number; years: number }; // 🆕 Anuênio
  };
  
  // === JORNADA DE TRABALHO ===
  workingHours: {
    dailyHours: number;
    weeklyHours: number;
    intervalTime: number; // em minutos
    nightShiftStart?: string; // HH:mm
    nightShiftEnd?: string; // HH:mm
    onCallHours?: number; // 🆕 Horas de sobreaviso
    standbyHours?: number; // 🆕 Horas de prontidão
    inItinereHours?: number; // 🆕 Horas in itinere (pré-reforma)
    art384DaysPerMonth?: number; // 🆕 Dias com HE (mulher) para 15min adicionais
  };
  
  // === VERBAS RESCISÓRIAS ===
  severance: {
    noticePeriod: number; // em dias
    noticePeriodProportional?: boolean; // 🆕 Aviso prévio proporcional (Lei 12.506/2011)
    vacationDays: number;
    vacationDaysDouble?: number; // 🆕 Férias vencidas (períodos completos não gozados)
    thirteenthSalaryMonths: number;
    fgtsBalance: number;
    lastSalaryDays: number;
    delayedPayment?: boolean; // 🆕 Para multa Art. 477
    delayDays?: number;
    undisputedAmountUnpaid?: number; // 🆕 Para multa Art. 467
    dismissalNearCategoryBaseDate?: boolean; // 🆕 Demissão 30 dias antes data-base (Lei 7.238/84)
  };
  
  // === INTERVALOS ===
  intervals: {
    lunchBreakViolations: number; // minutos suprimidos
    lunchBreakPeriod?: 'day' | 'week' | 'month'; // frequência (padrão: week)
    betweenShiftsViolations: number; // minutos suprimidos
    betweenShiftsPeriod?: 'day' | 'week' | 'month'; // frequência (padrão: week)
  };
  
  // === DESVIO DE FUNÇÃO ===
  functionDeviation?: {
    hasDeviation: boolean;
    originalPosition: string;
    deviatedPosition: string;
    differenceAmount: number;
    deviationPeriodMonths: number;
  };
  
  // === ESTABILIDADES ===
  stability?: {
    pregnancy?: {
      hasStability: boolean;
      pregnancyConfirmDate: string;
      childbirthDate: string;
    };
    accident?: {
      hasStability: boolean;
      inssReleaseDate: string; // Alta do INSS (12 meses após)
    };
    cipa?: {
      hasStability: boolean;
      role: 'HOLDER' | 'ALTERNATE';
      mandateStart: string;
      mandateEnd: string;
    };
    preRetirement?: {
      hasStability: boolean;
      retirementDate: string;
      monthsUntilRetirement: number;
    };
    union?: {
      hasStability: boolean;
      mandateEnd: string;
    };
  };
  
  // === EQUIPARAÇÃO SALARIAL ===
  salaryEqualization?: {
    hasEqualization: boolean;
    paradigmName: string; // Nome do paradigma
    paradigmSalary: number;
    equalizationPeriodMonths: number;
  };
  
  // === OUTROS DIREITOS ===
  otherRights?: {
    habitualPrize?: { monthlyAmount: number; months: number }; // 🆕 Prêmio habitual
    unpaidCommissions?: { totalAmount: number }; // 🆕 Comissões não pagas
    tips?: { monthlyAverage: number; months: number }; // 🆕 Gorjetas
    suppressionHoursExtras?: { habitualHours: number; years: number }; // 🆕 Supressão de HE
    profitSharing?: { unpaidAmount: number }; // 🆕 PPR não pago
    transportVoucher?: { dailyAmount: number; days: number }; // 🆕 VT não fornecido
    mealVoucher?: { dailyAmount: number; days: number }; // 🆕 VA não fornecido
    healthInsurance?: { monthlyAmount: number; months: number }; // 🆕 Plano não custeado
    lifeInsurance?: { monthlyAmount: number; months: number }; // 🆕 Seguro de vida
    basicBasket?: { monthlyAmount: number; months: number }; // 🆕 Cesta básica
    accumulationOfFunctions?: { additionalSalary: number; months: number }; // 🆕 Acúmulo de função
  };
  
  // === BANCO DE HORAS ===
  timeBank?: {
    hasTimeBank: boolean;
    owedHours: number; // Horas devidas ao trabalhador
    paidHours: number; // Horas já pagas
  };
  
  // === DESCONTOS ===
  discounts?: {
    inss?: { calculate: boolean; dependents?: number };
    irrf?: { calculate: boolean; dependents?: number };
    transportVoucher?: { monthlyValue: number; hasDiscount: boolean };
    mealVoucher?: { monthlyValue: number; coparticipationRate: number };
    sindicalContribution?: { isOptional: boolean };
    absences?: { days: number; justified: boolean };
    delays?: { hours: number };
  };
  
  // === INDENIZAÇÕES ===
  damages?: {
    moralDamage?: {
      hasDamage: boolean;
      type: 'MORAL_HARASSMENT' | 'SEXUAL_HARASSMENT' | 'WORK_ACCIDENT' | 'DISCRIMINATION' | 'OCCUPATIONAL_DISEASE' | 'OTHER';
      severity: 'LIGHT' | 'MEDIUM' | 'SERIOUS' | 'VERY_SERIOUS';
      suggestedAmount?: number;
    };
    materialDamage?: {
      hasDamage: boolean;
      medicalExpenses?: number;
      lostProfits?: number;
      monthlyPension?: number;
      pensionMonths?: number;
    };
    existentialDamage?: {
      hasDamage: boolean;
      excessiveWorkload: boolean;
      privationSocialLife: boolean;
      suggestedAmount?: number;
    };
    additionalCompensation?: {
      hasCompensation: boolean; // 🆕 Lei 7.238/84 (demissão 30 dias antes da data-base)
    };
  };
  
  // === CORREÇÃO E JUROS ===
  monetaryCorrection?: {
    applyCorrection: boolean;
    index: 'IPCA-E' | 'TR' | 'IPCA'; // IPCA-E é padrão TST desde 2015
    calculationDate: string; // Data do cálculo
  };
  
  interest?: {
    applyInterest: boolean;
    rate: number; // Taxa mensal (padrão: 1%)
    type: 'SIMPLE' | 'COMPOUND'; // Simples é padrão trabalhista
    startDate: string; // Data inicial (geralmente citação)
  };

  // === MÉDIAS DE VARIÁVEIS ===
  averages?: {
    period: 3 | 6 | 12; // 🆕 Período de médias
    includeOvertime: boolean; // 🆕 Considerar HE nas médias
    includeAdditionals: boolean; // 🆕 Considerar adicionais nas médias
    includeCommissions: boolean; // 🆕 Considerar comissões nas médias
  };
  
  // === HONORÁRIOS ===
  honorarios?: {
    calculateHonorarios: boolean;
    percentage: number; // 5% a 15% (CLT Art. 791-A)
    freeJustice: boolean; // Suspensão condicional
  };
}

export interface CalculationResult {
  id: string;
  employeeName: string;
  calculationDate: string;
  
  // === VERBAS RESCISÓRIAS ===
  severanceResults: {
    noticePay: number;
    noticeProporcional: number; // 🆕 Adicional proporcional (3 dias/ano)
    noticeDaysBase?: number; // 🆕 Dias base considerados (até 30)
    noticeDaysProportional?: number; // 🆕 Dias proporcionais (>30)
    noticeDaysTotal?: number; // 🆕 Total de dias considerados
    lastSalary: number;
    vacationPay: number;
    vacationPayDouble: number; // 🆕 Férias em dobro
    vacationBonus: number; // 1/3 constitucional
    thirteenthSalary: number;
    fgtsWithdrawal: number;
    fgtsPenalty: number; // 40%
    art477Fine: number; // 🆕 Multa Art. 477 (atraso)
    art467Fine: number; // 🆕 Multa Art. 467 (verbas incontroversas)
    additionalCompensation?: number; // 🆕 Indenização adicional (Lei 7.238/84)
    total: number;
  };
  
  // === HORAS EXTRAS E INTERVALOS ===
  overtimeResults: {
    weekdayOvertime: number;
    weekendOvertime: number;
    lunchBreakPenalty: number;
    betweenShiftsPenalty: number;
    nightShiftDifferential: number;
    onCallPay: number; // 🆕 Sobreaviso
    standbyPay: number; // 🆕 Prontidão
    inItinerePay: number; // 🆕 Horas in itinere
    dsrOverHoursExtras: number; // 🆕 DSR sobre horas extras
    reflectionsDetailed?: { // 🆕 Reflexos DETALHADOS sobre HE
      vacationReflection: number;
      vacationBonusReflection: number;
      thirteenthReflection: number;
      fgtsReflection: number;
    };
    reflectionsByItem?: { // 🆕 Reflexos por item (HE 50% e HE 100%)
      weekday?: {
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      weekend?: {
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      lunchBreak?: { // 🆕 Intervalo intrajornada (Art. 71)
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      betweenShifts?: { // 🆕 Intervalo interjornada (Art. 66)
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      onCall?: { // 🆕 Reflexos do Sobreaviso
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      standby?: { // 🆕 Reflexos da Prontidão
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      nightShift?: { // 🆕 Reflexos do Adicional Noturno
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
      inItinere?: { // 🆕 Reflexos das Horas In Itinere
        vacation: number;
        vacationBonus: number;
        thirteenth: number;
        fgts: number;
      };
    };
    total: number;
  };
  
  // === ADICIONAIS ===
  additionalsResults: {
    insalubrityAmount: number;
    dangerousnessAmount: number;
    transferBonusAmount: number; // 🆕 Adicional de transferência
    breakageFeeAmount: number; // 🆕 Quebra de caixa
    timeServiceBonusAmount: number; // 🆕 Anuênio
    reflections: number; // TOTAL dos reflexos
    reflectionsDetailed?: { // 🆕 Reflexos DETALHADOS
      dsrReflection: number;
      vacationReflection: number;
      vacationBonusReflection: number;
      thirteenthReflection: number;
    };
    reflectionsByItem?: { // 🆕 Reflexos por adicional
      insalubrity?: { dsr: number; vacation: number; vacationBonus: number; thirteenth: number; };
      dangerousness?: { dsr: number; vacation: number; vacationBonus: number; thirteenth: number; };
      transferBonus?: { dsr: number; vacation: number; vacationBonus: number; thirteenth: number; };
      breakageFee?: { dsr: number; vacation: number; vacationBonus: number; thirteenth: number; };
      timeServiceBonus?: { dsr: number; vacation: number; vacationBonus: number; thirteenth: number; };
    };
    total: number;
  };
  
  // === DESVIO DE FUNÇÃO ===
  functionDeviationResults?: {
    salaryDifference: number;
    reflections: number;
    reflectionsDetailed?: { // 🆕 Reflexos DETALHADOS
      vacationReflection: number;
      vacationBonusReflection: number;
      thirteenthReflection: number;
      dsrReflection: number;
      fgtsReflection: number;
    };
    total: number;
  };
  
  // === ESTABILIDADES ===
  stabilityResults?: {
    pregnancyStability: number;
    accidentStability: number;
    cipaStability: number;
    preRetirementStability: number;
    unionStability: number;
    total: number;
  };
  
  // === EQUIPARAÇÃO SALARIAL ===
  equalizationResults?: {
    salaryDifference: number;
    reflections: number;
    total: number;
  };
  
  // === OUTROS DIREITOS ===
  otherRightsResults?: {
    habitualPrize: number;
    unpaidCommissions: number;
    tips: number;
    suppressionHE: number; // Supressão de horas extras
    profitSharing: number;
    transportVoucher: number;
    mealVoucher: number;
    healthInsurance: number;
    lifeInsurance: number;
    basicBasket: number;
    total: number;
  };
  
  // === INDENIZAÇÕES ===
  damagesResults?: {
    moralDamage: number;
    materialDamage: number;
    existentialDamage: number;
    additionalCompensation: number; // Lei 7.238/84
    total: number;
  };
  
  // === SUBTOTAL ANTES CORREÇÃO ===
  subtotalBeforeCorrection: number;
  
  // === CORREÇÃO MONETÁRIA ===
  monetaryCorrectionResults?: {
    correctedAmount: number;
    correctionValue: number;
    percentageTotal: number;
    index: string;
    monthlyDetails: Array<{
      month: string;
      indexValue: number;
      accumulated: number;
    }>;
  };
  
  // === JUROS DE MORA ===
  interestResults?: {
    interestAmount: number;
    months: number;
    monthlyRate: number;
    type: 'SIMPLE' | 'COMPOUND';
  };
  
  // === TOTAL ATUALIZADO ===
  totalWithCorrectionAndInterest: number;
  
  // === HONORÁRIOS ===
  honorariosResults?: {
    amount: number;
    percentage: number;
    baseLegal: string;
    status: 'PAID' | 'SUSPENDED'; // Suspenso se justiça gratuita
  };
  
  // === CUSTAS PROCESSUAIS ===
  courtCosts?: {
    amount: number;
    percentage: number; // 2% sobre condenação
  };
  
  // === DESCONTOS ===
  discountsResults?: {
    inss: number;
    irrf: number;
    transportVoucher: number;
    mealVoucher: number;
    sindicalContribution: number;
    absences: number;
    dsrLoss: number; // Perda de DSR por faltas
    delays: number;
    total: number;
  };
  
  // === TOTAL LÍQUIDO (BRUTO - DESCONTOS) ===
  netTotal?: number;
  
  // === TOTAL FINAL GERAL ===
  grandTotal: number;
  
  // === DADOS PARA PETIÇÃO ===
  calculationMemory: string[];
  legalBasis: string[];
  prescriptionWarnings: string[];
  
  // === RESUMO EXECUTIVO ===
  summary?: {
    totalVerbasRescissorias: number;
    totalHorasExtras: number;
    totalAdicionais: number;
    totalEstabilidades: number;
    totalIndenizacoes: number;
    totalCorrecao: number;
    totalJuros: number;
    totalHonorarios: number;
  };
}

export interface CalculatorStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}