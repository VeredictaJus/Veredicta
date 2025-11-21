import { supabase } from '@/lib/supabase';

export interface DocumentValidationResult {
  canUseFreePlan: boolean;
  message: string;
  error?: string;
  documentType?: 'CPF' | 'CNPJ';
}

export class FreePlanDocumentService {
  /**
   * Verifica se um documento (CPF ou CNPJ) pode usar o plano Free (uma vez por documento)
   */
  static async validateDocumentForFreePlan(document: string): Promise<DocumentValidationResult> {
    try {
      // Formatar documento (remover pontos, traços e barras)
      const formattedDocument = document.replace(/[^\d]/g, '');
      
      // Determinar tipo do documento e validar formato
      let documentType: 'CPF' | 'CNPJ';
      let isValidFormat: boolean;
      let displayDocument: string;

      if (formattedDocument.length === 11) {
        // CPF
        documentType = 'CPF';
        isValidFormat = this.isValidCPFFormat(formattedDocument);
        displayDocument = this.formatCPF(formattedDocument);
      } else if (formattedDocument.length === 14) {
        // CNPJ
        documentType = 'CNPJ';
        isValidFormat = this.isValidCNPJFormat(formattedDocument);
        displayDocument = this.formatCNPJ(formattedDocument);
      } else {
        return {
          canUseFreePlan: false,
          message: 'Documento inválido. Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.',
          error: 'FORMAT_ERROR'
        };
      }

      if (!isValidFormat) {
        return {
          canUseFreePlan: false,
          message: `${documentType} inválido`,
          error: 'FORMAT_ERROR',
          documentType
        };
      }

      // Verificar se documento já foi usado
      const { data, error } = await supabase.rpc('check_free_plan_document_usage', {
        document_input: displayDocument
      });

      if (error) {
        console.error('Erro ao verificar documento:', error);
        return {
          canUseFreePlan: false,
          message: 'Erro interno. Tente novamente.',
          error: 'DATABASE_ERROR',
          documentType
        };
      }

      if (data) {
        return {
          canUseFreePlan: false,
          message: `Este ${documentType} (${displayDocument}) já utilizou o plano gratuito. Cada documento pode usar o plano Free apenas uma vez.`,
          error: 'DOCUMENT_ALREADY_USED',
          documentType
        };
      }

      return {
        canUseFreePlan: true,
        message: `${documentType} válido para usar o plano Free`,
        documentType
      };

    } catch (error) {
      console.error('Erro na validação do documento:', error);
      return {
        canUseFreePlan: false,
        message: 'Erro interno. Tente novamente.',
        error: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Registra o uso do plano Free por um documento (CPF ou CNPJ)
   */
  static async registerFreePlanUsage(document: string, userId: string): Promise<boolean> {
    try {
      const formattedDocument = document.replace(/[^\d]/g, '');
      let displayDocument: string;
      let documentType: 'CPF' | 'CNPJ';

      if (formattedDocument.length === 11) {
        documentType = 'CPF';
        displayDocument = this.formatCPF(formattedDocument);
      } else if (formattedDocument.length === 14) {
        documentType = 'CNPJ';
        displayDocument = this.formatCNPJ(formattedDocument);
      } else {
        return false;
      }

      const { data, error } = await supabase.rpc('register_free_plan_document_usage', {
        document_input: displayDocument,
        document_type_input: documentType,
        user_id_input: userId
      });

      if (error) {
        console.error('Erro ao registrar uso do plano Free:', error);
        return false;
      }

      return data === true;

    } catch (error) {
      console.error('Erro ao registrar uso do plano Free:', error);
      return false;
    }
  }

  /**
   * Valida o formato do CPF
   */
  private static isValidCPFFormat(cpf: string): boolean {
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se não são todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  /**
   * Valida o formato do CNPJ
   */
  private static isValidCNPJFormat(cnpj: string): boolean {
    // Verificar se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verificar se não são todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cnpj.charAt(12))) return false;
    
    // Validar segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(cnpj.charAt(13))) return false;
    
    return true;
  }

  /**
   * Formata CPF para exibição (XXX.XXX.XXX-XX)
   */
  private static formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
   */
  private static formatCNPJ(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Obtém estatísticas de uso do plano Free (apenas para admins)
   */
  static async getFreePlanStats(): Promise<{ totalUsers: number; recentUsers: any[]; cpfCount: number; cnpjCount: number } | null> {
    try {
      const { data, error } = await supabase
        .from('free_plan_document_control')
        .select('*')
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      const cpfCount = data?.filter(item => item.document_type === 'CPF').length || 0;
      const cnpjCount = data?.filter(item => item.document_type === 'CNPJ').length || 0;

      return {
        totalUsers: data?.length || 0,
        recentUsers: data?.slice(0, 10) || [],
        cpfCount,
        cnpjCount
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }
}
