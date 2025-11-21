/**
 * Serviço de Exportação da Calculadora Trabalhista
 * 
 * Gera documentos profissionais (PDF e Excel) com:
 * - Memória de cálculo detalhada
 * - Base legal completa
 * - Tabelas de correção monetária
 * - Formato aceito pelos tribunais
 */

import { CalculationResult } from '@/types/calculator';
import { formatCurrency, formatDate } from '@/lib/calculator/laborCalculations';
import logoAsset from '@/assets/images/veredicta-logo.png';

export class CalculatorExportService {
  /**
   * Exporta cálculo para formato texto (visualização rápida)
   */
  static exportToText(result: CalculationResult): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push('MEMÓRIA DE CÁLCULO TRABALHISTA');
    lines.push('='.repeat(80));
    lines.push('');
    
    lines.push(`Reclamante: ${result.employeeName}`);
    lines.push(`Data do Cálculo: ${formatDate(result.calculationDate)}`);
    lines.push('');
    
    // Memória de cálculo
    lines.push(...result.calculationMemory);
    lines.push('');
    
    // Base legal
    if (result.legalBasis.length > 0) {
      lines.push('='.repeat(80));
      lines.push('BASE LEGAL');
      lines.push('='.repeat(80));
      result.legalBasis.forEach((basis, idx) => {
        lines.push(`${idx + 1}. ${basis}`);
      });
      lines.push('');
    }
    
    // Avisos de prescrição
    if (result.prescriptionWarnings.length > 0) {
      lines.push('='.repeat(80));
      lines.push('AVISOS DE PRESCRIÇÃO');
      lines.push('='.repeat(80));
      result.prescriptionWarnings.forEach(warning => {
        lines.push(warning);
      });
      lines.push('');
    }
    
    // Resumo executivo
    if (result.summary) {
      lines.push('='.repeat(80));
      lines.push('RESUMO EXECUTIVO');
      lines.push('='.repeat(80));
      lines.push(`Verbas Rescisórias: ${formatCurrency(result.summary.totalVerbasRescissorias)}`);
      lines.push(`Horas Extras: ${formatCurrency(result.summary.totalHorasExtras)}`);
      lines.push(`Adicionais: ${formatCurrency(result.summary.totalAdicionais)}`);
      if (result.summary.totalEstabilidades > 0) {
        lines.push(`Estabilidades: ${formatCurrency(result.summary.totalEstabilidades)}`);
      }
      if (result.summary.totalIndenizacoes > 0) {
        lines.push(`Indenizações: ${formatCurrency(result.summary.totalIndenizacoes)}`);
      }
      if (result.summary.totalCorrecao > 0) {
        lines.push(`Correção Monetária: ${formatCurrency(result.summary.totalCorrecao)}`);
      }
      if (result.summary.totalJuros > 0) {
        lines.push(`Juros de Mora: ${formatCurrency(result.summary.totalJuros)}`);
      }
      if (result.summary.totalHonorarios > 0) {
        lines.push(`Honorários: ${formatCurrency(result.summary.totalHonorarios)}`);
      }
      lines.push('');
    }
    
