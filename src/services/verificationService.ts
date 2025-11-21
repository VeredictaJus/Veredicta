/**
 * Serviço de verificação de documentos
 * - CNPJ via BrasilAPI (automático)
 * - CPF validação de formato
 * - OAB manual via site oficial
 */

export interface CNPJVerificationResult {
  valid: boolean;
  companyName?: string;
  status?: string;
  city?: string;
  state?: string;
  foundingDate?: string;
  error?: string;
}

export interface CPFValidationResult {
  valid: boolean;
  formatted?: string;
  error?: string;
}

export interface OABValidationResult {
  valid: boolean;
  verificationUrl: string;
  message: string;
}

export class VerificationService {
  /**
   * Verifica CNPJ via BrasilAPI
   * Retorna dados completos da Receita Federal
   */
  static async verifyCNPJ(cnpj: string): Promise<CNPJVerificationResult> {
    try {
      // Remove formatação
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      
      if (cleanCNPJ.length !== 14) {
        return { 
          valid: false, 
          error: 'CNPJ deve ter 14 dígitos' 
        };
      }

      // Chama BrasilAPI
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { 
            valid: false, 
            error: 'CNPJ não encontrado na Receita Federal' 
          };
        }
        throw new Error('Erro ao consultar CNPJ');
      }

      const data = await response.json();
      
      console.log('✅ CNPJ verificado via BrasilAPI:', data);

      return {
        valid: data.situacao_cadastral === 'ATIVA',
        companyName: data.razao_social || data.nome_fantasia,
        status: data.situacao_cadastral,
        city: data.municipio,
        state: data.uf,
        foundingDate: data.data_inicio_atividade,
      };
    } catch (error: any) {
      console.error('❌ Erro ao verificar CNPJ:', error);
      return { 
        valid: false, 
        error: error.message || 'Erro ao verificar CNPJ. Tente novamente.' 
      };
    }
  }

  /**
   * Valida formato de CPF (algoritmo dos dígitos verificadores)
   * NÃO verifica se CPF existe (não há API pública gratuita)
   */
  static validateCPF(cpf: string): CPFValidationResult {
    try {
      // Remove formatação
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (cleanCPF.length !== 11) {
        return { 
          valid: false, 
          error: 'CPF deve ter 11 dígitos' 
        };
      }

      // Verifica se não é sequência repetida (111.111.111-11, etc)
      if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return { 
          valid: false, 
          error: 'CPF inválido' 
        };
      }

      // Validação dos dígitos verificadores
      let soma = 0;
      let resto;

      // Valida primeiro dígito
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cleanCPF.substring(9, 10))) {
        return { 
          valid: false, 
          error: 'CPF inválido' 
        };
      }

      // Valida segundo dígito
      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cleanCPF.substring(10, 11))) {
        return { 
          valid: false, 
          error: 'CPF inválido' 
        };
      }

      // Formata CPF
      const formatted = cleanCPF.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );

      return { 
        valid: true, 
        formatted 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Erro ao validar CPF' 
      };
    }
  }

  /**
   * Valida formato de número OAB
   * Retorna URL para verificação manual no site oficial
   */
  static validateOAB(oabNumber: string, state: string): OABValidationResult {
    try {
      // Remove formatação
      const cleanOAB = oabNumber.replace(/\D/g, '');
      
      // OAB geralmente tem 4-6 dígitos
      if (cleanOAB.length < 4 || cleanOAB.length > 6) {
        return {
          valid: false,
          verificationUrl: 'https://confirmadv.oab.org.br/',
          message: 'Número de OAB deve ter entre 4 e 6 dígitos'
        };
      }

      // Estado deve ter 2 letras
      if (!state || state.length !== 2) {
        return {
          valid: false,
          verificationUrl: 'https://confirmadv.oab.org.br/',
          message: 'Estado da OAB inválido (use sigla: SP, RJ, etc)'
        };
      }

      return {
        valid: true,
        verificationUrl: 'https://confirmadv.oab.org.br/',
        message: 'Formato válido. Verificação manual necessária.'
      };
    } catch (error) {
      return {
        valid: false,
        verificationUrl: 'https://confirmadv.oab.org.br/',
        message: 'Erro ao validar OAB'
      };
    }
  }

  /**
   * Detecta se string é CPF ou CNPJ
   */
  static detectDocumentType(value: string): 'cpf' | 'cnpj' | null {
    const clean = value.replace(/\D/g, '');
    
    if (clean.length === 11) return 'cpf';
    if (clean.length === 14) return 'cnpj';
    return null;
  }

  /**
   * Formata CPF ou CNPJ automaticamente
   */
  static formatDocument(value: string): string {
    const clean = value.replace(/\D/g, '');
    
    // CPF: 123.456.789-00
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // CNPJ: 12.345.678/0001-90
    if (clean.length === 14) {
      return clean.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }
    
    return value;
  }
}














