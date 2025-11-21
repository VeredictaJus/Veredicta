/**
 * Serviço de Integração com API do Banco Central do Brasil
 * 
 * Fornece acesso aos índices econômicos oficiais para cálculos trabalhistas:
 * - IPCA-E (Índice de Preços ao Consumidor Amplo Especial)
 * - SELIC (Taxa básica de juros)
 * - TR (Taxa Referencial)
 * - Salário Mínimo
 * 
 * API Oficial: https://api.bcb.gov.br/
 * Documentação: https://dadosabertos.bcb.gov.br/
 */

export interface IndiceData {
  data: string;      // Data no formato DD/MM/YYYY
  valor: string;     // Valor do índice (percentual)
}

export interface SalarioMinimoData {
  data: string;
  valor: string;
}

export class BacenService {
  private static readonly BASE_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
  
  // Códigos das séries no Banco Central
  private static readonly SERIES = {
    IPCA_E: 433,           // IPCA-E (CNJ padrão desde 2015)
    SELIC: 11,             // Taxa SELIC
    TR: 226,               // Taxa Referencial
    SALARIO_MINIMO: 1619,  // Salário mínimo mensal
    IPCA: 433,             // IPCA mensal
    INPC: 188,             // INPC
  };

  /**
   * Formata data para o padrão da API do Bacen (DD/MM/YYYY)
   */
  private static formatDateToBacen(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Busca dados de uma série temporal do Banco Central
   */
  private static async fetchSerie(
    serieCode: number,
    dataInicio: string,
    dataFim: string
  ): Promise<IndiceData[]> {
    try {
      const url = `${this.BASE_URL}/${serieCode}/dados?formato=json&dataInicial=${dataInicio}&dataFinal=${dataFim}`;
      
      console.log(`🏦 Buscando dados do Bacen: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: IndiceData[] = await response.json();
      
      console.log(`✅ Recebidos ${data.length} registros do Bacen`);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do Bacen:', error);
      throw new Error(`Falha ao buscar dados do Banco Central: ${error}`);
    }
  }

  /**
   * Busca índices IPCA-E para correção monetária
   * Padrão TST desde 25/03/2015
   */
  static async getIPCAE(dataInicio: Date | string, dataFim: Date | string): Promise<IndiceData[]> {
    const inicio = this.formatDateToBacen(dataInicio);
    const fim = this.formatDateToBacen(dataFim);
    
    return this.fetchSerie(this.SERIES.IPCA_E, inicio, fim);
  }

  /**
   * Busca taxa SELIC
   * Usada para juros em alguns casos específicos
   */
  static async getSELIC(dataInicio: Date | string, dataFim: Date | string): Promise<IndiceData[]> {
    const inicio = this.formatDateToBacen(dataInicio);
    const fim = this.formatDateToBacen(dataFim);
    
    return this.fetchSerie(this.SERIES.SELIC, inicio, fim);
  }

  /**
   * Busca Taxa Referencial (TR)
   * Usada até 25/03/2015 (antes do IPCA-E)
   */
  static async getTR(dataInicio: Date | string, dataFim: Date | string): Promise<IndiceData[]> {
    const inicio = this.formatDateToBacen(dataInicio);
    const fim = this.formatDateToBacen(dataFim);
    
    return this.fetchSerie(this.SERIES.TR, inicio, fim);
  }

  /**
   * Busca histórico de salário mínimo
   */
  static async getSalarioMinimo(dataInicio: Date | string, dataFim: Date | string): Promise<SalarioMinimoData[]> {
    const inicio = this.formatDateToBacen(dataInicio);
    const fim = this.formatDateToBacen(dataFim);
    
    return this.fetchSerie(this.SERIES.SALARIO_MINIMO, inicio, fim) as Promise<SalarioMinimoData[]>;
  }

  /**
   * Busca o salário mínimo vigente em uma data específica
   */
  static async getSalarioMinimoNaData(data: Date | string): Promise<number> {
    const dataFormatada = this.formatDateToBacen(data);
    
    try {
      const historico = await this.getSalarioMinimo(data, data);
      
      if (historico && historico.length > 0) {
        return parseFloat(historico[0].valor);
      }
      
      // Fallback: retornar salário mínimo atual (2024)
      console.warn('⚠️ Não encontrou salário mínimo na data, usando valor atual');
      return 1412.00;
    } catch (error) {
      console.error('❌ Erro ao buscar salário mínimo:', error);
      return 1412.00; // Fallback
    }
  }

  /**
   * Aplica correção monetária em um valor
   * 
   * @param valorInicial Valor a ser corrigido
   * @param dataInicio Data inicial
   * @param dataFim Data final
   * @param indice Índice a ser usado ('IPCA-E', 'TR', 'IPCA')
   * @returns Valor corrigido e detalhamento mês a mês
   */
  static async aplicarCorrecaoMonetaria(
    valorInicial: number,
    dataInicio: Date | string,
    dataFim: Date | string,
    indice: 'IPCA-E' | 'TR' | 'IPCA' = 'IPCA-E'
  ): Promise<{
    valorCorrigido: number;
    valorInicial: number;
    totalCorrecao: number;
    percentualTotal: number;
    detalhamento: Array<{
      mes: string;
      indice: number;
      valorAcumulado: number;
    }>;
  }> {
    console.log(`📊 Aplicando correção ${indice} de ${dataInicio} até ${dataFim}`);
    
    // Buscar índices do período
    let indices: IndiceData[] = [];
    
    switch (indice) {
      case 'IPCA-E':
        indices = await this.getIPCAE(dataInicio, dataFim);
        break;
      case 'TR':
        indices = await this.getTR(dataInicio, dataFim);
        break;
      case 'IPCA':
        indices = await this.getIPCAE(dataInicio, dataFim); // Mesmo código
        break;
    }
    
    // Aplicar correção mês a mês
    let valorCorrigido = valorInicial;
    const detalhamento: Array<{ mes: string; indice: number; valorAcumulado: number }> = [];
    
    for (const item of indices) {
      const percentual = parseFloat(item.valor);
      valorCorrigido = valorCorrigido * (1 + percentual / 100);
      
      detalhamento.push({
        mes: item.data,
        indice: percentual,
        valorAcumulado: valorCorrigido,
      });
    }
    
    const totalCorrecao = valorCorrigido - valorInicial;
    const percentualTotal = ((valorCorrigido / valorInicial) - 1) * 100;
    
    console.log(`✅ Correção aplicada: R$ ${valorInicial.toFixed(2)} → R$ ${valorCorrigido.toFixed(2)} (${percentualTotal.toFixed(2)}%)`);
    
    return {
      valorCorrigido,
      valorInicial,
      totalCorrecao,
      percentualTotal,
      detalhamento,
    };
  }

  /**
   * Calcula juros de mora
   * 
   * @param valor Valor principal
   * @param dataInicio Data inicial
   * @param dataFim Data final
   * @param taxa Taxa mensal (padrão: 1% ao mês)
   * @param tipo 'SIMPLES' ou 'COMPOSTO'
   * @returns Valor dos juros
   */
  static calcularJurosMora(
    valor: number,
    dataInicio: Date | string,
    dataFim: Date | string,
    taxa: number = 1, // 1% ao mês (padrão trabalhista)
    tipo: 'SIMPLES' | 'COMPOSTO' = 'SIMPLES'
  ): {
    valorJuros: number;
    valorTotal: number;
    meses: number;
    taxaMensal: number;
  } {
    // Calcular número de meses
    const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;
    
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const meses = Math.floor(diffDays / 30); // Aproximação
    
    let valorJuros = 0;
    
    if (tipo === 'SIMPLES') {
      // Juros simples: J = C × i × t
      valorJuros = valor * (taxa / 100) * meses;
    } else {
      // Juros compostos: M = C × (1 + i)^t
      const montante = valor * Math.pow(1 + taxa / 100, meses);
      valorJuros = montante - valor;
    }
    
    const valorTotal = valor + valorJuros;
    
    console.log(`💰 Juros ${tipo}: ${meses} meses × ${taxa}% = R$ ${valorJuros.toFixed(2)}`);
    
    return {
      valorJuros,
      valorTotal,
      meses,
      taxaMensal: taxa,
    };
  }
}