    lines.push('='.repeat(80));
    lines.push(`TOTAL GERAL: ${formatCurrency(result.grandTotal)}`);
    lines.push('='.repeat(80));
    lines.push('');
    lines.push('Cálculo elaborado através do Sistema Veredicta');
    lines.push(`www.veredictajus.com.br | ID do Cálculo: ${result.id}`);
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Exporta cálculo para formato CSV (para Excel)
   */
  static exportToCSV(result: CalculationResult): string {
    const rows: string[][] = [];
    
    // Cabeçalho
    rows.push(['MEMÓRIA DE CÁLCULO TRABALHISTA']);
    rows.push(['Reclamante:', result.employeeName]);
    rows.push(['Data:', formatDate(result.calculationDate)]);
    rows.push(['ID:', result.id]);
    rows.push([]);
    
    // Verbas rescisórias
    rows.push(['VERBAS RESCISÓRIAS', 'Valor']);
    rows.push([`Aviso Prévio (${result.severanceResults.noticeDaysTotal || 30} dias)`, formatCurrency(result.severanceResults.noticePay)]);
    rows.push(['Saldo de Salário', formatCurrency(result.severanceResults.lastSalary)]);
    rows.push(['Férias', formatCurrency(result.severanceResults.vacationPay)]);
    if (result.severanceResults.vacationPayDouble > 0) {
      rows.push(['Férias em Dobro', formatCurrency(result.severanceResults.vacationPayDouble)]);
    }
    rows.push(['1/3 Constitucional', formatCurrency(result.severanceResults.vacationBonus)]);
    rows.push(['13º Salário', formatCurrency(result.severanceResults.thirteenthSalary)]);
    rows.push(['FGTS', formatCurrency(result.severanceResults.fgtsWithdrawal)]);
    rows.push(['Multa FGTS 40%', formatCurrency(result.severanceResults.fgtsPenalty)]);
    if (result.severanceResults.art477Fine > 0) {
      rows.push(['Multa Art. 477', formatCurrency(result.severanceResults.art477Fine)]);
    }
    if (result.severanceResults.art467Fine > 0) {
      rows.push(['Multa Art. 467', formatCurrency(result.severanceResults.art467Fine)]);
    }
    rows.push(['SUBTOTAL', formatCurrency(result.severanceResults.total)]);
    rows.push([]);
    
    // Horas extras
    rows.push(['HORAS EXTRAS E INTERVALOS', 'Valor']);
    if (result.overtimeResults.weekdayOvertime > 0) {
      rows.push(['Horas Extras 50%', formatCurrency(result.overtimeResults.weekdayOvertime)]);
    }
    if (result.overtimeResults.weekendOvertime > 0) {
      rows.push(['Horas Extras 100%', formatCurrency(result.overtimeResults.weekendOvertime)]);
    }
    if (result.overtimeResults.nightShiftDifferential > 0) {
      rows.push(['Adicional Noturno', formatCurrency(result.overtimeResults.nightShiftDifferential)]);
    }
    if (result.overtimeResults.lunchBreakPenalty > 0) {
      rows.push(['Intervalo Intrajornada', formatCurrency(result.overtimeResults.lunchBreakPenalty)]);
    }
    if (result.overtimeResults.betweenShiftsPenalty > 0) {
      rows.push(['Intervalo Interjornada', formatCurrency(result.overtimeResults.betweenShiftsPenalty)]);
    }
    if (result.overtimeResults.dsrOverHoursExtras > 0) {
      rows.push(['DSR sobre HE', formatCurrency(result.overtimeResults.dsrOverHoursExtras)]);
    }
    rows.push(['SUBTOTAL', formatCurrency(result.overtimeResults.total)]);
    rows.push([]);
    
    // Adicionais
    if (result.additionalsResults.total > 0) {
      rows.push(['ADICIONAIS', 'Valor']);
      if (result.additionalsResults.insalubrityAmount > 0) {
        rows.push(['Insalubridade', formatCurrency(result.additionalsResults.insalubrityAmount)]);
      }
      if (result.additionalsResults.dangerousnessAmount > 0) {
        rows.push(['Periculosidade', formatCurrency(result.additionalsResults.dangerousnessAmount)]);
      }
      if (result.additionalsResults.reflections > 0) {
        rows.push(['Reflexos', formatCurrency(result.additionalsResults.reflections)]);
      }
      rows.push(['SUBTOTAL', formatCurrency(result.additionalsResults.total)]);
      rows.push([]);
    }
    
    // Estabilidades
    if (result.stabilityResults && result.stabilityResults.total > 0) {
      rows.push(['ESTABILIDADES', 'Valor']);
      if (result.stabilityResults.pregnancyStability > 0) {
        rows.push(['Estabilidade Gestante', formatCurrency(result.stabilityResults.pregnancyStability)]);
      }
      if (result.stabilityResults.accidentStability > 0) {
        rows.push(['Estabilidade Acidentária', formatCurrency(result.stabilityResults.accidentStability)]);
      }
      rows.push(['SUBTOTAL', formatCurrency(result.stabilityResults.total)]);
      rows.push([]);
    }
    
    // Subtotal
    rows.push([]);
    rows.push(['SUBTOTAL ANTES DE CORREÇÃO', formatCurrency(result.subtotalBeforeCorrection)]);
    rows.push([]);
    
    // Correção monetária
    if (result.monetaryCorrectionResults) {
      rows.push(['CORREÇÃO MONETÁRIA', '']);
      rows.push(['Índice:', result.monetaryCorrectionResults.index]);
      rows.push(['Valor Corrigido:', formatCurrency(result.monetaryCorrectionResults.correctedAmount)]);
      rows.push(['Correção:', formatCurrency(result.monetaryCorrectionResults.correctionValue)]);
      rows.push(['Percentual:', `${result.monetaryCorrectionResults.percentageTotal.toFixed(2)}%`]);
      rows.push([]);
      
      // Tabela mensal
      rows.push(['TABELA DE CORREÇÃO MENSAL']);
      rows.push(['Mês', 'Índice (%)', 'Valor Acumulado']);
      result.monetaryCorrectionResults.monthlyDetails.forEach(detail => {
        rows.push([
          detail.month,
          detail.indexValue.toFixed(4),
          formatCurrency(detail.accumulated)
        ]);
      });
      rows.push([]);
    }
    
    // Juros
    if (result.interestResults) {
      rows.push(['JUROS DE MORA', '']);
      rows.push(['Taxa:', `${result.interestResults.monthlyRate}% ao mês`]);
      rows.push(['Período:', `${result.interestResults.months} meses`]);
      rows.push(['Tipo:', result.interestResults.type]);
      rows.push(['Juros:', formatCurrency(result.interestResults.interestAmount)]);
      rows.push([]);
    }
    
    // Total com correção e juros
    rows.push(['TOTAL COM CORREÇÃO E JUROS', formatCurrency(result.totalWithCorrectionAndInterest)]);
    rows.push([]);
    
    // Honorários
    if (result.honorariosResults) {
      rows.push(['HONORÁRIOS ADVOCATÍCIOS', '']);
      rows.push(['Percentual:', `${result.honorariosResults.percentage}%`]);
      rows.push(['Base Legal:', result.honorariosResults.baseLegal]);
      rows.push(['Valor:', formatCurrency(result.honorariosResults.amount)]);
      rows.push(['Status:', result.honorariosResults.status === 'PAID' ? 'Devido' : 'Suspenso (Justiça Gratuita)']);
      rows.push([]);
    }
    
    // Total final
    rows.push([]);
    rows.push(['TOTAL GERAL', formatCurrency(result.grandTotal)]);
    rows.push([]);
    
    // Base legal
    if (result.legalBasis.length > 0) {
      rows.push(['BASE LEGAL']);
      result.legalBasis.forEach((basis, idx) => {
        rows.push([`${idx + 1}.`, basis]);
      });
    }
    
    // Converter para CSV
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Gera HTML formatado (para visualização ou conversão em PDF)
   */
  static exportToHTML(result: CalculationResult, opts?: { logoUrl?: string; primary?: string; primaryDark?: string }): string {
    const logoUrl = opts?.logoUrl || (logoAsset as unknown as string);
    // Laranja (padrão Veredicta)
    const primary = opts?.primary || '#f97316'; // orange-500
    const primaryDark = opts?.primaryDark || '#c2410c'; // orange-700
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memória de Cálculo - ${result.employeeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.65;
      color: #1a202c;
      max-width: 210mm;
      margin: 20px auto;
      padding: 24px;
      background: #ffffff;
      font-size: 14px;
      letter-spacing: -0.01em;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 3px solid ${primary};
      padding-bottom: 16px; margin-bottom: 24px;
    }
    .brand {
      display: flex; align-items: center; gap: 14px;
    }
    .brand img { height: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08)); }
    .brand h1 { color: ${primaryDark}; font-size: 20px; margin: 0; font-weight: 600; letter-spacing: -0.02em; }
    h1 {
      color: ${primaryDark};
      font-size: 26px;
      margin-bottom: 16px;
      border-bottom: 2px solid ${primary};
      padding-bottom: 12px;
      font-weight: 600;
      letter-spacing: -0.03em;
    }
    h2 {
      color: #2d3748;
      font-size: 19px;
      margin-top: 32px;
      margin-bottom: 18px;
      border-left: 3px solid ${primary};
      padding-left: 14px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    h3 {
      color: #4a5568;
      font-size: 15px;
      margin-top: 12px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .info {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 18px 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .info p {
      margin: 6px 0;
      font-size: 13.5px;
    }
    .info strong {
      color: #2d3748;
      width: 150px;
      display: inline-block;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 18px 0;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
      background: white;
    }
    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13.5px;
    }
    th {
      background: linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%);
      color: white;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 16px;
      border-bottom: 2px solid rgba(255,255,255,0.2);
    }
    th:first-child {
      border-top-left-radius: 10px;
    }
    th:last-child {
      border-top-right-radius: 10px;
    }
    td:last-child, th:last-child {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }
    tbody tr {
      transition: background-color 0.15s ease;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody tr:nth-child(odd) {
      background: #ffffff;
    }
    tbody tr:not(.total-row):not(.grand-total):hover {
      background: #fff7ed;
    }
    tbody td {
      color: #2d3748;
    }
    .total-row {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
      font-weight: 600;
      border-top: 2px solid ${primary};
      border-bottom: none;
      color: #1a202c;
      font-size: 14px;
    }
    .total-row td {
      padding-top: 16px;
      padding-bottom: 16px;
    }
    .grand-total {
      background: linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%) !important;
      color: white !important;
      font-size: 17px;
      font-weight: 700;
      border-bottom: none;
      border-top: 3px solid rgba(255,255,255,0.2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .grand-total td {
      padding-top: 18px;
      padding-bottom: 18px;
      color: white !important;
    }
    .legal-basis {
      background: linear-gradient(135deg, #fffaf0 0%, #fef3e2 100%);
      padding: 20px 22px;
      border-left: 4px solid ${primary};
      margin: 24px 0;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      border: 1px solid #fde68a;
    }
    .legal-basis h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: ${primaryDark};
    }
    .legal-basis ol {
      margin-left: 24px;
    }
    .legal-basis li {
      margin: 10px 0;
      line-height: 1.7;
      color: #4a5568;
    }
    .warning {
      background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%);
      border-left: 4px solid #ef4444;
      padding: 18px 20px;
      margin: 18px 0;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      letter-spacing: 0.02em;
    }
    @media print {
      body { margin: 0; padding: 15mm; }
      .no-print { display: none; }
      table { break-inside: avoid; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${logoUrl}" alt="Veredicta" onerror="this.onerror=null;this.src='/logo.png';" />
      <h1>MEMÓRIA DE CÁLCULO TRABALHISTA</h1>
    </div>
    <div style="text-align:right; color:#64748b; font-size:12px;">
      <div>Gerado em ${formatDate(result.calculationDate)}</div>
      <div>ID: ${result.id}</div>
    </div>
  </div>
  
  <div class="info">
    <p><strong>Reclamante:</strong> ${result.employeeName}</p>
    <p><strong>Data do Cálculo:</strong> ${formatDate(result.calculationDate)}</p>
    <p><strong>ID do Cálculo:</strong> ${result.id}</p>
  </div>

  <h2>1. VERBAS RESCISÓRIAS</h2>
  <table>
    <thead>
      <tr><th>Verba</th><th>Valor</th></tr>
    </thead>
    <tbody>
      <tr><td>Aviso Prévio (${result.severanceResults.noticeDaysTotal || 30} dias)</td><td>${formatCurrency(result.severanceResults.noticePay)}</td></tr>
      <tr><td>Saldo de Salário</td><td>${formatCurrency(result.severanceResults.lastSalary)}</td></tr>
      <tr><td>Férias</td><td>${formatCurrency(result.severanceResults.vacationPay)}</td></tr>
      <tr><td>1/3 Constitucional</td><td>${formatCurrency(result.severanceResults.vacationBonus)}</td></tr>
      ${result.severanceResults.vacationPayDouble > 0 ? `<tr><td>Férias Vencidas em Dobro + 1/3</td><td>${formatCurrency(result.severanceResults.vacationPayDouble)}</td></tr>` : ''}
      <tr><td>13º Salário</td><td>${formatCurrency(result.severanceResults.thirteenthSalary)}</td></tr>
      <tr><td>FGTS 8% (depósitos)</td><td>${formatCurrency(result.severanceResults.fgtsWithdrawal)}</td></tr>
      <tr><td>Multa FGTS 40%</td><td>${formatCurrency(result.severanceResults.fgtsPenalty)}</td></tr>
      ${result.severanceResults.additionalCompensation > 0 ? `<tr><td>Indenização Adicional (Lei 7.238/84)</td><td>${formatCurrency(result.severanceResults.additionalCompensation)}</td></tr>` : ''}
      ${result.severanceResults.art467Fine > 0 ? `<tr><td><strong>Multa Art. 467 CLT</strong> (50% sobre verbas incontroversas não pagas)</td><td><strong>${formatCurrency(result.severanceResults.art467Fine)}</strong></td></tr>` : ''}
      ${result.severanceResults.art477Fine > 0 ? `<tr><td>Multa Art. 477 CLT (atraso no pagamento)</td><td>${formatCurrency(result.severanceResults.art477Fine)}</td></tr>` : ''}
      <tr class="total-row"><td><strong>SUBTOTAL</strong></td><td><strong>${formatCurrency(result.severanceResults.total)}</strong></td></tr>
    </tbody>
  </table>

  ${result.overtimeResults.total > 0 ? `
  <h2>2. HORAS EXTRAS E INTERVALOS</h2>
  <table>
    <thead>
      <tr><th>Verba</th><th>Valor</th></tr>
    </thead>
    <tbody>
      ${result.overtimeResults.weekdayOvertime > 0 ? `<tr><td>Horas Extras 50%</td><td>${formatCurrency(result.overtimeResults.weekdayOvertime)}</td></tr>` : ''}
      ${result.overtimeResults.weekendOvertime > 0 ? `<tr><td>Horas Extras 100%</td><td>${formatCurrency(result.overtimeResults.weekendOvertime)}</td></tr>` : ''}
      ${result.overtimeResults.nightShiftDifferential > 0 ? `<tr><td>Adicional Noturno</td><td>${formatCurrency(result.overtimeResults.nightShiftDifferential)}</td></tr>` : ''}
      ${result.overtimeResults.dsrOverHoursExtras > 0 ? `<tr><td>DSR sobre HE</td><td>${formatCurrency(result.overtimeResults.dsrOverHoursExtras)}</td></tr>` : ''}
      ${result.overtimeResults.lunchBreakPenalty > 0 ? `<tr><td>Intervalo Intrajornada (Art. 71)</td><td>${formatCurrency(result.overtimeResults.lunchBreakPenalty)}</td></tr>` : ''}
      ${result.overtimeResults.betweenShiftsPenalty > 0 ? `<tr><td>Intervalo Interjornada (Art. 66)</td><td>${formatCurrency(result.overtimeResults.betweenShiftsPenalty)}</td></tr>` : ''}
      ${result.overtimeResults.onCallPay > 0 ? `<tr><td>Sobreaviso</td><td>${formatCurrency(result.overtimeResults.onCallPay)}</td></tr>` : ''}
      ${result.overtimeResults.standbyPay > 0 ? `<tr><td>Prontidão</td><td>${formatCurrency(result.overtimeResults.standbyPay)}</td></tr>` : ''}
      ${result.overtimeResults.inItinerePay > 0 ? `<tr><td>Horas In Itinere</td><td>${formatCurrency(result.overtimeResults.inItinerePay)}</td></tr>` : ''}
      ${(result as any).overtimeResults?.art384Pay > 0 ? `<tr><td>Intervalo Art. 384 (Mulher)</td><td>${formatCurrency((result as any).overtimeResults.art384Pay)}</td></tr>` : ''}
      <tr class="total-row"><td><strong>SUBTOTAL</strong></td><td><strong>${formatCurrency(result.overtimeResults.total)}</strong></td></tr>
    </tbody>
  </table>

  <!-- Reflexos por item HE -->
  ${(result.overtimeResults.reflectionsByItem) ? `
  <h3 style="margin-top:8px; color:${primaryDark}">Reflexos das Horas Extras</h3>
  <table>
    <thead>
      <tr><th>Item</th><th>Férias</th><th>1/3 Férias</th><th>13º</th><th>FGTS 8%</th></tr>
    </thead>
    <tbody>
      ${result.overtimeResults.reflectionsByItem?.weekday ? `<tr><td>HE 50%</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekday.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekday.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekday.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekday.fgts)}</td></tr>` : ''}
      ${result.overtimeResults.reflectionsByItem?.weekend ? `<tr><td>HE 100%</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekend.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekend.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekend.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.weekend.fgts)}</td></tr>` : ''}
      ${result.overtimeResults.reflectionsByItem?.lunchBreak ? `<tr><td>Intervalo Intrajornada</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.fgts)}</td></tr>` : ''}
      ${result.overtimeResults.reflectionsByItem?.betweenShifts ? `<tr><td>Intervalo Interjornada</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.fgts)}</td></tr>` : ''}
      ${result.overtimeResults.reflectionsByItem?.onCall && result.overtimeResults.onCallPay > 0 ? `<tr><td>Sobreaviso</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.onCall.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.onCall.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.onCall.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.onCall.fgts)}</td></tr>` : ''}
      ${result.overtimeResults.reflectionsByItem?.standby && result.overtimeResults.standbyPay > 0 ? `<tr><td>Prontidão</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.standby.vacation)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.standby.vacationBonus)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.standby.thirteenth)}</td><td>${formatCurrency(result.overtimeResults.reflectionsByItem.standby.fgts)}</td></tr>` : ''}
    </tbody>
  </table>
  ` : ''}
  ` : ''}

  ${result.additionalsResults.total > 0 ? `
  <h2>3. ADICIONAIS</h2>
  <table>
    <thead>
      <tr><th>Parcela</th><th>Valor</th></tr>
    </thead>
    <tbody>
      ${result.additionalsResults.insalubrityAmount > 0 ? `<tr><td>Insalubridade</td><td>${formatCurrency(result.additionalsResults.insalubrityAmount)}</td></tr>` : ''}
      ${result.additionalsResults.dangerousnessAmount > 0 ? `<tr><td>Periculosidade</td><td>${formatCurrency(result.additionalsResults.dangerousnessAmount)}</td></tr>` : ''}
      ${result.additionalsResults.transferBonusAmount > 0 ? `<tr><td>Adicional de Transferência</td><td>${formatCurrency(result.additionalsResults.transferBonusAmount)}</td></tr>` : ''}
      ${result.additionalsResults.breakageFeeAmount > 0 ? `<tr><td>Quebra de Caixa</td><td>${formatCurrency(result.additionalsResults.breakageFeeAmount)}</td></tr>` : ''}
      ${result.additionalsResults.timeServiceBonusAmount > 0 ? `<tr><td>Anuênio / Tempo de Serviço</td><td>${formatCurrency(result.additionalsResults.timeServiceBonusAmount)}</td></tr>` : ''}
      <tr class="total-row"><td><strong>SUBTOTAL</strong></td><td><strong>${formatCurrency(result.additionalsResults.total)}</strong></td></tr>
    </tbody>
  </table>

  ${(result.additionalsResults.reflectionsByItem) ? `
  <h3 style="margin-top:8px; color:${primaryDark}">Reflexos dos Adicionais</h3>
  <table>
    <thead>
      <tr><th>Adicional</th><th>DSR</th><th>Férias</th><th>1/3 Férias</th><th>13º</th></tr>
    </thead>
    <tbody>
      ${result.additionalsResults.reflectionsByItem?.insalubrity ? `<tr><td>Insalubridade</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.dsr)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.vacation)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.vacationBonus)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.thirteenth)}</td></tr>` : ''}
      ${result.additionalsResults.reflectionsByItem?.dangerousness ? `<tr><td>Periculosidade</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.dsr)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.vacation)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.vacationBonus)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.thirteenth)}</td></tr>` : ''}
      ${result.additionalsResults.reflectionsByItem?.transferBonus ? `<tr><td>Adic. Transferência</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.dsr)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.vacation)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.vacationBonus)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.thirteenth)}</td></tr>` : ''}
      ${result.additionalsResults.reflectionsByItem?.breakageFee ? `<tr><td>Quebra de Caixa</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.dsr)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.vacation)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.vacationBonus)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.thirteenth)}</td></tr>` : ''}
      ${result.additionalsResults.reflectionsByItem?.timeServiceBonus ? `<tr><td>Anuênio</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.dsr)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.vacation)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.vacationBonus)}</td><td>${formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.thirteenth)}</td></tr>` : ''}
    </tbody>
  </table>
  ` : ''}
  ` : ''}

  ${result.functionDeviationResults && result.functionDeviationResults.total > 0 ? `
  <h2>4. DESVIO DE FUNÇÃO</h2>
  <table>
    <thead><tr><th>Parcela</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Diferença Salarial</td><td>${formatCurrency(result.functionDeviationResults.salaryDifference)}</td></tr>
      ${result.functionDeviationResults.reflections > 0 ? `
      <tr><td colspan="2" style="padding-top: 12px; padding-bottom: 8px; background: #f0f9ff; border-top: 1px solid #bae6fd;"><strong style="font-size: 12px; color: #0284c7;">REFLEXOS DO DESVIO:</strong></td></tr>
      ${result.functionDeviationResults.reflectionsDetailed?.vacationReflection > 0 ? `<tr style="background: #f0f9ff;"><td style="padding-left: 24px;">→ Reflexo Férias</td><td>${formatCurrency(result.functionDeviationResults.reflectionsDetailed.vacationReflection)}</td></tr>` : ''}
      ${result.functionDeviationResults.reflectionsDetailed?.vacationBonusReflection > 0 ? `<tr style="background: #f0f9ff;"><td style="padding-left: 24px;">→ Reflexo 1/3 Férias</td><td>${formatCurrency(result.functionDeviationResults.reflectionsDetailed.vacationBonusReflection)}</td></tr>` : ''}
      ${result.functionDeviationResults.reflectionsDetailed?.thirteenthReflection > 0 ? `<tr style="background: #f0f9ff;"><td style="padding-left: 24px;">→ Reflexo 13º</td><td>${formatCurrency(result.functionDeviationResults.reflectionsDetailed.thirteenthReflection)}</td></tr>` : ''}
      ${result.functionDeviationResults.reflectionsDetailed?.dsrReflection > 0 ? `<tr style="background: #f0f9ff;"><td style="padding-left: 24px;">→ Reflexo DSR</td><td>${formatCurrency(result.functionDeviationResults.reflectionsDetailed.dsrReflection)}</td></tr>` : ''}
      ${result.functionDeviationResults.reflectionsDetailed?.fgtsReflection > 0 ? `<tr style="background: #f0f9ff;"><td style="padding-left: 24px;">→ Reflexo FGTS 8%</td><td>${formatCurrency(result.functionDeviationResults.reflectionsDetailed.fgtsReflection)}</td></tr>` : ''}
      <tr style="background: #dbeafe; border-top: 1px solid #93c5fd;"><td style="padding-left: 24px; font-weight: 600; color: #0284c7;">Total Reflexos</td><td style="font-weight: 600; color: #0284c7;">${formatCurrency(result.functionDeviationResults.reflections)}</td></tr>
      ` : ''}
      <tr class="total-row"><td><strong>SUBTOTAL</strong></td><td><strong>${formatCurrency(result.functionDeviationResults.total)}</strong></td></tr>
    </tbody>
  </table>
  ` : ''}

  ${result.discountsResults ? `
  <h2>5. DESCONTOS LEGAIS</h2>
  <table>
    <thead><tr><th>Desconto</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>INSS</td><td>${formatCurrency(result.discountsResults.inss)}</td></tr>
      <tr><td>IRRF</td><td>${formatCurrency(result.discountsResults.irrf)}</td></tr>
      <tr class="total-row"><td><strong>TOTAL DESCONTOS</strong></td><td><strong>${formatCurrency(result.discountsResults.total)}</strong></td></tr>
    </tbody>
  </table>
  ` : ''}

  ${result.monetaryCorrectionResults ? `
  <h2>6. CORREÇÃO MONETÁRIA</h2>
  <table>
    <thead><tr><th>Item</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Índice</td><td>${result.monetaryCorrectionResults.index}</td></tr>
      <tr><td>Valor Original (antes da correção)</td><td>${formatCurrency(result.subtotalBeforeCorrection)}</td></tr>
      <tr><td>Valor Corrigido</td><td>${formatCurrency(result.monetaryCorrectionResults.correctedAmount)}</td></tr>
      <tr><td>Correção Aplicada</td><td>${formatCurrency(result.monetaryCorrectionResults.correctionValue)}</td></tr>
      <tr><td>Percentual Total</td><td>${result.monetaryCorrectionResults.percentageTotal.toFixed(2)}%</td></tr>
      <tr class="total-row"><td><strong>VALOR APÓS CORREÇÃO</strong></td><td><strong>${formatCurrency(result.monetaryCorrectionResults.correctedAmount)}</strong></td></tr>
    </tbody>
  </table>
  ` : ''}

  ${result.interestResults ? `
  <h2>${result.monetaryCorrectionResults ? '7. JUROS DE MORA' : '6. JUROS DE MORA'}</h2>
  <table>
    <thead><tr><th>Item</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Taxa Mensal</td><td>${result.interestResults.monthlyRate}% ao mês</td></tr>
      <tr><td>Período</td><td>${result.interestResults.months} meses</td></tr>
      <tr><td>Tipo</td><td>${result.interestResults.type === 'SIMPLE' ? 'Simples' : 'Composto'}</td></tr>
      <tr><td>Juros Calculados</td><td>${formatCurrency(result.interestResults.interestAmount)}</td></tr>
      <tr class="total-row"><td><strong>TOTAL COM CORREÇÃO E JUROS</strong></td><td><strong>${formatCurrency(result.totalWithCorrectionAndInterest)}</strong></td></tr>
    </tbody>
  </table>
  ` : ''}

  ${result.honorariosResults ? `
  <h2>${result.monetaryCorrectionResults || result.interestResults ? '8. HONORÁRIOS ADVOCATÍCIOS' : '6. HONORÁRIOS ADVOCATÍCIOS'}</h2>
  <table>
    <thead><tr><th>Item</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Base (Total com Correção e Juros)</td><td>${formatCurrency(result.totalWithCorrectionAndInterest)}</td></tr>
      <tr><td>Percentual</td><td>${result.honorariosResults.percentage}%</td></tr>
      <tr class="total-row"><td><strong>Honorários</strong></td><td><strong>${formatCurrency(result.honorariosResults.amount)}</strong></td></tr>
    </tbody>
  </table>
  ` : ''}

  <h2>TOTAL GERAL</h2>
  <table>
    <thead>
      <tr><th>Item</th><th>Valor</th></tr>
    </thead>
    <tbody>
      ${result.honorariosResults ? `
      <tr>
        <td><strong>Honorários Advocatícios (${result.honorariosResults.percentage}%)</strong></td>
        <td><strong>${formatCurrency(result.honorariosResults.amount)}</strong></td>
      </tr>
      ` : ''}
      <tr class="grand-total"><td><strong>TOTAL</strong></td><td><strong>${formatCurrency(result.grandTotal)}</strong></td></tr>
      ${result.netTotal !== undefined ? `<tr class="total-row"><td><strong>TOTAL LÍQUIDO (após descontos)</strong></td><td><strong>${formatCurrency(result.netTotal)}</strong></td></tr>` : ''}
    </tbody>
  </table>

  ${result.legalBasis.length > 0 ? `
  <div class="legal-basis">
    <h3 style="margin-bottom: 15px;">BASE LEGAL</h3>
    <ol>
      ${result.legalBasis.map(basis => `<li>${basis}</li>`).join('')}
    </ol>
  </div>
  ` : ''}

  ${result.calculationMemory?.some(l => l.includes('FERIADOS NACIONAIS')) ? `
  <h2>FERIADOS NO PERÍODO</h2>
  <div class="info" style="font-size:12px;">
    ${result.calculationMemory.filter(l => l.startsWith('- ')).map(l => `<div>${l.replace('-', '•')}</div>`).join('')}
  </div>
  ` : ''}

  ${result.calculationMemory && result.calculationMemory.length > 0 ? `
  <h2>MEMÓRIA DE CÁLCULO</h2>
  <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.8; color: #1a202c; white-space: pre-wrap; overflow-x: auto;">
${result.calculationMemory.join('\n')}
  </div>
  ` : ''}

  <div class="footer">
    <p>Cálculo elaborado através do Sistema Veredicta</p>
    <p>www.veredictajus.com.br</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Download do cálculo como arquivo
   */
  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exporta como TXT
   */
  static exportText(result: CalculationResult) {
    const content = this.exportToText(result);
    const filename = `calculo_${result.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    this.downloadFile(content, filename, 'text/plain;charset=utf-8');
  }

  /**
   * Exporta como CSV (para Excel)
   */
  static exportCSV(result: CalculationResult) {
    const content = this.exportToCSV(result);
    const filename = `calculo_${result.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(content, filename, 'text/csv;charset=utf-8');
  }

  /**
   * Exporta como HTML (pode ser impresso como PDF)
   */
  static async exportHTML(result: CalculationResult, opts?: { logoUrl?: string; primary?: string; primaryDark?: string }) {
    // Embute o logo como Data URL (para funcionar ao abrir o arquivo localmente)
    const logoUrl = opts?.logoUrl || (logoAsset as unknown as string);
    let embeddedLogo = logoUrl;
    try {
      const resp = await fetch(logoUrl, { cache: 'no-store' });
      const blob = await resp.blob();
      const reader = new FileReader();
      const base64: string = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      embeddedLogo = base64;
    } catch (_) {
      // Se falhar, usa a URL original
    }
    const content = this.exportToHTML(result, { ...opts, logoUrl: embeddedLogo });
    const filename = `calculo_${result.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    this.downloadFile(content, filename, 'text/html;charset=utf-8');
  }

  /**
   * Exporta diretamente como PDF (gera HTML e abre para impressão)
   */
  static async exportPDF(result: CalculationResult, opts?: { logoUrl?: string; primary?: string; primaryDark?: string }) {
    // Garantir logo embutido
    const logoUrl = opts?.logoUrl || (logoAsset as unknown as string);
    let embeddedLogo = logoUrl;
    try {
      const resp = await fetch(logoUrl, { cache: 'no-store' });
      const blob = await resp.blob();
      const reader = new FileReader();
      const base64: string = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      embeddedLogo = base64;
    } catch (_) {}

    const html = this.exportToHTML(result, { ...opts, logoUrl: embeddedLogo });

    // Criar nova janela e abrir para impressão (mais confiável)
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para esta ação.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Opcional: fechar após impressão (comentado para o usuário poder salvar como PDF)
        // printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };
  }
}

