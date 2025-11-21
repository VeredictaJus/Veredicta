import { LaborCalculatorData, CalculationResult } from '@/types/calculator';
import { LABOR_CONSTANTS, LEGAL_BASIS } from './laborConstants';
import { AdvancedLaborCalculations } from './advancedCalculations';
import { DiscountsCalculator } from './discountsCalculator';
import { BacenService } from '@/services/bacenService';
import { getHolidaysInRange } from './holidayService';

export class LaborCalculator {
  private data: LaborCalculatorData;
  private calculationMemory: string[] = [];
  private legalBasis: string[] = [];
  private warnings: string[] = [];
  // Contexto de horas extras/adicionais para uso em verbas rescisórias
  private overtimeContext?: {
    monthsWorked: number;
    // total de verbas variáveis que compõem remuneração para FGTS/reflexos
    totalVariableForFgts: number;
    // média mensal dessas variáveis
    variableMonthlyAvg: number;
  };

  constructor(data: LaborCalculatorData) {
    this.data = data;
  }

  public calculate(): CalculationResult {
    this.calculationMemory = [];
    this.legalBasis = [];
    this.warnings = [];

    // Calcular cada categoria
    const severanceResults = this.calculateSeverance();
    const overtimeResults = this.calculateOvertime();
    const additionalsResults = this.calculateAdditionals();
    const functionDeviationResults = this.calculateFunctionDeviation();

    // Total geral
    const subtotalBeforeCorrection = 
      severanceResults.total + 
      overtimeResults.total + 
      additionalsResults.total + 
      (functionDeviationResults?.total || 0);

    // === HONORÁRIOS ADVOCATÍCIOS (sempre 15%) ===
    const advancedCalc = new AdvancedLaborCalculations(this.data);
    const honorariosPercentage = this.data.honorarios?.percentage ?? 15;
    const honorariosFree = this.data.honorarios?.freeJustice ?? false;
    const honorariosResults = advancedCalc.calculateHonorarios(
      subtotalBeforeCorrection,
      honorariosPercentage,
      honorariosFree
    );

    this.calculationMemory.push(`\n=== HONORÁRIOS ADVOCATÍCIOS (${honorariosPercentage}% - CLT 791-A) ===`);
    this.calculationMemory.push(`Base: R$ ${subtotalBeforeCorrection.toFixed(2)} × ${honorariosPercentage}%`);
    this.calculationMemory.push(`Honorários: R$ ${honorariosResults.amount.toFixed(2)}`);

    const grandTotal = subtotalBeforeCorrection + honorariosResults.amount;

    this.calculationMemory.push(`\n=== TOTAL GERAL (COM HONORÁRIOS) ===`);
    this.calculationMemory.push(`Subtotal: R$ ${subtotalBeforeCorrection.toFixed(2)}`);
    this.calculationMemory.push(`Honorários: R$ ${honorariosResults.amount.toFixed(2)}`);
    this.calculationMemory.push(`Total: R$ ${grandTotal.toFixed(2)}`);

    return {
      id: this.generateId(),
      employeeName: this.data.employeeName,
      calculationDate: new Date().toISOString(),
      severanceResults,
      overtimeResults,
      additionalsResults,
      functionDeviationResults,
      subtotalBeforeCorrection,
      totalWithCorrectionAndInterest: subtotalBeforeCorrection,
      honorariosResults,
      grandTotal: grandTotal,
      calculationMemory: this.calculationMemory,
      legalBasis: this.legalBasis,
      prescriptionWarnings: this.warnings,
    };
  }

  /**
   * Cálculo COMPLETO com correção monetária e juros (ASSÍNCRONO)
   * Inclui todos os cálculos avançados
   */
  public async calculateComplete(): Promise<CalculationResult> {
    this.calculationMemory = [];
    this.legalBasis = [];
    this.warnings = [];

    // === CÁLCULOS BÁSICOS ===
    const severanceResults = this.calculateSeverance();
    const overtimeResults = this.calculateOvertime();
    const additionalsResults = this.calculateAdditionals();
    const functionDeviationResults = this.calculateFunctionDeviation();

    // === CÁLCULOS AVANÇADOS ===
    const advancedCalc = new AdvancedLaborCalculations(this.data);
    
    // Estabilidades
    let stabilityResults = undefined;
    if (this.data.stability) {
      let stabilityTotal = 0;
      
      if (this.data.stability.pregnancy && this.data.terminationDate) {
        const pregnancyStability = advancedCalc.calculatePregnancyStability(
          new Date(this.data.stability.pregnancy.pregnancyConfirmDate),
          new Date(this.data.stability.pregnancy.childbirthDate),
          new Date(this.data.terminationDate)
        );
        stabilityTotal += pregnancyStability;
      }
      
      if (this.data.stability.accident && this.data.terminationDate) {
        const accidentStability = advancedCalc.calculateAccidentStability(
          new Date(this.data.stability.accident.inssReleaseDate),
          new Date(this.data.terminationDate)
        );
        stabilityTotal += accidentStability;
      }
      
      if (stabilityTotal > 0) {
        stabilityResults = {
          pregnancyStability: this.data.stability.pregnancy ? stabilityTotal : 0,
          accidentStability: this.data.stability.accident ? stabilityTotal : 0,
          cipaStability: 0,
          preRetirementStability: 0,
          unionStability: 0,
          total: stabilityTotal
        };
      }
    }

    // Equiparação salarial
    let equalizationResults = undefined;
    if (this.data.salaryEqualization?.hasEqualization) {
      const equip = advancedCalc.calculateSalaryEqualization(
        this.data.salaryEqualization.paradigmSalary,
        this.data.salaryEqualization.equalizationPeriodMonths
      );
      equalizationResults = equip;
    }

    // === SUBTOTAL ANTES CORREÇÃO ===
    let subtotalBeforeCorrection = 
      severanceResults.total + 
      overtimeResults.total + 
      additionalsResults.total + 
      (functionDeviationResults?.total || 0) +
      (stabilityResults?.total || 0) +
      (equalizationResults?.total || 0);

    this.calculationMemory.push(`\n=== SUBTOTAL ANTES DE CORREÇÃO ===`);
    this.calculationMemory.push(`R$ ${subtotalBeforeCorrection.toFixed(2)}`);

    // === CORREÇÃO MONETÁRIA ===
    let monetaryCorrectionResults = undefined;
    if (this.data.monetaryCorrection?.applyCorrection && this.data.terminationDate) {
      try {
        const correction = await BacenService.aplicarCorrecaoMonetaria(
          subtotalBeforeCorrection,
          this.data.terminationDate,
          this.data.monetaryCorrection.calculationDate,
          this.data.monetaryCorrection.index
        );
        
        monetaryCorrectionResults = {
          correctedAmount: correction.valorCorrigido,
          correctionValue: correction.totalCorrecao,
          percentageTotal: correction.percentualTotal,
          index: this.data.monetaryCorrection.index,
          monthlyDetails: correction.detalhamento.map(d => ({
            month: d.mes,
            indexValue: d.indice,
            accumulated: d.valorAcumulado
          }))
        };
        
        subtotalBeforeCorrection = correction.valorCorrigido;
        
        this.calculationMemory.push(`\n=== CORREÇÃO MONETÁRIA (${this.data.monetaryCorrection.index}) ===`);
        this.calculationMemory.push(`Valor corrigido: R$ ${correction.valorCorrigido.toFixed(2)}`);
        this.calculationMemory.push(`Correção: R$ ${correction.totalCorrecao.toFixed(2)} (${correction.percentualTotal.toFixed(2)}%)`);
        this.legalBasis.push('Resolução 134/2011 CNJ - IPCA-E para correção monetária');
      } catch (error) {
        console.error('Erro ao aplicar correção monetária:', error);
        this.calculationMemory.push(`⚠️ Erro ao buscar índices do Bacen. Cálculo sem correção.`);
      }
    }

    // === JUROS DE MORA ===
    let interestResults = undefined;
    let totalWithCorrectionAndInterest = subtotalBeforeCorrection;
    
    if (this.data.interest?.applyInterest && this.data.interest.startDate) {
      const calculationDate = this.data.monetaryCorrection?.calculationDate || new Date().toISOString();
      const jurosTipo = this.data.interest.type === 'SIMPLE' ? 'SIMPLES' : 'COMPOSTO';
      const juros = BacenService.calcularJurosMora(
        subtotalBeforeCorrection,
        this.data.interest.startDate,
        calculationDate,
        this.data.interest.rate,
        jurosTipo
      );
      
      interestResults = {
        interestAmount: juros.valorJuros,
        months: juros.meses,
        monthlyRate: juros.taxaMensal,
        type: jurosTipo
      };
      
      totalWithCorrectionAndInterest = juros.valorTotal;
      
      this.calculationMemory.push(`\n=== JUROS DE MORA ===`);
      this.calculationMemory.push(`Taxa: ${juros.taxaMensal}% ao mês (${jurosTipo})`);
      this.calculationMemory.push(`Período: ${juros.meses} meses`);
      this.calculationMemory.push(`Juros: R$ ${juros.valorJuros.toFixed(2)}`);
      this.calculationMemory.push(`Total com juros: R$ ${juros.valorTotal.toFixed(2)}`);
      this.legalBasis.push('Súmula 200 TST - Juros de mora');
    }

    // === FERIADOS NO PERÍODO ===
    if (this.data.admissionDate && this.data.terminationDate) {
      const holidays = getHolidaysInRange(this.data.admissionDate, this.data.terminationDate);
      if (holidays.length > 0) {
        this.calculationMemory.push(`\n=== FERIADOS NACIONAIS NO PERÍODO ===`);
        holidays.forEach(h => {
          const [y, m, d] = h.date.split('-');
          this.calculationMemory.push(`- ${d}/${m}/${y}: ${h.name}`);
        });
      }
    }

    // === HONORÁRIOS (sempre exibir 15%) ===
    const honorariosPercentage = this.data.honorarios?.percentage ?? 15;
    const honorariosFree = this.data.honorarios?.freeJustice ?? false;
    const honorariosResults = advancedCalc.calculateHonorarios(
      totalWithCorrectionAndInterest,
      honorariosPercentage,
      honorariosFree
    );

    this.calculationMemory.push(`\n=== HONORÁRIOS ADVOCATÍCIOS (${honorariosPercentage}% - CLT 791-A) ===`);
    this.calculationMemory.push(`Base: R$ ${totalWithCorrectionAndInterest.toFixed(2)} × ${honorariosPercentage}%`);
    this.calculationMemory.push(`Honorários: R$ ${honorariosResults.amount.toFixed(2)}`);

    // === DESCONTOS (INSS / IRRF / etc.) ===
    const discountsCalc = new DiscountsCalculator(this.data as any);
    const discountsResults = discountsCalc.calculateAllDiscounts(subtotalBeforeCorrection);
    this.calculationMemory.push(...discountsResults.memory);

    // === TOTAL FINAL ===
    const grandTotal = totalWithCorrectionAndInterest + (honorariosResults?.amount || 0);
    const netTotal = grandTotal - discountsResults.total;

    this.calculationMemory.push(`\n=== TOTAL GERAL ===`);
    this.calculationMemory.push(`R$ ${grandTotal.toFixed(2)}`);

    // Adicionar memórias dos cálculos avançados
    this.calculationMemory.push(...advancedCalc.getCalculationMemory());
    this.legalBasis.push(...advancedCalc.getLegalBasis());

    return {
      id: this.generateId(),
      employeeName: this.data.employeeName,
      calculationDate: new Date().toISOString(),
      severanceResults,
      overtimeResults,
      additionalsResults,
      functionDeviationResults,
      stabilityResults,
      equalizationResults,
      subtotalBeforeCorrection,
      monetaryCorrectionResults,
      interestResults,
      totalWithCorrectionAndInterest,
      honorariosResults,
      discountsResults,
      netTotal,
      grandTotal,
      calculationMemory: this.calculationMemory,
      legalBasis: this.legalBasis,
      prescriptionWarnings: this.warnings,
    };
  }

