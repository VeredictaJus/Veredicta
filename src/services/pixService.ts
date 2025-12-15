import { supabase } from '@/lib/supabase';

export interface PixPaymentData {
  pixCode: string;
  qrCodeImage: string;
  amount: number;
  expiresAt: number;
  paymentId: string;
}

export class PixService {
  /**
   * Cria uma sessão de pagamento PIX
   */
  static async createPixPayment(
    planId: string,
    amount: number,
    userId: string,
    userEmail?: string
  ): Promise<PixPaymentData> {
    try {
      // Simular geração de PIX (em produção, integrar com provedor real)
      const pixCode = this.generatePixCode(amount, planId);
      const qrCodeImage = this.generateQrCodeImage(pixCode);
      const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutos
      
      // Salvar no banco de dados
      const { data: payment, error } = await supabase
        .from('stripe_payments')
        .insert({
          user_id: userId,
          plan_code: planId,
          amount: Math.round(amount * 100), // Converter para centavos
          currency: 'brl',
          status: 'pending',
          payment_method: 'pix',
          metadata: {
            pix_code: pixCode,
            expires_at: expiresAt,
            user_email: userEmail
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar pagamento PIX: ${error.message}`);
      }

      return {
        pixCode,
        qrCodeImage,
        amount,
        expiresAt,
        paymentId: payment.id
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  /**
   * Verifica status do pagamento PIX
   */
  static async checkPixPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'completed' | 'expired' | 'failed';
    payment?: any;
  }> {
    try {
      const { data: payment, error } = await supabase
        .from('stripe_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        throw new Error(`Erro ao verificar pagamento: ${error.message}`);
      }

      // Verificar se expirou
      const now = Date.now();
      const expiresAt = payment.metadata?.expires_at || 0;
      
      if (now > expiresAt && payment.status === 'pending') {
        // Marcar como expirado
        await supabase
          .from('stripe_payments')
          .update({ status: 'expired' })
          .eq('id', paymentId);
        
        return { status: 'expired', payment };
      }

      return { status: payment.status, payment };
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error);
      throw error;
    }
  }

  /**
   * Simula confirmação de pagamento PIX (em produção, usar webhook)
   */
  static async confirmPixPayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stripe_payments')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        throw new Error(`Erro ao confirmar pagamento: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao confirmar pagamento PIX:', error);
      return false;
    }
  }

  /**
   * Gera código PIX simulado
   */
  private static generatePixCode(amount: number, planId: string): string {
    // Em produção, usar API real do provedor de pagamento
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `00020126580014br.gov.bcb.pix0136${random}${timestamp}520400005303986540${amount.toFixed(2)}5802BR5913VEREDICTA LTDA6009SAO PAULO62070503***6304`;
  }

  /**
   * Gera QR Code simulado
   */
  private static generateQrCodeImage(pixCode: string): string {
    // Em produção, usar biblioteca real de QR Code
    // Por enquanto, retornar uma imagem placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="black"/>
        <rect x="20" y="20" width="160" height="160" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12" fill="black">PIX QR CODE</text>
        <text x="100" y="120" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${pixCode.substring(0, 20)}...</text>
      </svg>
    `)}`;
  }

  /**
   * Formata valor para exibição
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}




