  private calculateSeverance() {
    const { baseSalary, severance, terminationType, admissionDate, terminationDate } = this.data;
    
    this.addLegalBasis(LEGAL_BASIS.SEVERANCE);
    this.calculationMemory.push('=== CÁLCULO DE VERBAS RESCISÓRIAS ===');
    this.calculationMemory.push('');

    // Calcular anos trabalhados para aviso prévio proporcional
    const yearsWorked = this.calculateYearsWorked();

    // === 1. AVISO PRÉVIO ===
    let noticePay = 0;
    let noticeProporcional = 0;
    let noticeDaysBase = 0;
    let noticeDaysProportional = 0;
    let noticeDaysTotal = 0;
    
    // Rescisão indireta tem os mesmos direitos da demissão sem justa causa (Art. 483 CLT)
    const hasNoticeRights = terminationType === 'DISMISSAL_WITHOUT_CAUSE' || terminationType === 'INDIRECT_TERMINATION';
    
    if (hasNoticeRights) {
      // Se o usuário informar os dias, usamos exatamente esse total.
      // Senão: 30 + 3 dias/ano (máx 60 adicionais).
      const inputDays = this.data.severance?.noticePeriod && this.data.severance.noticePeriod > 0
        ? this.data.severance.noticePeriod
        : undefined;
      // Padrão solicitado: se não informar, considerar 30 dias
      const totalDays = inputDays ?? 30;
      const baseDays = Math.min(totalDays, 30);
      const additionalDays = Math.max(totalDays - 30, 0);
      noticeDaysBase = baseDays;
      noticeDaysProportional = additionalDays;
      noticeDaysTotal = baseDays + additionalDays;

      // ATUALIZAÇÃO: incluir média mensal das verbas variáveis habituais na base do aviso
      const variableMonthlyAvg = this.overtimeContext?.variableMonthlyAvg || 0;
      const baseForNotice = baseSalary + variableMonthlyAvg;

      // Consolidar tudo em uma única variável noticePay (todos os dias juntos)
      const totalNoticeValue = (baseForNotice / 30) * totalDays;
      noticePay = totalNoticeValue;
      noticeProporcional = 0; // Não mais usado separadamente, apenas para memória histórica

      this.calculationMemory.push(`1. AVISO PRÉVIO (Lei 12.506/2011):`);
      this.calculationMemory.push(`   Tipo: ${terminationType === 'INDIRECT_TERMINATION' ? 'Rescisão Indireta (Art. 483 CLT)' : 'Demissão sem Justa Causa'}`);
      this.calculationMemory.push(`   Dias considerados: ${totalDays} (base ${baseDays}${additionalDays > 0 ? ` + proporcional ${additionalDays}` : ''})`);
      this.calculationMemory.push(`   Base mensal: Salário (R$ ${baseSalary.toFixed(2)}) + Média variáveis (R$ ${variableMonthlyAvg.toFixed(2)}) = R$ ${baseForNotice.toFixed(2)}`);
      this.calculationMemory.push(`   Total aviso (${totalDays} dias): R$ ${noticePay.toFixed(2)}`);
      this.calculationMemory.push('');

      if (terminationType === 'INDIRECT_TERMINATION') {
        this.legalBasis.push('Art. 483 CLT - Rescisão Indireta do Contrato de Trabalho');
      }
      this.legalBasis.push('Lei 12.506/2011 - Aviso prévio proporcional');
    }

    // === 2. SALDO DE SALÁRIO ===
    const dailySalary = baseSalary / 30;
    const lastSalary = dailySalary * (severance.lastSalaryDays || 0);
    
    this.calculationMemory.push(`2. SALDO DE SALÁRIO:`);
    this.calculationMemory.push(`   Salário diário: R$ ${baseSalary.toFixed(2)} ÷ 30 = R$ ${dailySalary.toFixed(2)}`);
    this.calculationMemory.push(`   Dias trabalhados: ${severance.lastSalaryDays || 0}`);
    this.calculationMemory.push(`   Total: R$ ${lastSalary.toFixed(2)}`);
    this.calculationMemory.push('');

    // === 3. FÉRIAS PROPORCIONAIS ===
    const monthlyVacationValue = baseSalary / 12;
    const vacationPay = monthlyVacationValue * (severance.vacationDays || 0);
    const vacationBonus = vacationPay * LABOR_CONSTANTS.PERCENTAGES.VACATION_BONUS;
    
    this.calculationMemory.push(`3. FÉRIAS PROPORCIONAIS (Art. 146 CLT):`);
    this.calculationMemory.push(`   Base mensal: R$ ${baseSalary.toFixed(2)} ÷ 12 = R$ ${monthlyVacationValue.toFixed(2)}`);
    this.calculationMemory.push(`   Meses: ${severance.vacationDays || 0}/12 avos`);
    this.calculationMemory.push(`   Férias: R$ ${vacationPay.toFixed(2)}`);
    this.calculationMemory.push(`   1/3 Constitucional: R$ ${vacationBonus.toFixed(2)}`);
    this.calculationMemory.push(`   Total férias: R$ ${(vacationPay + vacationBonus).toFixed(2)}`);
    this.calculationMemory.push('');

    // === 4. FÉRIAS VENCIDAS ===
    const accruedPeriods = severance.vacationDaysDouble || 0;
    const vacationPayDouble = baseSalary * accruedPeriods * 2; // Em dobro (Art. 137 CLT)
    const vacationBonusDouble = vacationPayDouble * (1/3);
    
    if (vacationPayDouble > 0) {
      this.calculationMemory.push(`4. FÉRIAS VENCIDAS EM DOBRO (Art. 137 CLT):`);
      this.calculationMemory.push(`   Períodos não gozados: ${accruedPeriods}`);
      this.calculationMemory.push(`   Valor por período: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Férias em dobro: ${accruedPeriods} × R$ ${baseSalary.toFixed(2)} × 2 = R$ ${vacationPayDouble.toFixed(2)}`);
      this.calculationMemory.push(`   1/3 sobre dobro: R$ ${vacationBonusDouble.toFixed(2)}`);
      this.calculationMemory.push(`   Total férias vencidas: R$ ${(vacationPayDouble + vacationBonusDouble).toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 5. 13º SALÁRIO PROPORCIONAL ===
    const monthly13thValue = baseSalary / 12;
    const thirteenthSalary = monthly13thValue * (severance.thirteenthSalaryMonths || 0);
    
    this.calculationMemory.push(`4. 13º SALÁRIO PROPORCIONAL (Lei 4.090/62):`);
    this.calculationMemory.push(`   Base mensal: R$ ${baseSalary.toFixed(2)} ÷ 12 = R$ ${monthly13thValue.toFixed(2)}`);
    this.calculationMemory.push(`   Meses: ${severance.thirteenthSalaryMonths || 0}/12 avos`);
    this.calculationMemory.push(`   Total 13º: R$ ${thirteenthSalary.toFixed(2)}`);
    this.calculationMemory.push('');

    // === 6. FGTS + MULTA 40% ===
    // Calcular FGTS que DEVERIA ter acumulado (8% × salário × meses)
    const monthsWorkedTotal = this.calculateMonthsWorked();
    let fgtsExpected = baseSalary * 0.08 * monthsWorkedTotal;
    // ATUALIZAÇÃO: acrescentar FGTS 8% sobre verbas variáveis e DSR
    const variablesForFgtsTotal = this.overtimeContext?.totalVariableForFgts || 0;
    const fgtsOnVariables = variablesForFgtsTotal * 0.08;
    fgtsExpected += fgtsOnVariables;
    const fgtsInformed = severance.fgtsBalance || 0;
    
    // Rescisão indireta também tem direito à multa 40% (Art. 483 CLT)
    const hasFgtsPenalty = terminationType === 'DISMISSAL_WITHOUT_CAUSE' || terminationType === 'INDIRECT_TERMINATION';
    
    let fgtsWithdrawal = 0;
    let fgtsPenalty = 0;
    
    this.calculationMemory.push(`5. FGTS (Lei 8.036/90 - 8% ao mês):`);
    
    if (fgtsInformed === 0) {
      // CENÁRIO 1: Campo zerado → calcular quanto DEVERIA ter
      fgtsWithdrawal = fgtsExpected;
      fgtsPenalty = hasFgtsPenalty ? fgtsExpected * 0.40 : 0;
      
      this.calculationMemory.push(`   ⚠️ Saldo não informado - calculando valor devido:`);
      this.calculationMemory.push(`   Salário base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Depósito mensal (8%): R$ ${(baseSalary * 0.08).toFixed(2)}`);
      this.calculationMemory.push(`   Meses trabalhados: ${monthsWorkedTotal}`);
      this.calculationMemory.push(`   FGTS devido (salário + variáveis): R$ ${fgtsExpected.toFixed(2)} (inclui 8% sobre variáveis)`);
    } else {
      // CENÁRIO 2: Campo preenchido → calcular diferença
      const fgtsDifference = fgtsExpected - fgtsInformed;
      
      this.calculationMemory.push(`   Saldo informado pelo empregador: R$ ${fgtsInformed.toFixed(2)}`);
      this.calculationMemory.push(`   Cálculo do saldo correto:`);
      this.calculationMemory.push(`   - Salário base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   - Depósito mensal (8%): R$ ${(baseSalary * 0.08).toFixed(2)}`);
      this.calculationMemory.push(`   - Meses trabalhados: ${monthsWorkedTotal}`);
      this.calculationMemory.push(`   - FGTS esperado (c/ variáveis): R$ ${fgtsExpected.toFixed(2)}`);
      
      if (fgtsDifference > 0) {
        fgtsWithdrawal = fgtsDifference;
        fgtsPenalty = hasFgtsPenalty ? fgtsDifference * 0.40 : 0;
        
        this.calculationMemory.push(`   ⚠️ DIFERENÇA A RECEBER: R$ ${fgtsDifference.toFixed(2)}`);
        this.calculationMemory.push(`   (Empregador depositou a menos)`);
      } else if (fgtsDifference < 0) {
        this.calculationMemory.push(`   ✅ Saldo informado está ACIMA do esperado`);
        this.calculationMemory.push(`   (Diferença: R$ ${Math.abs(fgtsDifference).toFixed(2)} a mais)`);
        fgtsWithdrawal = fgtsInformed;
        fgtsPenalty = hasFgtsPenalty ? fgtsInformed * 0.40 : 0;
      } else {
        this.calculationMemory.push(`   ✅ Saldo correto - valores conferem`);
        fgtsWithdrawal = fgtsInformed;
        fgtsPenalty = hasFgtsPenalty ? fgtsInformed * 0.40 : 0;
      }
    }
    
    if (fgtsPenalty > 0) {
      this.calculationMemory.push(`   Multa 40%: R$ ${fgtsWithdrawal.toFixed(2)} × 40% = R$ ${fgtsPenalty.toFixed(2)}`);
      if (terminationType === 'INDIRECT_TERMINATION') {
        this.calculationMemory.push(`   (Rescisão Indireta - Art. 483 CLT)`);
      }
    }
    this.calculationMemory.push(`   Total FGTS + Multa: R$ ${(fgtsWithdrawal + fgtsPenalty).toFixed(2)}`);
    this.calculationMemory.push('');

    // === 7. INDENIZAÇÃO ADICIONAL (Lei 7.238/84) ===
    const additionalCompensation = severance.dismissalNearCategoryBaseDate ? baseSalary : 0;
    
    if (additionalCompensation > 0) {
      this.calculationMemory.push(`6. INDENIZAÇÃO ADICIONAL (Lei 7.238/84):`);
      this.calculationMemory.push(`   Demissão nos 30 dias antes da data-base da categoria`);
      this.calculationMemory.push(`   Indenização: 1 salário mensal = R$ ${additionalCompensation.toFixed(2)}`);
      this.calculationMemory.push('');
      this.legalBasis.push('Lei 7.238/84 Art. 9º - Indenização adicional');
    }

    // === 8. MULTAS ===
    const art477Fine = (severance.delayedPayment && (severance.delayDays || 0) > 10) ? baseSalary : 0;
    
    // ART. 467 CLT - 50% sobre verbas incontroversas não pagas
    // Base (automática): saldo de salário; aviso (trabalhado/indenizado - já consolidado); férias proporcionais + 1/3; férias vencidas (em dobro + 1/3);
    // 13º proporcional; multa FGTS 40%.
    const automaticUndisputedBase =
      lastSalary +
      noticePay + // Já inclui base + proporcional
      vacationPay + vacationBonus +
      (vacationPayDouble + vacationBonusDouble) +
      thirteenthSalary +
      fgtsPenalty;
    
    // Só aplica a multa se undisputedAmountUnpaid estiver definido (não undefined)
    let art467Fine = 0;
    if (severance.undisputedAmountUnpaid !== undefined) {
      const undisputedSource = (severance.undisputedAmountUnpaid > 0)
        ? severance.undisputedAmountUnpaid
        : automaticUndisputedBase;
      art467Fine = undisputedSource * 0.50;
    }
    
    if (art477Fine > 0) {
      this.calculationMemory.push(`7. MULTA ART. 477 CLT (atraso ${severance.delayDays} dias):`);
      this.calculationMemory.push(`   Multa: 1 salário = R$ ${art477Fine.toFixed(2)}`);
      this.calculationMemory.push('');
    }
    
    if (art467Fine > 0) {
      this.calculationMemory.push(`8. MULTA ART. 467 CLT (verbas incontroversas):`);
      if (severance.undisputedAmountUnpaid && severance.undisputedAmountUnpaid > 0) {
        this.calculationMemory.push(`   Base informada: R$ ${severance.undisputedAmountUnpaid.toFixed(2)}`);
      } else {
        this.calculationMemory.push(`   Base automática: `);
        this.calculationMemory.push(`     • Saldo de salário: R$ ${lastSalary.toFixed(2)}`);
        this.calculationMemory.push(`     • Aviso prévio (${noticeDaysTotal} dias): R$ ${noticePay.toFixed(2)}`);
        this.calculationMemory.push(`     • Férias proporcionais + 1/3: R$ ${(vacationPay + vacationBonus).toFixed(2)}`);
        this.calculationMemory.push(`     • Férias vencidas (em dobro) + 1/3: R$ ${(vacationPayDouble + vacationBonusDouble).toFixed(2)}`);
        this.calculationMemory.push(`     • 13º proporcional: R$ ${thirteenthSalary.toFixed(2)}`);
        this.calculationMemory.push(`     • Multa FGTS 40%: R$ ${fgtsPenalty.toFixed(2)}`);
        this.calculationMemory.push(`   Base total: R$ ${automaticUndisputedBase.toFixed(2)}`);
      }
      this.calculationMemory.push(`   Multa 50%: R$ ${art467Fine.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    const total = noticePay + lastSalary + vacationPay + vacationBonus + 
                  vacationPayDouble + vacationBonusDouble + thirteenthSalary + fgtsWithdrawal + fgtsPenalty + 
                  additionalCompensation + art477Fine + art467Fine;
    
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push(`TOTAL VERBAS RESCISÓRIAS: R$ ${total.toFixed(2)}`);
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push('');

    return {
      noticePay,
      noticeProporcional,
      noticeDaysBase,
      noticeDaysProportional,
      noticeDaysTotal,
      lastSalary,
      vacationPay,
      vacationPayDouble: vacationPayDouble + vacationBonusDouble,
      vacationBonus,
      thirteenthSalary,
      fgtsWithdrawal,
      fgtsPenalty,
      art477Fine,
      art467Fine,
      additionalCompensation,
      total,
    };
  }

  private calculateYearsWorked(): number {
    if (!this.data.admissionDate || !this.data.terminationDate) return 0;
    
    const admission = new Date(this.data.admissionDate);
    const termination = new Date(this.data.terminationDate);
    
    const diffTime = termination.getTime() - admission.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const years = diffDays / 365.25;
    
    return years;
  }

  private calculateOvertime() {
    const { baseSalary, additionals, intervals, admissionDate, terminationDate } = this.data;
    
    this.addLegalBasis(LEGAL_BASIS.OVERTIME);
    this.addLegalBasis(LEGAL_BASIS.INTERVALS);
    this.calculationMemory.push('=== CÁLCULO DE HORAS EXTRAS E INTERVALOS ===');
    this.calculationMemory.push('');

    const hourlyRate = baseSalary / 220; // 220 horas mensais (44h/semana)
    const monthsWorked = this.calculateMonthsWorked();

    // === 1. HORAS EXTRAS DIAS ÚTEIS (50%) ===
    const weekdayOvertimeHours = (additionals.overtime?.weekdayHours || 0);
    const weekdayOvertimeRate = hourlyRate * 1.50; // 50% adicional
    const weekdayOvertimeMonthly = weekdayOvertimeHours * weekdayOvertimeRate;
    const weekdayOvertime = weekdayOvertimeMonthly * monthsWorked;
    
    if (weekdayOvertime > 0) {
      this.calculationMemory.push(`1. HORAS EXTRAS 50% (Art. 7º XVI CF):`);
      this.calculationMemory.push(`   Salário hora: R$ ${baseSalary.toFixed(2)} ÷ 220h = R$ ${hourlyRate.toFixed(2)}`);
      this.calculationMemory.push(`   Hora extra 50%: R$ ${hourlyRate.toFixed(2)} × 1,50 = R$ ${weekdayOvertimeRate.toFixed(2)}`);
      this.calculationMemory.push(`   HE mensais: ${weekdayOvertimeHours}h × R$ ${weekdayOvertimeRate.toFixed(2)} = R$ ${weekdayOvertimeMonthly.toFixed(2)}`);
      this.calculationMemory.push(`   Período: ${monthsWorked} meses`);
      this.calculationMemory.push(`   Total: R$ ${weekdayOvertime.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 2. HORAS EXTRAS FINS DE SEMANA/FERIADOS (100%) ===
    const weekendOvertimeHours = (additionals.overtime?.weekendHours || 0);
    const weekendOvertimeRate = hourlyRate * 2.00; // 100% adicional
    const weekendOvertimeMonthly = weekendOvertimeHours * weekendOvertimeRate;
    const weekendOvertime = weekendOvertimeMonthly * monthsWorked;
    
    if (weekendOvertime > 0) {
      this.calculationMemory.push(`2. HORAS EXTRAS 100% (Domingos/Feriados):`);
      this.calculationMemory.push(`   Hora extra 100%: R$ ${hourlyRate.toFixed(2)} × 2,00 = R$ ${weekendOvertimeRate.toFixed(2)}`);
      this.calculationMemory.push(`   HE mensais: ${weekendOvertimeHours}h × R$ ${weekendOvertimeRate.toFixed(2)} = R$ ${weekendOvertimeMonthly.toFixed(2)}`);
      this.calculationMemory.push(`   Período: ${monthsWorked} meses`);
      this.calculationMemory.push(`   Total: R$ ${weekendOvertime.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 3. DSR SOBRE HORAS EXTRAS (Súmula 172 TST) ===
    const totalHoursExtras = weekdayOvertime + weekendOvertime;
    const workingDaysPerMonth = 25;
    const restDaysPerMonth = 5;
    const dsrOverHoursExtras = totalHoursExtras > 0 ? 
      (totalHoursExtras / workingDaysPerMonth) * restDaysPerMonth : 0;
    
    if (dsrOverHoursExtras > 0) {
      this.calculationMemory.push(`3. DSR SOBRE HORAS EXTRAS (Súmula 172 TST):`);
      this.calculationMemory.push(`   HE total: R$ ${totalHoursExtras.toFixed(2)}`);
      this.calculationMemory.push(`   Dias trabalhados/mês: ${workingDaysPerMonth}`);
      this.calculationMemory.push(`   Domingos/Feriados/mês: ${restDaysPerMonth}`);
      this.calculationMemory.push(`   DSR: (R$ ${totalHoursExtras.toFixed(2)} ÷ ${workingDaysPerMonth}) × ${restDaysPerMonth} = R$ ${dsrOverHoursExtras.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 4. INTERVALO INTRAJORNADA (Art. 71 CLT) ===
    const lunchMinutes = intervals.lunchBreakViolations || 0;
    const lunchPeriod = intervals.lunchBreakPeriod || 'week';
    const lunchWeeklyMinutes = this.convertToWeeklyMinutes(lunchMinutes, lunchPeriod);
    const lunchMonthlyHours = (lunchWeeklyMinutes * 4.33) / 60; // 4.33 semanas/mês
    const lunchBreakPenalty = lunchMonthlyHours * weekdayOvertimeRate * monthsWorked;
    
    if (lunchBreakPenalty > 0) {
      this.calculationMemory.push(`4. INTERVALO INTRAJORNADA (Art. 71 CLT):`);
      this.calculationMemory.push(`   Minutos suprimidos: ${lunchMinutes} por ${this.getPeriodName(lunchPeriod)}`);
      this.calculationMemory.push(`   Minutos semanais: ${lunchWeeklyMinutes}`);
      this.calculationMemory.push(`   Horas mensais: ${lunchMonthlyHours.toFixed(2)}h`);
      this.calculationMemory.push(`   Valor hora (50%): R$ ${weekdayOvertimeRate.toFixed(2)}`);
      this.calculationMemory.push(`   Total: ${lunchMonthlyHours.toFixed(2)}h × R$ ${weekdayOvertimeRate.toFixed(2)} × ${monthsWorked} meses = R$ ${lunchBreakPenalty.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 5. INTERVALO INTERJORNADA (Art. 66 CLT) ===
    const betweenMinutes = intervals.betweenShiftsViolations || 0;
    const betweenPeriod = intervals.betweenShiftsPeriod || 'week';
    const betweenWeeklyMinutes = this.convertToWeeklyMinutes(betweenMinutes, betweenPeriod);
    const betweenMonthlyHours = (betweenWeeklyMinutes * 4.33) / 60;
    const betweenShiftsPenalty = betweenMonthlyHours * weekdayOvertimeRate * monthsWorked;
    
    if (betweenShiftsPenalty > 0) {
      this.calculationMemory.push(`5. INTERVALO INTERJORNADA (Art. 66 CLT):`);
      this.calculationMemory.push(`   Minutos suprimidos: ${betweenMinutes} por ${this.getPeriodName(betweenPeriod)}`);
      this.calculationMemory.push(`   Minutos semanais: ${betweenWeeklyMinutes}`);
      this.calculationMemory.push(`   Horas mensais: ${betweenMonthlyHours.toFixed(2)}h`);
      this.calculationMemory.push(`   Valor hora (50%): R$ ${weekdayOvertimeRate.toFixed(2)}`);
      this.calculationMemory.push(`   Total: ${betweenMonthlyHours.toFixed(2)}h × R$ ${weekdayOvertimeRate.toFixed(2)} × ${monthsWorked} meses = R$ ${betweenShiftsPenalty.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 6. ADICIONAL NOTURNO (Art. 73 CLT) ===
    const nightShiftHours = additionals.nightShift?.hours || 0;
    const nightShiftRate = hourlyRate * 0.20; // 20% adicional
    const nightShiftDifferential = nightShiftHours * (hourlyRate + nightShiftRate);
    
    if (nightShiftDifferential > 0) {
      this.calculationMemory.push(`6. ADICIONAL NOTURNO (Art. 73 CLT - 20%):`);
      this.calculationMemory.push(`   Hora normal: R$ ${hourlyRate.toFixed(2)}`);
      this.calculationMemory.push(`   Adicional 20%: R$ ${nightShiftRate.toFixed(2)}`);
      this.calculationMemory.push(`   Hora noturna: R$ ${(hourlyRate + nightShiftRate).toFixed(2)}`);
      this.calculationMemory.push(`   Horas no período: ${nightShiftHours}h`);
      this.calculationMemory.push(`   Total: R$ ${nightShiftDifferential.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 7. SOBREAVISO (1/3 do salário) ===
    const onCallHours = this.data.workingHours?.onCallHours || 0;
    const onCallRate = hourlyRate / 3;
    const onCallPay = onCallHours * onCallRate;
    
    if (onCallPay > 0) {
      this.calculationMemory.push(`7. SOBREAVISO (Súmula 428 TST - 1/3):`);
      this.calculationMemory.push(`   Horas: ${onCallHours}h`);
      this.calculationMemory.push(`   Valor hora (1/3): R$ ${onCallRate.toFixed(2)}`);
      this.calculationMemory.push(`   Total: R$ ${onCallPay.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 8. PRONTIDÃO (2/3 do salário) ===
    const standbyHours = this.data.workingHours?.standbyHours || 0;
    const standbyRate = (hourlyRate * 2) / 3;
    const standbyPay = standbyHours * standbyRate;
    
    if (standbyPay > 0) {
      this.calculationMemory.push(`8. PRONTIDÃO (2/3 do salário):`);
      this.calculationMemory.push(`   Horas: ${standbyHours}h`);
      this.calculationMemory.push(`   Valor hora (2/3): R$ ${standbyRate.toFixed(2)}`);
      this.calculationMemory.push(`   Total: R$ ${standbyPay.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 9. HORAS IN ITINERE (Súmula 90 TST - pré-reforma) ===
    const inItinereHours = this.data.workingHours?.inItinereHours || 0;
    const inItinerePay = inItinereHours * hourlyRate;

    // === 8. ART. 384 (MULHER) - 15 MIN PRÉ-HE ATÉ 11/11/2017 ===
    const art384Days = this.data.workingHours?.art384DaysPerMonth || 0;
    const art384MinutesPerDay = 15; // 0.25h
    const art384Hours = (art384Days * art384MinutesPerDay) / 60;
    const art384Rate = hourlyRate * 1.5; // 50% adicional
    const art384Pay = art384Hours * art384Rate;
    if (art384Pay > 0) {
      this.calculationMemory.push(`4. INTERVALO ART. 384 (mulher) - 15min por dia com HE:`);
      this.calculationMemory.push(`   Dias com HE: ${art384Days} → Horas: ${art384Hours.toFixed(2)}h x 50%`);
      this.calculationMemory.push(`   Total: R$ ${art384Pay.toFixed(2)}`);
      this.legalBasis.push('CLT (art. 384) - 15 minutos antes da sobrejornada (vigente até 11/11/2017)');
    }
    
    if (inItinerePay > 0) {
      this.calculationMemory.push(`9. HORAS IN ITINERE (Súmula 90 TST):`);
      this.calculationMemory.push(`   Horas: ${inItinereHours}h`);
      this.calculationMemory.push(`   Valor hora: R$ ${hourlyRate.toFixed(2)}`);
      this.calculationMemory.push(`   Total: R$ ${inItinerePay.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // Base para reflexos salariais das horas extras (exclui penalidades indenizatórias)
    // ATUALIZAÇÃO: incluir intervalos (art. 71 e 66) na base de reflexos e FGTS
    const overtimeReflectionBase = weekdayOvertime + weekendOvertime + nightShiftDifferential + onCallPay + standbyPay + inItinerePay + lunchBreakPenalty + betweenShiftsPenalty;
    const vacationReflection = overtimeReflectionBase * (1 / 12); // férias proporcionais (1/12)
    const vacationBonusReflection = vacationReflection / 3; // 1/3 constitucional
    const thirteenthReflection = overtimeReflectionBase * (1 / 12); // 13º (1/12)
    const fgtsReflection = (overtimeReflectionBase + dsrOverHoursExtras) * 0.08; // FGTS 8%

    // Reflexos por item: ratear DSR entre HE 50% e HE 100% proporcionalmente
    const baseOverHE = Math.max(weekdayOvertime + weekendOvertime, 0.0001);
    const dsrWeekday = dsrOverHoursExtras * (weekdayOvertime / baseOverHE);
    const dsrWeekend = dsrOverHoursExtras * (weekendOvertime / baseOverHE);

    const weekdayVacation = (weekdayOvertime) * (1 / 12);
    const weekdayVacationBonus = weekdayVacation / 3;
    const weekdayThirteenth = (weekdayOvertime) * (1 / 12);
    const weekdayFgts = (weekdayOvertime + dsrWeekday) * 0.08;

    const weekendVacation = (weekendOvertime) * (1 / 12);
    const weekendVacationBonus = weekendVacation / 3;
    const weekendThirteenth = (weekendOvertime) * (1 / 12);
    const weekendFgts = (weekendOvertime + dsrWeekend) * 0.08;

    // Reflexos por intervalo (calcular separadamente)
    const lunchVacation = lunchBreakPenalty * (1 / 12);
    const lunchVacationBonus = lunchVacation / 3;
    const lunchThirteenth = lunchBreakPenalty * (1 / 12);
    const lunchFgts = lunchBreakPenalty * 0.08;

    const betweenVacation = betweenShiftsPenalty * (1 / 12);
    const betweenVacationBonus = betweenVacation / 3;
    const betweenThirteenth = betweenShiftsPenalty * (1 / 12);
    const betweenFgts = betweenShiftsPenalty * 0.08;

    // Reflexos de sobreaviso (separadamente)
    const onCallVacation = onCallPay * (1 / 12);
    const onCallVacationBonus = onCallVacation / 3;
    const onCallThirteenth = onCallPay * (1 / 12);
    const onCallFgts = onCallPay * 0.08;

    // Reflexos de prontidão (separadamente)
    const standbyVacation = standbyPay * (1 / 12);
    const standbyVacationBonus = standbyVacation / 3;
    const standbyThirteenth = standbyPay * (1 / 12);
    const standbyFgts = standbyPay * 0.08;

    // Reflexos do Adicional Noturno (separadamente)
    const nightShiftVacation = nightShiftDifferential * (1 / 12);
    const nightShiftVacationBonus = nightShiftVacation / 3;
    const nightShiftThirteenth = nightShiftDifferential * (1 / 12);
    const nightShiftFgts = nightShiftDifferential * 0.08;

    // Reflexos de Horas In Itinere (separadamente)
    const inItinereVacation = inItinerePay * (1 / 12);
    const inItinereVacationBonus = inItinereVacation / 3;
    const inItinereThirteenth = inItinerePay * (1 / 12);
    const inItinereFgts = inItinerePay * 0.08;

    const total = weekdayOvertime + weekendOvertime + dsrOverHoursExtras + lunchBreakPenalty + 
                  betweenShiftsPenalty + nightShiftDifferential + onCallPay + standbyPay + inItinerePay + art384Pay;

    // Memória: Reflexos das horas extras
    this.calculationMemory.push('10. REFLEXOS DAS HORAS EXTRAS:');
    this.calculationMemory.push(`   Base de reflexos (HE/Adic/Intervalos): R$ ${(overtimeReflectionBase).toFixed(2)}`);
    this.calculationMemory.push(`   → Férias (1/12): R$ ${vacationReflection.toFixed(2)}`);
    this.calculationMemory.push(`   → 1/3 Férias: R$ ${vacationBonusReflection.toFixed(2)}`);
    this.calculationMemory.push(`   → 13º (1/12): R$ ${thirteenthReflection.toFixed(2)}`);
    this.calculationMemory.push(`   → FGTS 8% (inclui DSR): R$ ${fgtsReflection.toFixed(2)}`);
    if (onCallPay > 0) {
      this.calculationMemory.push(`   REFLEXOS DO SOBREAVISO (R$ ${onCallPay.toFixed(2)}):`);
      this.calculationMemory.push(`      → Férias: R$ ${onCallVacation.toFixed(2)}`);
      this.calculationMemory.push(`      → 1/3 Férias: R$ ${onCallVacationBonus.toFixed(2)}`);
      this.calculationMemory.push(`      → 13º: R$ ${onCallThirteenth.toFixed(2)}`);
      this.calculationMemory.push(`      → FGTS 8%: R$ ${onCallFgts.toFixed(2)}`);
    }
    if (standbyPay > 0) {
      this.calculationMemory.push(`   REFLEXOS DA PRONTIDÃO (R$ ${standbyPay.toFixed(2)}):`);
      this.calculationMemory.push(`      → Férias: R$ ${standbyVacation.toFixed(2)}`);
      this.calculationMemory.push(`      → 1/3 Férias: R$ ${standbyVacationBonus.toFixed(2)}`);
      this.calculationMemory.push(`      → 13º: R$ ${standbyThirteenth.toFixed(2)}`);
      this.calculationMemory.push(`      → FGTS 8%: R$ ${standbyFgts.toFixed(2)}`);
    }
    if (nightShiftDifferential > 0) {
      this.calculationMemory.push(`   REFLEXOS DO ADICIONAL NOTURNO (R$ ${nightShiftDifferential.toFixed(2)}):`);
      this.calculationMemory.push(`      → Férias: R$ ${nightShiftVacation.toFixed(2)}`);
      this.calculationMemory.push(`      → 1/3 Férias: R$ ${nightShiftVacationBonus.toFixed(2)}`);
      this.calculationMemory.push(`      → 13º: R$ ${nightShiftThirteenth.toFixed(2)}`);
      this.calculationMemory.push(`      → FGTS 8%: R$ ${nightShiftFgts.toFixed(2)}`);
    }
    if (inItinerePay > 0) {
      this.calculationMemory.push(`   REFLEXOS DAS HORAS IN ITINERE (R$ ${inItinerePay.toFixed(2)}):`);
      this.calculationMemory.push(`      → Férias: R$ ${inItinereVacation.toFixed(2)}`);
      this.calculationMemory.push(`      → 1/3 Férias: R$ ${inItinereVacationBonus.toFixed(2)}`);
      this.calculationMemory.push(`      → 13º: R$ ${inItinereThirteenth.toFixed(2)}`);
      this.calculationMemory.push(`      → FGTS 8%: R$ ${inItinereFgts.toFixed(2)}`);
    }
    this.calculationMemory.push('');

    // Guardar contexto para FGTS e Aviso Prévio
    this.overtimeContext = {
      monthsWorked,
      totalVariableForFgts: overtimeReflectionBase + dsrOverHoursExtras, // remuneração variável base para FGTS
      variableMonthlyAvg: monthsWorked > 0 ? (overtimeReflectionBase + dsrOverHoursExtras) / monthsWorked : 0,
    };
    
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push(`TOTAL HORAS EXTRAS E INTERVALOS: R$ ${total.toFixed(2)}`);
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push('');

    return {
      weekdayOvertime,
      weekendOvertime,
      lunchBreakPenalty,
      betweenShiftsPenalty,
      nightShiftDifferential,
      onCallPay,
      standbyPay,
      inItinerePay,
      art384Pay,
      dsrOverHoursExtras,
      reflectionsDetailed: {
        vacationReflection,
        vacationBonusReflection,
        thirteenthReflection,
        fgtsReflection,
      },
      reflectionsByItem: {
        weekday: {
          vacation: weekdayVacation,
          vacationBonus: weekdayVacationBonus,
          thirteenth: weekdayThirteenth,
          fgts: weekdayFgts,
        },
        weekend: {
          vacation: weekendVacation,
          vacationBonus: weekendVacationBonus,
          thirteenth: weekendThirteenth,
          fgts: weekendFgts,
        },
        lunchBreak: {
          vacation: lunchVacation,
          vacationBonus: lunchVacationBonus,
          thirteenth: lunchThirteenth,
          fgts: lunchFgts,
        },
        betweenShifts: {
          vacation: betweenVacation,
          vacationBonus: betweenVacationBonus,
          thirteenth: betweenThirteenth,
          fgts: betweenFgts,
        },
        onCall: {
          vacation: onCallVacation,
          vacationBonus: onCallVacationBonus,
          thirteenth: onCallThirteenth,
          fgts: onCallFgts,
        },
        standby: {
          vacation: standbyVacation,
          vacationBonus: standbyVacationBonus,
          thirteenth: standbyThirteenth,
          fgts: standbyFgts,
        },
        nightShift: {
          vacation: nightShiftVacation,
          vacationBonus: nightShiftVacationBonus,
          thirteenth: nightShiftThirteenth,
          fgts: nightShiftFgts,
        },
        inItinere: {
          vacation: inItinereVacation,
          vacationBonus: inItinereVacationBonus,
          thirteenth: inItinereThirteenth,
          fgts: inItinereFgts,
        },
      },
      total,
    };
  }

  private calculateMonthsWorked(): number {
    if (!this.data.admissionDate || !this.data.terminationDate) return 1;
    
    const admission = new Date(this.data.admissionDate);
    const termination = new Date(this.data.terminationDate);
    
    // Verificar se admissão e demissão são no mesmo mês
    const sameMonth = admission.getFullYear() === termination.getFullYear() && 
                      admission.getMonth() === termination.getMonth();
    
    if (sameMonth) {
      // Se no mesmo mês, calcular dias trabalhados diretamente
      const daysWorked = termination.getDate() - admission.getDate() + 1;
      return daysWorked >= 15 ? 1 : 1; // Mínimo sempre 1 para FGTS/horas extras
    }
    
    // Calcular diferença em meses
    let monthsDiff = (termination.getFullYear() - admission.getFullYear()) * 12 + 
                     (termination.getMonth() - admission.getMonth());
    
    // Regra trabalhista: 15 dias ou mais no mês = conta como mês completo
    // Verificar o mês de admissão (se trabalhou menos de 15 dias, não conta)
    const daysInAdmissionMonth = new Date(admission.getFullYear(), admission.getMonth() + 1, 0).getDate();
    const daysWorkedInFirstMonth = daysInAdmissionMonth - admission.getDate() + 1;
    if (daysWorkedInFirstMonth < 15) {
      monthsDiff -= 1;
    }
    
    // Verificar o mês de demissão (se trabalhou 15 dias ou mais, conta como mês completo)
    const daysWorkedInLastMonth = termination.getDate();
    if (daysWorkedInLastMonth >= 15) {
      monthsDiff += 1;
    }
    
    return Math.max(monthsDiff, 1);
  }

  private convertToWeeklyMinutes(minutes: number, period: 'day' | 'week' | 'month'): number {
    switch (period) {
      case 'day':
        return minutes * 6; // 6 dias/semana trabalhados
      case 'week':
        return minutes;
      case 'month':
        return minutes / 4.33; // ~4.33 semanas/mês
      default:
        return minutes;
    }
  }

  private getPeriodName(period: 'day' | 'week' | 'month'): string {
    switch (period) {
      case 'day': return 'dia';
      case 'week': return 'semana';
      case 'month': return 'mês';
      default: return 'semana';
    }
  }

  private calculateAdditionals() {
    const { baseSalary, additionals } = this.data;
    const monthsWorked = this.calculateMonthsWorked();
    
    this.addLegalBasis(LEGAL_BASIS.ADDITIONALS);
    this.calculationMemory.push('=== CÁLCULO DE ADICIONAIS ===');
    this.calculationMemory.push('');

    // === 1. INSALUBRIDADE (Art. 192 CLT) ===
    let insalubrityAmount = 0;
    let insalubrityMonthly = 0;
    
    if (additionals.insalubrity) {
      const basis = additionals.insalubrity.basis === 'MINIMUM_WAGE' ? 
        LABOR_CONSTANTS.MINIMUM_WAGE : baseSalary;
      insalubrityMonthly = basis * (additionals.insalubrity.percentage / 100);
      insalubrityAmount = insalubrityMonthly * monthsWorked;
      
      this.calculationMemory.push(`1. INSALUBRIDADE ${additionals.insalubrity.percentage}% (Art. 192 CLT):`);
      this.calculationMemory.push(`   Base: R$ ${basis.toFixed(2)} (${additionals.insalubrity.basis === 'MINIMUM_WAGE' ? 'Salário Mínimo' : 'Salário Base'})`);
      this.calculationMemory.push(`   Adicional mensal: R$ ${insalubrityMonthly.toFixed(2)}`);
      this.calculationMemory.push(`   Período: ${monthsWorked} meses`);
      this.calculationMemory.push(`   Total: R$ ${insalubrityAmount.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 2. PERICULOSIDADE (Art. 193 CLT) ===
    let dangerousnessAmount = 0;
    let dangerousnessMonthly = 0;
    
    if (additionals.dangerousness) {
      dangerousnessMonthly = baseSalary * 0.30;
      dangerousnessAmount = dangerousnessMonthly * monthsWorked;
      
      this.calculationMemory.push(`2. PERICULOSIDADE 30% (Art. 193 CLT):`);
      this.calculationMemory.push(`   Base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Adicional mensal: R$ ${dangerousnessMonthly.toFixed(2)}`);
      this.calculationMemory.push(`   Período: ${monthsWorked} meses`);
      this.calculationMemory.push(`   Total: R$ ${dangerousnessAmount.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 3. ADICIONAL DE TRANSFERÊNCIA (Art. 469 §3º CLT) ===
    const transferBonusAmount = additionals.transferBonus ? 
      (baseSalary * 0.25 * (additionals.transferBonus.months || 0)) : 0;
    
    if (transferBonusAmount > 0) {
      this.calculationMemory.push(`3. ADICIONAL DE TRANSFERÊNCIA 25% (Art. 469 §3º CLT):`);
      this.calculationMemory.push(`   Base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Adicional mensal: R$ ${(baseSalary * 0.25).toFixed(2)}`);
      this.calculationMemory.push(`   Meses: ${additionals.transferBonus?.months || 0}`);
      this.calculationMemory.push(`   Total: R$ ${transferBonusAmount.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 4. QUEBRA DE CAIXA (Súmula 247 TST) ===
    const breakageFeeAmount = additionals.breakageFee ? 
      (baseSalary * 0.10 * monthsWorked) : 0;
    
    if (breakageFeeAmount > 0) {
      this.calculationMemory.push(`4. QUEBRA DE CAIXA 10% (Súmula 247 TST):`);
      this.calculationMemory.push(`   Base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Adicional mensal: R$ ${(baseSalary * 0.10).toFixed(2)}`);
      this.calculationMemory.push(`   Período: ${monthsWorked} meses`);
      this.calculationMemory.push(`   Total: R$ ${breakageFeeAmount.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 5. ANUÊNIO / TEMPO DE SERVIÇO ===
    const timeServiceBonusAmount = additionals.timeServiceBonus ? 
      (baseSalary * (additionals.timeServiceBonus.percentagePerYear / 100) * additionals.timeServiceBonus.years) : 0;

    if (timeServiceBonusAmount > 0) {
      this.calculationMemory.push(`5. ANUÊNIO / TEMPO DE SERVIÇO:`);
      this.calculationMemory.push(`   Base: R$ ${baseSalary.toFixed(2)}`);
      this.calculationMemory.push(`   Percentual: ${additionals.timeServiceBonus?.percentagePerYear}% ao ano`);
      this.calculationMemory.push(`   Anos: ${additionals.timeServiceBonus?.years}`);
      this.calculationMemory.push(`   Total: R$ ${timeServiceBonusAmount.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    // === 6. REFLEXOS DETALHADOS ===
    // Reflexos por adicional
    const reflectionsByItem: any = {};
    let reflections = 0;
    let reflectionsDetailed = undefined;

    const computeReflections = (monthlyValue: number, label: string) => {
      if (monthlyValue <= 0) return { dsr: 0, vacation: 0, vacationBonus: 0, thirteenth: 0 };
      const dsr = (monthlyValue * monthsWorked / 25) * 5;
      const vacation = (monthlyValue / 12) * (this.data.severance?.vacationDays || 0);
      const vacationBonus = vacation / 3;
      const thirteenth = (monthlyValue / 12) * (this.data.severance?.thirteenthSalaryMonths || 0);
      this.calculationMemory.push(`   → Reflexos de ${label}: DSR=${dsr.toFixed(2)} | Férias=${vacation.toFixed(2)} | 1/3=${vacationBonus.toFixed(2)} | 13º=${thirteenth.toFixed(2)}`);
      return { dsr, vacation, vacationBonus, thirteenth };
    };

    this.calculationMemory.push(`6. REFLEXOS DOS ADICIONAIS (Súmula 347 TST):`);
    if (insalubrityMonthly > 0) {
      const r = computeReflections(insalubrityMonthly, 'Insalubridade');
      reflectionsByItem.insalubrity = r;
      reflections += r.dsr + r.vacation + r.vacationBonus + r.thirteenth;
    }
    if (dangerousnessMonthly > 0) {
      const r = computeReflections(dangerousnessMonthly, 'Periculosidade');
      reflectionsByItem.dangerousness = r;
      reflections += r.dsr + r.vacation + r.vacationBonus + r.thirteenth;
    }
    // Transferência: usar mensal (25% do salário) por meses informados
    if (additionals.transferBonus?.months && additionals.transferBonus.months > 0) {
      const transferMonthly = baseSalary * 0.25;
      const r = computeReflections(transferMonthly, 'Adicional de Transferência');
      reflectionsByItem.transferBonus = r;
      reflections += r.dsr + r.vacation + r.vacationBonus + r.thirteenth;
    }
    if (additionals.breakageFee) {
      const r = computeReflections(baseSalary * 0.10, 'Quebra de Caixa');
      reflectionsByItem.breakageFee = r;
      reflections += r.dsr + r.vacation + r.vacationBonus + r.thirteenth;
    }
    if (additionals.timeServiceBonus) {
      const r = computeReflections(baseSalary * (additionals.timeServiceBonus.percentagePerYear / 100), 'Tempo de Serviço');
      reflectionsByItem.timeServiceBonus = r;
      reflections += r.dsr + r.vacation + r.vacationBonus + r.thirteenth;
    }
    
    if (reflections > 0) {
      const totalMonthly = insalubrityMonthly + dangerousnessMonthly + (additionals.transferBonus?.months ? baseSalary * 0.25 : 0) + (additionals.breakageFee ? baseSalary * 0.10 : 0) + (additionals.timeServiceBonus ? baseSalary * (additionals.timeServiceBonus.percentagePerYear / 100) : 0);
      const dsrReflection = (totalMonthly * monthsWorked / 25) * 5;
      const vacationReflection = (totalMonthly / 12) * (this.data.severance?.vacationDays || 0);
      const vacationBonusReflection = vacationReflection / 3;
      const thirteenthReflection = (totalMonthly / 12) * (this.data.severance?.thirteenthSalaryMonths || 0);
      reflectionsDetailed = { dsrReflection, vacationReflection, vacationBonusReflection, thirteenthReflection };
      this.calculationMemory.push(`   Total reflexos: R$ ${reflections.toFixed(2)}`);
      this.calculationMemory.push('');
    }

    const total = insalubrityAmount + dangerousnessAmount + transferBonusAmount + 
                  breakageFeeAmount + timeServiceBonusAmount + reflections;
    
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push(`TOTAL ADICIONAIS: R$ ${total.toFixed(2)}`);
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push('');

    return {
      insalubrityAmount,
      dangerousnessAmount,
      transferBonusAmount,
      breakageFeeAmount,
      timeServiceBonusAmount,
      reflections,
      reflectionsDetailed,
      reflectionsByItem,
      total,
    };
  }

  private calculateFunctionDeviation() {
    const { functionDeviation } = this.data;
    
    if (!functionDeviation?.hasDeviation) {
      return undefined;
    }

    this.addLegalBasis(LEGAL_BASIS.FUNCTION_DEVIATION);
    this.calculationMemory.push('=== CÁLCULO DE DESVIO DE FUNÇÃO ===');
    this.calculationMemory.push('');

    const monthlyDifference = functionDeviation.differenceAmount;
    const totalMonths = functionDeviation.deviationPeriodMonths;
    const salaryDifference = monthlyDifference * totalMonths;
    
    this.calculationMemory.push(`DESVIO DE FUNÇÃO (Art. 468 CLT):`);
    this.calculationMemory.push(`   Cargo contratado: ${functionDeviation.originalPosition}`);
    this.calculationMemory.push(`   Cargo exercido: ${functionDeviation.deviatedPosition}`);
    this.calculationMemory.push(`   Diferença salarial mensal: R$ ${monthlyDifference.toFixed(2)}`);
    this.calculationMemory.push(`   Período: ${totalMonths} meses`);
    this.calculationMemory.push(`   Total diferença: R$ ${salaryDifference.toFixed(2)}`);
    this.calculationMemory.push('');
    
    // Reflexos detalhados em férias, 13º, DSR, FGTS
    const vacationReflection = (monthlyDifference / 12) * (this.data.severance?.vacationDays || 0);
    const vacationBonusReflection = vacationReflection * (1/3);
    const thirteenthReflection = (monthlyDifference / 12) * (this.data.severance?.thirteenthSalaryMonths || 0);
    const dsrReflection = (salaryDifference / 25) * 5;
    const fgtsReflection = salaryDifference * 0.08;
    
    const reflections = vacationReflection + vacationBonusReflection + thirteenthReflection + dsrReflection + fgtsReflection;
    
    const reflectionsDetailed = {
      vacationReflection,
      vacationBonusReflection,
      thirteenthReflection,
      dsrReflection,
      fgtsReflection
    };
    
    this.calculationMemory.push(`REFLEXOS DO DESVIO:`);
    this.calculationMemory.push(`   Reflexo Férias: R$ ${vacationReflection.toFixed(2)}`);
    this.calculationMemory.push(`   Reflexo 1/3 Férias: R$ ${vacationBonusReflection.toFixed(2)}`);
    this.calculationMemory.push(`   Reflexo 13º: R$ ${thirteenthReflection.toFixed(2)}`);
    this.calculationMemory.push(`   Reflexo DSR: R$ ${dsrReflection.toFixed(2)}`);
    this.calculationMemory.push(`   Reflexo FGTS 8%: R$ ${fgtsReflection.toFixed(2)}`);
    this.calculationMemory.push(`   Total reflexos: R$ ${reflections.toFixed(2)}`);
    this.calculationMemory.push('');

    const total = salaryDifference + reflections;
    
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push(`TOTAL DESVIO DE FUNÇÃO: R$ ${total.toFixed(2)}`);
    this.calculationMemory.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.calculationMemory.push('');

    return {
      salaryDifference,
      reflections,
      reflectionsDetailed,
      total,
    };
  }

  private addLegalBasis(basis: string[]) {
    basis.forEach(item => {
      if (!this.legalBasis.includes(item)) {
        this.legalBasis.push(item);
      }
    });
  }

  private generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public validatePrescription(): string[] {
    const warnings: string[] = [];
    const admissionDate = new Date(this.data.admissionDate);
    const terminationDate = this.data.terminationDate ? new Date(this.data.terminationDate) : new Date();
    const today = new Date();

    // Verificar prazo prescricional pós-término
    const monthsSinceTermination = (today.getTime() - terminationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceTermination > 24) {
      warnings.push('⚠️ ATENÇÃO: Prazo prescricional de 2 anos após o término do contrato já expirou!');
    } else if (monthsSinceTermination > 18) {
      warnings.push('⚠️ URGENTE: Restam menos de 6 meses para prescrição das verbas trabalhistas!');
    }

    // Verificar prazo geral de 5 anos
    const contractYears = (terminationDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (contractYears > 5) {
      warnings.push('⚠️ ATENÇÃO: Verbas anteriores aos últimos 5 anos do contrato podem estar prescritas!');
    }

    return warnings;
  }
}

// Função auxiliar para formatação de valores
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função auxiliar para formatação de data
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};